import * as o from "ospec"
import { PdDomain, domain, kIncludeVisiblePlants } from "../source/PdDomain"
import { Axis, ExportFormats } from "../source/U3dexport"
import { TGeneric3DOptionsForm } from "../source/TGeneric3DOptionsForm"

function descendants(value: any): any[] {
    if (Array.isArray(value)) {
        const result: any[] = []
        for (const child of value) result.push(...descendants(child))
        return result
    }
    if (!value || typeof value !== "object") return []
    return [value, ...descendants(value.children)]
}

function openForm(outputType: ExportFormats): TGeneric3DOptionsForm {
    const form = new TGeneric3DOptionsForm()
    form.oninit({ attrs: {
        outputType,
        options: domain.exportOptionsFor3D[outputType],
        close() {},
    } })
    return form
}

o.spec("3D export options", () => {
    o.beforeEach(() => { PdDomain.createDefault() })

    o("initializes plant selection and compression direction from a private copy", () => {
        const original = domain.exportOptionsFor3D[ExportFormats.kOBJ]
        original.exportType = kIncludeVisiblePlants
        original.directionToPressPlants = Axis.kZ
        const form = openForm(ExportFormats.kOBJ)
        o(form.useSelectedPlants).equals(false)
        o(form.useVisiblePlants).equals(true)
        o(form.directionToPressPlants_Selected).equals("z")
        form.options.overallScalingFactor_pct = 250
        o(original.overallScalingFactor_pct).notEquals(250)
    })

    o("records axis and double-sided control edits and reports changed options on acceptance", () => {
        const form = openForm(ExportFormats.kOBJ)
        form.useVisiblePlantsClick()
        const nodes = descendants(form.view())
        const axis = nodes.find(node => node.attrs?.className?.includes("directionToPressPlants"))
        const doubleSidedGroup = nodes.find(node => node.attrs?.className?.includes("makeTrianglesDoubleSided"))
        const doubleSided = descendants(doubleSidedGroup).find(node => node.tag === "input")
        axis.attrs.onchange({ target: { value: "y" } })
        doubleSided.attrs.onchange({ target: { checked: true } })
        let accepted: TGeneric3DOptionsForm | null = null
        form.close = result => { accepted = result }
        form.CloseClick()
        o(accepted).equals(form)
        o(form.options.directionToPressPlants).equals(Axis.kY)
        o(form.options.makeTrianglesDoubleSided).equals(true)
        o(form.options.exportType).equals(kIncludeVisiblePlants)
        o(form.optionsChanged).equals(true)
    })

    o("does not overwrite DXF palette choices during a render", () => {
        const original = domain.exportOptionsFor3D[ExportFormats.kDXF]
        original.dxf_plantPartColorIndexes.fill(2)
        const form = openForm(ExportFormats.kDXF)
        form.colorsByPlantPartView()
        o(form.options.dxf_plantPartColorIndexes).deepEquals(original.dxf_plantPartColorIndexes)
    })
})
