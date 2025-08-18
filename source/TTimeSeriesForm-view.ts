
// Exported from: ../../plantstudio-js/converted_source/utimeser.lfm

import { m } from "mithril"
import { caption } from "common"

export function viewTimeSeriesForm() {
    return m("TimeSeriesForm.TTimeSeriesForm",
        {
        // Top: "184",
        // Left: "366",
        // Height: "119",
        // Width: "520",
        // Caption: "Time series",
        // Font.Charset: "DEFAULT_CHARSET",
        // Font.Color: "clWindowText",
        // Font.Height: "-11",
        // Font.Name: "Arial",
        // Font.Style: "[]",
        // Menu: "MainMenu1",
        // Position: "poScreenCenter",
        // Scaled: "False",
        // OnActivate: "FormActivate",
        // OnCreate: "FormCreate",
        // OnDestroy: "FormDestroy",
        // OnResize: "FormResize",
        // PixelsPerInch: "96",
        // TextHeight: "14",
        },
        m("TMainMenu.MainMenu1.TMainMenu",
            {
                // Top: "2",
                // Left: "478",
                // Height: "0",
                // Width: "0",
            },
            m("li.TimeSeriesMenuEdit.TMenuItem",
                {
                },
                caption("&Edit"),
                m("li.TimeSeriesMenuUndo.TMenuItem",
                    {
                        onclick: TimeSeriesMenuUndoClick,
                        // ShortCut: "16474",
                    },
                    caption("&Undo"),
                ),
                m("li.TimeSeriesMenuRedo.TMenuItem",
                    {
                        onclick: TimeSeriesMenuRedoClick,
                        // ShortCut: "24666",
                    },
                    caption("&Redo"),
                ),
                m("li.TimeSeriesMenuUndoRedoList.TMenuItem",
                    {
                        onclick: TimeSeriesMenuUndoRedoListClick,
                    },
                    caption("Undo/Redo &List..."),
                ),
                m("li.N1.TMenuItem",
                    {
                    },
                    "-",
                ),
                m("li.TimeSeriesMenuCopy.TMenuItem",
                    {
                        onclick: TimeSeriesMenuCopyClick,
                        // ShortCut: "16451",
                    },
                    caption("&Copy"),
                ),
                m("li.TimeSeriesMenuPaste.TMenuItem",
                    {
                        onclick: TimeSeriesMenuPasteClick,
                        // ShortCut: "16470",
                    },
                    caption("&Paste"),
                ),
                m("li.TimeSeriesMenuSendCopy.TMenuItem",
                    {
                        onclick: TimeSeriesMenuSendCopyClick,
                    },
                    caption("&Send Copy to Main Window"),
                ),
                m("li.N3.TMenuItem",
                    {
                    },
                    "-",
                ),
                m("li.TimeSeriesMenuBreed.TMenuItem",
                    {
                        onclick: TimeSeriesMenuBreedClick,
                        // ShortCut: "16450",
                    },
                    caption("&Breed"),
                ),
                m("li.N4.TMenuItem",
                    {
                    },
                    "-",
                ),
                m("li.TimeSeriesMenuDelete.TMenuItem",
                    {
                        onclick: TimeSeriesMenuDeleteClick,
                        // ShortCut: "46",
                    },
                    caption("&Delete Time Series"),
                ),
            ),
            m("li.TimeSeriesMenuOptions.TMenuItem",
                {
                },
                caption("&Options"),
                m("li.TimeSeriesMenuOptionsDrawAs.TMenuItem",
                    {
                    },
                    caption("&Draw Using"),
                    m("li.TimeSeriesMenuOptionsFastDraw.TMenuItem",
                        {
                            onclick: TimeSeriesMenuOptionsFastDrawClick,
                            // GroupIndex: "10",
                            // RadioItem: "True",
                        },
                        caption("&Bounding Boxes"),
                    ),
                    m("li.TimeSeriesMenuOptionsMediumDraw.TMenuItem",
                        {
                            onclick: TimeSeriesMenuOptionsMediumDrawClick,
                            // GroupIndex: "10",
                            // RadioItem: "True",
                        },
                        caption("&Wire Frames"),
                    ),
                    m("li.TimeSeriesMenuOptionsBestDraw.TMenuItem",
                        {
                            onclick: TimeSeriesMenuOptionsBestDrawClick,
                            // GroupIndex: "10",
                            // RadioItem: "True",
                        },
                        caption("&Solids"),
                    ),
                    m("li.TimeSeriesMenuOptionsCustomDraw.TMenuItem",
                        {
                            onclick: TimeSeriesMenuOptionsCustomDrawClick,
                            // GroupIndex: "10",
                            // RadioItem: "True",
                        },
                        caption("&Custom..."),
                    ),
                ),
                m("li.TimeSeriesMenuOptionsStages.TMenuItem",
                    {
                        onclick: TimeSeriesMenuOptionsStagesClick,
                    },
                    caption("&More Options..."),
                ),
            ),
            m("li.TimeSeriesMenuHelp.TMenuItem",
                {
                },
                caption("&Help"),
                m("li.TimeSeriesMenuHelpOnTimeSeries.TMenuItem",
                    {
                        onclick: TimeSeriesMenuHelpOnTimeSeriesClick,
                    },
                    caption("Help on &Time Series"),
                ),
                m("li.N5.TMenuItem",
                    {
                    },
                    "-",
                ),
                m("li.TimeSeriesMenuHelpTopics.TMenuItem",
                    {
                        onclick: TimeSeriesMenuHelpTopicsClick,
                    },
                    caption("&Help Topics"),
                ),
            ),
        ),
        m("TDrawGrid.grid.TDrawGrid",
            {
                // Top: "4",
                // Left: "8",
                // Height: "67",
                // Width: "185",
                // ColCount: "1",
                // DefaultRowHeight: "64",
                // DefaultDrawing: "False",
                // FixedCols: "0",
                // RowCount: "2",
                // FixedRows: "0",
                // Options: "[goFixedVertLine, goFixedHorzLine]",
                // PopupMenu: "TimeSeriesPopupMenu",
                // TabOrder: "0",
                // OnDragOver: "gridDragOver",
                // OnDrawCell: "gridDrawCell",
                // OnEndDrag: "gridEndDrag",
                // OnMouseDown: "gridMouseDown",
            },
        ),
        m("div.emptyWarningPanel.TPanel",
            {
                // Top: "10",
                // Left: "206",
                // Height: "57",
                // Width: "241",
                // BevelOuter: "bvNone",
                // Color: "clWindow",
                // TabOrder: "1",
            },
            m("div.Label1.TLabel",
                {
                    // Top: "8",
                    // Left: "8",
                    // Height: "42",
                    // Width: "221",
                    // WordWrap: "True",
                },
                "The time series window is empty. To fill it, select a plant in the main window and choose Make Time Series from the Plant menu.",
            ),
        ),
        m("ul.TimeSeriesPopupMenu.TPopupMenu",
            {
                // Top: "38",
                // Left: "468",
                // Height: "0",
                // Width: "0",
            },
            m("li.TimeSeriesPopupMenuCopy.TMenuItem",
                {
                    onclick: TimeSeriesPopupMenuCopyClick,
                },
                caption("&Copy"),
            ),
            m("li.TimeSeriesPopupMenuPaste.TMenuItem",
                {
                    onclick: TimeSeriesPopupMenuPasteClick,
                },
                caption("&Paste"),
            ),
            m("li.TimeSeriesPopupMenuSendCopy.TMenuItem",
                {
                    onclick: TimeSeriesMenuSendCopyClick,
                },
                caption("&Send Copy to Main Window"),
            ),
            m("li.N2.TMenuItem",
                {
                },
                "-",
            ),
            m("li.TimeSeriesPopupMenuBreed.TMenuItem",
                {
                    onclick: TimeSeriesPopupMenuBreedClick,
                },
                "Breed",
            ),
        ),
    )
}

