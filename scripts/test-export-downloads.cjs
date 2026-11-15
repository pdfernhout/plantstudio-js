const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");
const { unzipSync } = require("fflate");
const assimpjs = require("assimpjs");

// Run after npm ci and npx playwright install chromium:
//   npm run test:exports
// PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH optionally selects an existing Chromium.
// Downloads, a screenshot, and importer results are retained in a temp directory.

async function main() {
    const root = path.resolve(__dirname, "..");
    const output = await fs.mkdtemp(path.join(os.tmpdir(), "plantstudio-exports-"));
    const server = http.createServer(async (request, response) => {
        try {
            const file = path.resolve(root, "." + decodeURIComponent(new URL(request.url, "http://localhost").pathname));
            if (!file.startsWith(root + path.sep)) throw new Error("Outside repository");
            const type = { ".js": "text/javascript", ".html": "text/html", ".css": "text/css" }[path.extname(file)];
            response.setHeader("Content-Type", type || "application/octet-stream");
            response.end(await fs.readFile(file));
        } catch {
            response.statusCode = 404;
            response.end("Not found");
        }
    });
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
                ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
        });
        const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, acceptDownloads: true });
        const errors = [];
        const dialogs = [];
        const downloads = [];
        page.on("download", download => downloads.push(download.suggestedFilename()));
        page.on("pageerror", error => errors.push(error.message));
        page.on("console", message => {
            if (message.text().startsWith("Exception")) errors.push(message.text());
        });
        page.on("dialog", async dialog => { dialogs.push(dialog.message()); await dialog.dismiss(); });
        await page.goto(`http://127.0.0.1:${server.address().port}/dist/source/index.html`);
        await page.waitForFunction(() => document.body.innerText.includes("UUID:"));
        // Open is still a separate unfinished workflow. Load a checked-in plant
        // through the real loader, then exercise export through its visible UI.
        const fixture = await page.evaluate(async () => {
            const { domain } = await SystemJS.import("PdDomain.js");
            const { MainForm } = await SystemJS.import("FormHolder.js");
            const m = await SystemJS.import("mithril");
            const contents = await (await fetch("/plants/test.pla")).text();
            domain.plantManager.loadPlantsFromFile("test.pla", false, contents);
            MainForm.plants = domain.plantManager.plants;
            MainForm.selectedPlants = [MainForm.plants[0]];
            domain.plantFileLoaded = true;
            MainForm.updateForPlantFile();
            m.redraw();
            return MainForm.plants.map(plant => ({ name: plant.name, age: plant.age }));
        });
        console.log("fixture", fixture);
        const optionsBeforeCancel = await page.evaluate(async () => {
            const { domain } = await SystemJS.import("PdDomain.js");
            return JSON.stringify(domain.exportOptionsFor3D);
        });
        await page.locator(".MainForm .sticky .b").filter({ hasText: /^Export$/ }).click();
        await page.locator("#droppedDownMenu .menuItem").filter({ hasText: "OBJ..." }).click();
        await page.locator(".Generic3DOptionsForm input.stemCylinderFaces").fill("11");
        await page.locator(".Generic3DOptionsForm").getByRole("button", { name: "Cancel", exact: true }).click();
        await page.locator(".Generic3DOptionsForm").waitFor({ state: "detached" });
        assert.equal(await page.evaluate(async () => {
            const { domain } = await SystemJS.import("PdDomain.js");
            return JSON.stringify(domain.exportOptionsFor3D);
        }), optionsBeforeCancel, "Cancel changed saved export options");
        assert.deepEqual(downloads, [], "Cancel triggered a download");
        const importer = await assimpjs();
        const results = [];
        for (const format of ["OBJ", "3DS", "LWO", "DXF", "POV INC", "VRML"]) {
            await page.locator(".MainForm .sticky .b").filter({ hasText: /^Export$/ }).click();
            await page.locator("#droppedDownMenu .menuItem").filter({ hasText: `${format}...` }).click();
            const form = page.locator(".Generic3DOptionsForm");
            await form.waitFor();
            if (format === "OBJ") {
                await form.locator(".writeColors input").check();
            }
            const pending = page.waitForEvent("download", { timeout: 30000 });
            await form.getByRole("button", { name: "Save", exact: true }).click();
            const download = await pending;
            const name = download.suggestedFilename();
            await download.saveAs(path.join(output, name));
            assert.equal(await download.failure(), null);
            const bytes = new Uint8Array(await fs.readFile(path.join(output, name)));
            assert.ok(bytes.length > 100, `${format}: empty download`);
            let files = { [name]: bytes };
            if (name.endsWith(".zip")) {
                files = unzipSync(bytes);
                assert.deepEqual(Object.keys(files).sort(), ["plants1.mtl", "plants1.obj"]);
                const obj = new TextDecoder().decode(files["plants1.obj"]);
                const mtl = new TextDecoder().decode(files["plants1.mtl"]);
                assert.ok(obj.includes("mtllib plants1.mtl"));
                const used = [...obj.matchAll(/^usemtl (.+)$/gm)].map(match => match[1].trim());
                const defined = new Set([...mtl.matchAll(/^newmtl (.+)$/gm)].map(match => match[1].trim()));
                assert.ok(used.length > 0);
                for (const material of used) assert.ok(defined.has(material), `Missing material ${material}`);
            }
            const result = { format, name, bytes: bytes.length };
            if (["OBJ", "3DS", "LWO", "DXF"].includes(format)) {
                const list = new importer.FileList();
                for (const [fileName, contents] of Object.entries(files)) list.AddFile(fileName, contents);
                const converted = importer.ConvertFileList(list, "assjson");
                assert.ok(converted.IsSuccess(), `${format}: Assimp error ${converted.GetErrorCode()}`);
                const model = JSON.parse(new TextDecoder().decode(converted.GetFile(0).GetContent()));
                assert.ok(model.meshes?.length > 0, `${format}: no imported meshes`);
                result.meshes = model.meshes.length;
                result.faces = model.meshes.reduce((sum, mesh) => sum + mesh.faces.length, 0);
                assert.ok(result.meshes > 0 && result.faces > 0, `${format}: no imported geometry`);
                for (const mesh of model.meshes) assert.ok(mesh.vertices.every(Number.isFinite));
            } else {
                const text = new TextDecoder().decode(bytes);
                assert.ok(!/\b(?:NaN|Infinity|undefined)\b/.test(text));
                assert.ok(format === "VRML" ? text.startsWith("#VRML") : text.includes("triangle {"));
            }
            results.push(result);
            console.log(result);
        }
        assert.equal(downloads.length, 6);
        assert.deepEqual(errors, []);
        assert.deepEqual(dialogs, []);
        await page.screenshot({ path: path.join(output, "after-exports.png") });
        await fs.writeFile(path.join(output, "results.json"), JSON.stringify({
            browser: await browser.version(),
            assimpjs: require("assimpjs/package.json").version,
            fixture,
            results,
        }, null, 2));
        console.log(`Saved downloads and results in ${output}`);
    } finally {
        if (browser) await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
