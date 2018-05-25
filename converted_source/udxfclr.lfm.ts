
// Exported from: ../../plantstudio-js/converted_source/udxfclr.lfm

import { m } from "mithril"
import { caption } from "common"

export function viewChooseDXFColorForm() {
    return m("ChooseDXFColorForm.TChooseDXFColorForm",
        {
        // Top: "127",
        // Left: "409",
        // Height: "0",
        // Width: "0",
        // BorderIcons: "[biSystemMenu, biMaximize]",
        // BorderStyle: "bsDialog",
        // Caption: "Choose DXF color",
        // ClientHeight: "62",
        // ClientWidth: "273",
        // Font.Charset: "DEFAULT_CHARSET",
        // Font.Color: "clWindowText",
        // Font.Height: "-11",
        // Font.Name: "Arial",
        // Font.Style: "[]",
        // Position: "poScreenCenter",
        // Scaled: "False",
        // OnActivate: "FormActivate",
        // PixelsPerInch: "96",
        // TextHeight: "14",
        },
        m("Group.Group.g00000004",
            m("TDrawGrid.colorsDrawGrid.TDrawGrid",
                {
                    // Top: "4",
                    // Left: "2",
                    // Height: "57",
                    // Width: "206",
                    // ColCount: "12",
                    // DefaultColWidth: "16",
                    // DefaultRowHeight: "54",
                    // FixedCols: "0",
                    // RowCount: "1",
                    // FixedRows: "0",
                    // Options: "[goFixedVertLine, goFixedHorzLine, goVertLine, goHorzLine]",
                    // ScrollBars: "ssNone",
                    // TabOrder: "0",
                    // OnDblClick: "colorsDrawGridDblClick",
                    // OnDrawCell: "colorsDrawGridDrawCell",
                    // OnSelectCell: "colorsDrawGridSelectCell",
                },
            ),
            m("button.Close.TButton",
                {
                    onclick: CloseClick,
                    // Top: "4",
                    // Left: "212",
                    // Height: "21",
                    // Width: "60",
                    // Default: "True",
                    // TabOrder: "1",
                },
                "OK",
            ),
        ),
        m("button.cancel.TButton",
            {
                onclick: cancelClick,
                // Top: "27",
                // Left: "212",
                // Height: "21",
                // Width: "60",
                // Cancel: "True",
                // TabOrder: "2",
            },
            "Cancel",
        ),
    )
}

function CloseClick() { console.log("CloseClick") }

function cancelClick() { console.log("cancelClick") }
