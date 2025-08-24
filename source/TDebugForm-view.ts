
// Exported from: ../../plantstudio-js/converted_source/udebug.lfm

import { m } from "mithril"
import { caption } from "common"

export function viewDebugForm() {
    return m("DebugForm.TDebugForm",
        {
        // Top: "308",
        // Left: "365",
        // Height: "0",
        // Width: "0",
        // AutoScroll: "False",
        // Caption: "Messages",
        // ClientHeight: "165",
        // ClientWidth: "427",
        // Font.Charset: "DEFAULT_CHARSET",
        // Font.Color: "clWindowText",
        // Font.Height: "-11",
        // Font.Name: "Arial",
        // Font.Style: "[]",
        // Position: "poDefaultPosOnly",
        // Scaled: "False",
        // OnCreate: "FormCreate",
        // OnDestroy: "FormDestroy",
        // OnResize: "FormResize",
        // PixelsPerInch: "96",
        // TextHeight: "14",
        },
        m("TListBox.DebugList.TListBox",
            {
                // Top: "-110",
                // Left: "-136",
                // Height: "249",
                // Width: "497",
                // Font.Charset: "DEFAULT_CHARSET",
                // Font.Color: "clWindowText",
                // Font.Height: "-11",
                // Font.Name: "Arial",
                // Font.Style: "[]",
                // ItemHeight: "14",
                // ParentFont: "False",
                // TabOrder: "0",
            },
        ),
        m("button.Close.TButton",
            {
                onclick: CloseClick,
                // Top: "4",
                // Left: "364",
                // Height: "21",
                // Width: "60",
                // Cancel: "True",
                // Default: "True",
                // TabOrder: "2",
            },
            caption("&Close"),
        ),
        m("button.saveListAs.TButton",
            {
                onclick: saveListAsClick,
                // Top: "39",
                // Left: "365",
                // Height: "21",
                // Width: "60",
                // TabOrder: "3",
            },
            caption("&Save as..."),
        ),
        m("button.clearList.TButton",
            {
                onclick: clearListClick,
                // Top: "63",
                // Left: "364",
                // Height: "21",
                // Width: "60",
                // TabOrder: "4",
            },
            caption("C&lear"),
        ),
        m("button.helpButton.TSpeedButton",
            {
                onclick: helpButtonClick,
                // Top: "99",
                // Left: "364",
                // Height: "25",
                // Width: "61",
                // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
            },
            caption("&Help"),
        ),
        m("button.supportButton.TButton",
            {
                onclick: supportButtonClick,
                // Top: "133",
                // Left: "364",
                // Height: "21",
                // Width: "60",
                // TabOrder: "5",
            },
            caption("&Info..."),
        ),
        m("div.optionsPanel.TPanel",
            {
                // Top: "140",
                // Left: "0",
                // Height: "25",
                // Width: "361",
                // BevelInner: "bvRaised",
                // BevelOuter: "bvLowered",
                // TabOrder: "1",
            },
            m("div.exceptionLabel.TLabel",
                {
                    // Top: "5",
                    // Left: "8",
                    // Height: "14",
                    // Width: "64",
                },
                "On message:",
            ),
            m("label.checkbox-inline.showOnExceptionCheckBox.TCheckBox", m("input[type=checkbox]",
                {
                    onclick: showOnExceptionCheckBoxClick,
                    // Top: "5",
                    // Left: "83",
                    // Height: "17",
                    // Width: "68",
                    // TabOrder: "0",
                },),
                caption("&appear"),
            ),
            m("label.checkbox-inline.logToFile.TCheckBox", m("input[type=checkbox]",
                {
                    onclick: logToFileClick,
                    // Top: "5",
                    // Left: "146",
                    // Height: "17",
                    // Width: "77",
                    // TabOrder: "1",
                },),
                caption("l&og to file"),
            ),
        ),
    )
}

function CloseClick() { console.log("CloseClick") }

function clearListClick() { console.log("clearListClick") }

function helpButtonClick() { console.log("helpButtonClick") }

function logToFileClick() { console.log("logToFileClick") }

function saveListAsClick() { console.log("saveListAsClick") }

function showOnExceptionCheckBoxClick() { console.log("showOnExceptionCheckBoxClick") }

function supportButtonClick() { console.log("supportButtonClick") }
