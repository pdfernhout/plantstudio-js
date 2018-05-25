
// Exported from: ../../plantstudio-js/converted_source/uprginfo.lfm

import { m } from "mithril"
import { caption } from "common"

export function viewProgramInfoForm() {
    return m("ProgramInfoForm.TProgramInfoForm",
        {
        // Top: "266",
        // Left: "310",
        // Height: "0",
        // Width: "0",
        // AutoScroll: "False",
        // Caption: "Program Information",
        // ClientHeight: "301",
        // ClientWidth: "450",
        // Font.Charset: "DEFAULT_CHARSET",
        // Font.Color: "clWindowText",
        // Font.Height: "-11",
        // Font.Name: "MS Sans Serif",
        // Font.Style: "[]",
        // Position: "poScreenCenter",
        // Scaled: "False",
        // OnCreate: "FormCreate",
        // OnResize: "FormResize",
        // PixelsPerInch: "96",
        // TextHeight: "13",
        },
        m("textarea.infoList.TMemo",
            {
                // Top: "2",
                // Left: "2",
                // Height: "295",
                // Width: "323",
                // Lines.Strings: ["infoList"],
                // ScrollBars: "ssVertical",
                // TabOrder: "3",
            },
        ),
        m("button.Close.TButton",
            {
                onclick: CloseClick,
                // Top: "4",
                // Left: "332",
                // Height: "21",
                // Width: "113",
                // Cancel: "True",
                // TabOrder: "0",
            },
            caption("&Close"),
        ),
        m("button.copyToClipboard.TButton",
            {
                onclick: copyToClipboardClick,
                // Top: "55",
                // Left: "332",
                // Height: "21",
                // Width: "113",
                // Cancel: "True",
                // TabOrder: "2",
            },
            caption("Copy to Cli&pboard"),
        ),
        m("button.saveListAs.TButton",
            {
                onclick: saveListAsClick,
                // Top: "83",
                // Left: "332",
                // Height: "21",
                // Width: "113",
                // TabOrder: "1",
            },
            caption("&Save as..."),
        ),
        m("button.helpButton.TSpeedButton",
            {
                onclick: helpButtonClick,
                // Top: "135",
                // Left: "332",
                // Height: "25",
                // Width: "113",
                // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
            },
            caption("&Help"),
        ),
    )
}

function CloseClick() { console.log("CloseClick") }

function copyToClipboardClick() { console.log("copyToClipboardClick") }

function helpButtonClick() { console.log("helpButtonClick") }

function saveListAsClick() { console.log("saveListAsClick") }
