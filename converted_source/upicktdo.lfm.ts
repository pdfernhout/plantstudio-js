
// Exported from: ../../plantstudio-js/converted_source/upicktdo.lfm

import { m } from "mithril"
import { caption } from "common"

export function viewPickTdoForm() {
    return m("PickTdoForm.TPickTdoForm",
        {
        // Top: "210",
        // Left: "511",
        // Height: "377",
        // Width: "406",
        // Caption: "Choose a 3D object",
        // Font.Charset: "DEFAULT_CHARSET",
        // Font.Color: "clWindowText",
        // Font.Height: "-11",
        // Font.Name: "Arial",
        // Font.Style: "[]",
        // Position: "poScreenCenter",
        // Scaled: "False",
        // OnActivate: "FormActivate",
        // OnClose: "FormClose",
        // OnResize: "FormResize",
        // PixelsPerInch: "96",
        // TextHeight: "14",
        },
        m("select.tdos.TComboBox",
            {
                // Top: "2",
                // Left: "4",
                // Height: "22",
                // Width: "323",
                // Style: "csDropDownList",
                // DropDownCount: "12",
                // ItemHeight: "14",
                // TabOrder: "10",
                // OnChange: "tdosChange",
            },
        ),
        m("button.Close.TButton",
            {
                onclick: CloseClick,
                // Top: "4",
                // Left: "334",
                // Height: "21",
                // Width: "60",
                // Default: "True",
                // TabOrder: "2",
            },
            "OK",
        ),
        m("button.cancel.TButton",
            {
                onclick: cancelClick,
                // Top: "27",
                // Left: "334",
                // Height: "21",
                // Width: "60",
                // Cancel: "True",
                // TabOrder: "3",
            },
            "Cancel",
        ),
        m("TDrawGrid.grid.TDrawGrid",
            {
                // Top: "28",
                // Left: "4",
                // Height: "263",
                // Width: "323",
                // DefaultColWidth: "60",
                // DefaultRowHeight: "64",
                // DefaultDrawing: "False",
                // FixedCols: "0",
                // RowCount: "20",
                // FixedRows: "0",
                // Options: "[]",
                // ParentShowHint: "False",
                // ScrollBars: "ssVertical",
                // ShowHint: "True",
                // TabOrder: "0",
                // OnDblClick: "gridDblClick",
                // OnDrawCell: "gridDrawCell",
                // OnSelectCell: "gridSelectCell",
            },
        ),
        m("button.apply.TButton",
            {
                onclick: applyClick,
                // Top: "63",
                // Left: "334",
                // Height: "21",
                // Width: "59",
                // TabOrder: "4",
            },
            caption("&Apply"),
        ),
        m("button.newTdo.TButton",
            {
                onclick: newTdoClick,
                // Top: "99",
                // Left: "334",
                // Height: "21",
                // Width: "59",
                // TabOrder: "5",
            },
            caption("&New..."),
        ),
        m("button.editTdo.TButton",
            {
                onclick: editTdoClick,
                // Top: "123",
                // Left: "334",
                // Height: "21",
                // Width: "59",
                // TabOrder: "6",
            },
            caption("&Edit..."),
        ),
        m("button.copyTdo.TButton",
            {
                onclick: copyTdoClick,
                // Top: "147",
                // Left: "334",
                // Height: "21",
                // Width: "59",
                // TabOrder: "7",
            },
            caption("&Copy..."),
        ),
        m("button.deleteTdo.TButton",
            {
                onclick: deleteTdoClick,
                // Top: "173",
                // Left: "334",
                // Height: "19",
                // Width: "59",
                // TabOrder: "9",
            },
            caption("&Delete"),
        ),
        m("button.mover.TButton",
            {
                onclick: moverClick,
                // Top: "208",
                // Left: "334",
                // Height: "21",
                // Width: "59",
                // TabOrder: "8",
            },
            caption("&Mover..."),
        ),
        m("button.helpButton.TSpeedButton",
            {
                onclick: helpButtonClick,
                // Top: "245",
                // Left: "334",
                // Height: "21",
                // Width: "60",
                // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
            },
            caption("&Help"),
        ),
        m("TGroupBox.libraryGroupBox.TGroupBox",
            {
                // Top: "297",
                // Left: "4",
                // Height: "52",
                // Width: "321",
                // TabOrder: "1",
            },
            "Current library",
            m("button.sectionTdosChangeLibrary.TSpeedButton",
                {
                    onclick: sectionTdosChangeLibraryClick,
                    // Top: "19",
                    // Left: "228",
                    // Height: "25",
                    // Width: "85",
                    // Glyph.Data: "F6000000424DF6000000000000007600000028000000100000001000000001000400000000008000000000000000000000001000000010000000000000000000800000800000008080008000000080008000808000007F7F7F00BFBFBF000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF0080888888888888888088888888888888808800000800800880000BBB0888888880880BB00888888880888008888888888088888888888888808800000800800880000BBB0888888880880BB0088888888088800888888888808888888888888800000800800088880BBB0888888888880BB00888888888888008888888888888",
                },
                caption("&Change..."),
            ),
            m("input.libraryFileName.TEdit",
                {
                    // Top: "22",
                    // Left: "30",
                    // Height: "22",
                    // Width: "193",
                    // Color: "clBtnFace",
                    // ReadOnly: "True",
                    // TabOrder: "0",
                },
            ),
            m("img.fileChangedImage.TImage",
                {
                    // Top: "24",
                    // Left: "8",
                    // Height: "16",
                    // Width: "16",
                    // AutoSize: "True",
                    // Picture.Data: "07544269746D6170F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888777888888888888788788888888888788878888888888788878888888888788878888888888788878888888888788878888888888788878888888888788878888888888788878888888888787878888888888777878888888888788778888888888878878888888888888778888888888888",
                    // Transparent: "True",
                },
            ),
        ),
    )
}

function CloseClick() { console.log("CloseClick") }

function applyClick() { console.log("applyClick") }

function cancelClick() { console.log("cancelClick") }

function copyTdoClick() { console.log("copyTdoClick") }

function deleteTdoClick() { console.log("deleteTdoClick") }

function editTdoClick() { console.log("editTdoClick") }

function helpButtonClick() { console.log("helpButtonClick") }

function moverClick() { console.log("moverClick") }

function newTdoClick() { console.log("newTdoClick") }

function sectionTdosChangeLibraryClick() { console.log("sectionTdosChangeLibraryClick") }