function TimeSeriesMenuBreedClick() { console.log("TimeSeriesMenuBreedClick") }

function TimeSeriesMenuCopyClick() { console.log("TimeSeriesMenuCopyClick") }

function TimeSeriesMenuDeleteClick() { console.log("TimeSeriesMenuDeleteClick") }

function TimeSeriesMenuHelpOnTimeSeriesClick() { console.log("TimeSeriesMenuHelpOnTimeSeriesClick") }

function TimeSeriesMenuHelpTopicsClick() { console.log("TimeSeriesMenuHelpTopicsClick") }

function TimeSeriesMenuOptionsBestDrawClick() { console.log("TimeSeriesMenuOptionsBestDrawClick") }

function TimeSeriesMenuOptionsCustomDrawClick() { console.log("TimeSeriesMenuOptionsCustomDrawClick") }

function TimeSeriesMenuOptionsFastDrawClick() { console.log("TimeSeriesMenuOptionsFastDrawClick") }

function TimeSeriesMenuOptionsMediumDrawClick() { console.log("TimeSeriesMenuOptionsMediumDrawClick") }

function TimeSeriesMenuOptionsStagesClick() { console.log("TimeSeriesMenuOptionsStagesClick") }

function TimeSeriesMenuPasteClick() { console.log("TimeSeriesMenuPasteClick") }

function TimeSeriesMenuRedoClick() { console.log("TimeSeriesMenuRedoClick") }

function TimeSeriesMenuSendCopyClick() { console.log("TimeSeriesMenuSendCopyClick") }

function TimeSeriesMenuUndoClick() { console.log("TimeSeriesMenuUndoClick") }

function TimeSeriesMenuUndoRedoListClick() { console.log("TimeSeriesMenuUndoRedoListClick") }

function TimeSeriesPopupMenuBreedClick() { console.log("TimeSeriesPopupMenuBreedClick") }

function TimeSeriesPopupMenuCopyClick() { console.log("TimeSeriesPopupMenuCopyClick") }

function TimeSeriesPopupMenuPasteClick() { console.log("TimeSeriesPopupMenuPasteClick") }
