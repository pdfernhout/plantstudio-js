
// Exported from: ../../plantstudio-js/converted_source/unoted.lfm

import { m } from "mithril"
import { caption } from "common"

export function viewNoteEditForm() {
    return m("NoteEditForm.TNoteEditForm",
        {
        // Top: "214",
        // Left: "609",
        // Height: "294",
        // Width: "356",
        // Caption: "Edit note for plant",
        // Font.Charset: "DEFAULT_CHARSET",
        // Font.Color: "clWindowText",
        // Font.Height: "-11",
        // Font.Name: "MS Sans Serif",
        // Font.Style: "[]",
        // Position: "poScreenCenter",
        // OnCreate: "FormCreate",
        // OnResize: "FormResize",
        // PixelsPerInch: "96",
        // TextHeight: "13",
        },
        m("Group.Group.g00000002",
            m("textarea.noteEditMemo.TMemo",
                {
                    // Top: "2",
                    // Left: "2",
                    // Height: "261",
                    // Width: "259",
                    // ScrollBars: "ssVertical",
                    // TabOrder: "0",
                },
            ),
            m("button.OK.TButton",
                {
                    // Top: "2",
                    // Left: "265",
                    // Height: "21",
                    // Width: "80",
                    // ModalResult: "1",
                    // TabOrder: "1",
                },
                caption("&OK"),
            ),
        ),
        m("button.cancel.TButton",
            {
                // Top: "25",
                // Left: "265",
                // Height: "21",
                // Width: "80",
                // Cancel: "True",
                // ModalResult: "2",
                // TabOrder: "2",
            },
            caption("&Cancel"),
        ),
        m("button.helpButton.TSpeedButton",
            {
                onclick: helpButtonClick,
                // Top: "64",
                // Left: "265",
                // Height: "21",
                // Width: "80",
                // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
            },
            caption("&Help"),
        ),
        m("label.checkbox-inline.wrapLines.TCheckBox", m("input[type=checkbox]",
            {
                onclick: wrapLinesClick,
                // Top: "92",
                // Left: "272",
                // Height: "17",
                // Width: "75",
                // TabOrder: "3",
            },),
            caption("&wrap lines"),
        ),
    )
}

function helpButtonClick() { console.log("helpButtonClick") }

function wrapLinesClick() { console.log("wrapLinesClick") }
