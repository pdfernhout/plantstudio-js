
// Exported from: ../../plantstudio-js/converted_source/Uundo.lfm

import * as m from "mithril"
import { caption } from "./common"

export function viewUndoRedoListForm() {
    return m("UndoRedoListForm.TUndoRedoListForm",
        {
        // Top: "254",
        // Left: "384",
        // Height: "0",
        // Width: "0",
        // AutoScroll: "False",
        // Caption: "Undo/Redo List",
        // ClientHeight: "255",
        // ClientWidth: "467",
        // Font.Charset: "DEFAULT_CHARSET",
        // Font.Color: "clWindowText",
        // Font.Height: "-11",
        // Font.Name: "MS Sans Serif",
        // Font.Style: "[]",
        // Position: "poDefaultPosOnly",
        // Scaled: "False",
        // OnClose: "FormClose",
        // OnCreate: "FormCreate",
        // OnResize: "FormResize",
        // PixelsPerInch: "96",
        // TextHeight: "13",
        },
        m("Group.Group.g00000004",
            m("div.undoListLabel.TLabel",
                {
                    // Top: "4",
                    // Left: "4",
                    // Height: "13",
                    // Width: "102",
                },
                caption("Things you can &Undo"),
            ),
            m("button.OK.TButton",
                {
                    onclick: OKClick,
                    // Top: "4",
                    // Left: "385",
                    // Height: "21",
                    // Width: "80",
                    // TabOrder: "0",
                },
                caption("Un&do/Redo"),
            ),
        ),
        m("TListBox.undoList.TListBox",
            {
                onclick: regulateListSelections,
                // Top: "20",
                // Left: "4",
                // Height: "97",
                // Width: "375",
                // ItemHeight: "13",
                // MultiSelect: "True",
                // TabOrder: "2",
            },
        ),
        m("button.cancel.TButton",
            {
                onclick: cancelClick,
                // Top: "30",
                // Left: "385",
                // Height: "21",
                // Width: "80",
                // TabOrder: "1",
            },
            caption("&Cancel"),
        ),
        m("button.helpButton.TSpeedButton",
            {
                onclick: helpButtonClick,
                // Top: "69",
                // Left: "385",
                // Height: "25",
                // Width: "80",
                // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
            },
            caption("&Help"),
        ),
        m("div.redoListLabel.TLabel",
            {
                // Top: "122",
                // Left: "4",
                // Height: "13",
                // Width: "102",
            },
            caption("Things you can &Redo"),
        ),
        m("TListBox.redoList.TListBox",
            {
                onclick: regulateListSelections,
                // Top: "140",
                // Left: "4",
                // Height: "107",
                // Width: "373",
                // ItemHeight: "13",
                // MultiSelect: "True",
                // TabOrder: "3",
            },
        ),
    )
}

function OKClick() { console.log("OKClick") }

function cancelClick() { console.log("cancelClick") }

function helpButtonClick() { console.log("helpButtonClick") }

function regulateListSelections() { console.log("regulateListSelections") }
