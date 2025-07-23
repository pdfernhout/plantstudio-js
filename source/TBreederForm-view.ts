
// Exported from: ../../plantstudio-js/converted_source/ubreedr.lfm

import * as m from "mithril"
import { caption } from "./common"

export function viewBreederForm() {
    return m("BreederForm.TBreederForm",
        {
        // Top: "163",
        // Left: "315",
        // Height: "0",
        // Width: "0",
        // AutoScroll: "False",
        // Caption: "Breeder",
        // ClientHeight: "191",
        // ClientWidth: "427",
        // Font.Charset: "DEFAULT_CHARSET",
        // Font.Color: "clWindowText",
        // Font.Height: "-11",
        // Font.Name: "Arial",
        // Font.Style: "[]",
        // KeyPreview: "True",
        // Menu: "BreederMenu",
        // Position: "poDefaultPosOnly",
        // Scaled: "False",
        // OnActivate: "FormActivate",
        // OnCreate: "FormCreate",
        // OnDestroy: "FormDestroy",
        // OnResize: "FormResize",
        // PixelsPerInch: "96",
        // TextHeight: "14",
        },
        m("div.breederToolbarPanel.TPanel",
            {
                // Top: "10",
                // Left: "2",
                // Height: "33",
                // Width: "339",
                // BevelInner: "bvRaised",
                // BevelOuter: "bvLowered",
                // TabOrder: "2",
            },
            m("button.breedButton.TSpeedButton",
                {
                    onclick: breedButtonClick,
                    // Top: "4",
                    // Left: "5",
                    // Height: "25",
                    // Width: "25",
                    // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF0088888888888888888888888888888888888888888888888888888888888888888CCCCCC8CCCCCC8887777778777777888CFFFFC8CFFFFC8887888878788887888CFF2FC8CF2FFC8887887878787887888CF2FFC8CFF2FC8887878878788787888CFFFFC8CFFFFC8887888878788887888CCCCCC8CCCCCC888777777877777788888888888888888888888888888888888CCCCCC88888888887777778888888888CFFFFC88888888887888878888888888CF22FC88888888887877878888888888CF2FFC88888888887878878888888888CFFFFC88888888887888878888888888CCCCCC888888888877777788888888888888888888888888888888888888888",
                    // NumGlyphs: "2",
                },
            ),
            m("button.variationNoneNumeric.TSpeedButton",
                {
                    onclick: variationNoneNumericClick,
                    // Top: "4",
                    // Left: "47",
                    // Height: "25",
                    // Width: "25",
                    // GroupIndex: "1",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C88888888",
                },
            ),
            m("button.variationLow.TSpeedButton",
                {
                    onclick: variationLowClick,
                    // Top: "4",
                    // Left: "74",
                    // Height: "25",
                    // Width: "25",
                    // GroupIndex: "1",
                    // Down: "True",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888888888CCCCC88888888888CCCCC88888888888CCCCC88888888888CCCCC888888888888CCC8888888888888CCC8888888888888CCC8888888888888CCC88888888888888C888888888888888C888888888888888C888888888888888C888888888888888C888888888888888C88888888",
                },
            ),
            m("button.variationMedium.TSpeedButton",
                {
                    onclick: variationMediumClick,
                    // Top: "4",
                    // Left: "102",
                    // Height: "25",
                    // Width: "25",
                    // GroupIndex: "1",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF0088888888888888888888888888888888888CCCCCCCCC8888888CCCCCCCCC8888888CCCCCCCCC88888888CCCCCCC888888888CCCCCCC8888888888CCCCC88888888888CCCCC888888888888CCC8888888888888CCC88888888888888C888888888888888C888888888888888C888888888888888C888888888888888C88888888",
                },
            ),
            m("button.variationHigh.TSpeedButton",
                {
                    onclick: variationHighClick,
                    // Top: "4",
                    // Left: "129",
                    // Height: "25",
                    // Width: "25",
                    // GroupIndex: "1",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888CCCCCCCCCCCCC888CCCCCCCCCCCCC888CCCCCCCCCCCCC8888CCCCCCCCCCC888888CCCCCCCCC88888888CCCCCCC888888888CCCCCCC8888888888CCCCC888888888888CCC88888888888888C888888888888888C888888888888888C888888888888888C888888888888888C88888888",
                },
            ),
            m("button.variationCustom.TSpeedButton",
                {
                    onclick: variationCustomClick,
                    // Top: "4",
                    // Left: "156",
                    // Height: "25",
                    // Width: "25",
                    // GroupIndex: "1",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888CCC88CCC88CCC888CCC88CCC88CCC888CCCC8CCC8CCCC8888CCC8CCC8CCC888888CCCCCCCCC88888888CCCCCCC888888888CCCCCCC8888888888CCCCC888888888888CCC88888888888888C888888888888888C888888888888888C888888888888888C888888888888888C88888888",
                },
            ),
            m("button.varyColors.TSpeedButton",
                {
                    onclick: varyColorsClick,
                    // Top: "4",
                    // Left: "207",
                    // Height: "25",
                    // Width: "25",
                    // AllowAllUp: "True",
                    // GroupIndex: "2",
                    // Down: "True",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888C999AAADDDEEC888C999AAADDDEEC888C999AAADDDEEC8888C99AAADDDEC888888C9AAADDDC88888888CAAADDC888888888CAAADDC8888888888CAADC888888888888CAC88888888888888C888888888888888C888888888888888C888888888888888C888888888888888C88888888",
                },
            ),
            m("button.vary3DObjects.TSpeedButton",
                {
                    onclick: vary3DObjectsClick,
                    // Top: "4",
                    // Left: "239",
                    // Height: "25",
                    // Width: "25",
                    // AllowAllUp: "True",
                    // GroupIndex: "3",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888C8CCCCC8CCC8C888C88CCC88CCC8C888C888C888CCC8C8888C888888888C888888C8888888C88888888C88888C888888888C88888C8888888888C888C888888888888CCC88888888888888C888888888888888C888888888888888C888888888888888C888888888888888C88888888",
                },
            ),
            m("button.helpButton.TSpeedButton",
                {
                    onclick: helpButtonClick,
                    // Top: "4",
                    // Left: "310",
                    // Height: "25",
                    // Width: "25",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
                },
            ),
        ),
        m("ul.BreederPopupMenu.TPopupMenu",
            {
                // Top: "12",
                // Left: "396",
                // Height: "0",
                // Width: "0",
            },
            m("li.BreederPopupMenuBreed.TMenuItem",
                {
                    onclick: BreederPopupMenuBreedClick,
                },
                caption("&Breed"),
            ),
            m("li.N5.TMenuItem",
                {
                },
                "-",
            ),
            m("li.BreederPopupMenuCopy.TMenuItem",
                {
                    onclick: BreederPopupMenuCopyClick,
                },
                caption("&Copy"),
            ),
            m("li.BreederPopupMenuPaste.TMenuItem",
                {
                    onclick: BreederPopupMenuPasteClick,
                },
                caption("&Paste"),
            ),
            m("li.BreederPopupMenuSendCopytoMainWindow.TMenuItem",
                {
                    onclick: BreederPopupMenuSendCopytoMainWindowClick,
                },
                caption("&Send Copy to Main Window"),
            ),
            m("li.N7.TMenuItem",
                {
                },
                "-",
            ),
            m("li.BreederPopupMenuRandomize.TMenuItem",
                {
                    onclick: BreederPopupMenuRandomizeClick,
                },
                caption("&Randomize"),
            ),
            m("li.BreederPopupMenuMakeTimeSeries.TMenuItem",
                {
                    onclick: BreederPopupMenuMakeTimeSeriesClick,
                },
                caption("&Make Time Series"),
            ),
            m("li.N8.TMenuItem",
                {
                },
                "-",
            ),
            m("li.BreederPopupMenuDeleteRow.TMenuItem",
                {
                    onclick: BreederPopupMenuDeleteRowClick,
                },
                caption("Delete &generation"),
            ),
        ),
        m("TMainMenu.BreederMenu.TMainMenu",
            {
                // Top: "16",
                // Left: "360",
                // Height: "0",
                // Width: "0",
            },
            m("li.BreederMenuEdit.TMenuItem",
                {
                },
                caption("&Edit"),
                m("li.BreederMenuUndo.TMenuItem",
                    {
                        onclick: BreederMenuUndoClick,
                        // ShortCut: "16474",
                    },
                    caption("&Undo"),
                ),
                m("li.BreederMenuRedo.TMenuItem",
                    {
                        onclick: BreederMenuRedoClick,
                        // ShortCut: "24666",
                    },
                    caption("&Redo"),
                ),
                m("li.BreederMenuUndoRedoList.TMenuItem",
                    {
                        onclick: BreederMenuUndoRedoListClick,
                    },
                    caption("Undo/Redo &List..."),
                ),
                m("li.N2.TMenuItem",
                    {
                    },
                    "-",
                ),
                m("li.BreederMenuCopy.TMenuItem",
                    {
                        onclick: BreederMenuCopyClick,
                        // ShortCut: "16451",
                    },
                    caption("&Copy"),
                ),
                m("li.BreederMenuPaste.TMenuItem",
                    {
                        onclick: BreederMenuPasteClick,
                        // ShortCut: "16470",
                    },
                    caption("&Paste"),
                ),
                m("li.BreederMenuSendCopyToMainWindow.TMenuItem",
                    {
                        onclick: BreederMenuSendCopyToMainWindowClick,
                    },
                    caption("&Send Copy to Main Window"),
                ),
            ),
            m("li.BreederMenuPlant.TMenuItem",
                {
                },
                caption("&Breed"),
                m("li.BreederMenuBreed.TMenuItem",
                    {
                        onclick: BreederMenuBreedClick,
                        // ShortCut: "16450",
                    },
                    caption("&Breed"),
                ),
                m("li.BreederMenuMakeTimeSeries.TMenuItem",
                    {
                        onclick: BreederMenuMakeTimeSeriesClick,
                        // ShortCut: "16468",
                    },
                    caption("Make &Time Series"),
                ),
                m("li.N1.TMenuItem",
                    {
                    },
                    "-",
                ),
                m("li.BreederMenuDeleteRow.TMenuItem",
                    {
                        onclick: BreederMenuDeleteRowClick,
                        // ShortCut: "46",
                    },
                    caption("Delete &Generation"),
                ),
                m("li.BreederMenuDeleteAll.TMenuItem",
                    {
                        onclick: BreederMenuDeleteAllClick,
                    },
                    caption("Delete &All"),
                ),
                m("li.N4.TMenuItem",
                    {
                    },
                    "-",
                ),
                m("li.BreederMenuRandomize.TMenuItem",
                    {
                        onclick: BreederMenuRandomizeClick,
                        // ShortCut: "16466",
                    },
                    caption("&Randomize"),
                ),
                m("li.BreederMenuRandomizeAll.TMenuItem",
                    {
                        onclick: BreederMenuRandomizeAllClick,
                        // ShortCut: "16449",
                    },
                    caption("Randomize A&ll"),
                ),
            ),
            m("li.BreederMenuOptions.TMenuItem",
                {
                },
                caption("&Options"),
                m("li.BreederMenuOptionsDrawAs.TMenuItem",
                    {
                    },
                    caption("&Draw Using"),
                    m("li.BreederMenuOptionsFastDraw.TMenuItem",
                        {
                            onclick: BreederMenuOptionsFastDrawClick,
                            // Checked: "True",
                            // GroupIndex: "10",
                            // RadioItem: "True",
                        },
                        caption("&Bounding Boxes"),
                    ),
                    m("li.BreederMenuOptionsMediumDraw.TMenuItem",
                        {
                            onclick: BreederMenuOptionsMediumDrawClick,
                            // GroupIndex: "10",
                            // RadioItem: "True",
                        },
                        caption("&Wire Frames"),
                    ),
                    m("li.BreederMenuOptionsBestDraw.TMenuItem",
                        {
                            onclick: BreederMenuOptionsBestDrawClick,
                            // GroupIndex: "10",
                            // RadioItem: "True",
                        },
                        caption("&Solids"),
                    ),
                    m("li.BreederMenuOptionsCustomDraw.TMenuItem",
                        {
                            onclick: BreederMenuOptionsCustomDrawClick,
                            // GroupIndex: "10",
                            // RadioItem: "True",
                        },
                        caption("&Custom..."),
                    ),
                ),
                m("li.BreederMenuVariation.TMenuItem",
                    {
                    },
                    caption("Vary &Numbers"),
                    m("li.BreederMenuVariationNone.TMenuItem",
                        {
                            onclick: BreederMenuVariationNoneClick,
                            // GroupIndex: "1",
                            // RadioItem: "True",
                        },
                        caption("&None"),
                    ),
                    m("li.BreederMenuVariationLow.TMenuItem",
                        {
                            onclick: BreederMenuVariationLowClick,
                            // GroupIndex: "1",
                            // RadioItem: "True",
                        },
                        caption("&Low"),
                    ),
                    m("li.BreederMenuVariationMedium.TMenuItem",
                        {
                            onclick: BreederMenuVariationMediumClick,
                            // Checked: "True",
                            // GroupIndex: "1",
                            // RadioItem: "True",
                        },
                        caption("&Medium"),
                    ),
                    m("li.BreederMenuVariationHigh.TMenuItem",
                        {
                            onclick: BreederMenuVariationHighClick,
                            // GroupIndex: "1",
                            // RadioItem: "True",
                        },
                        caption("&High"),
                    ),
                    m("li.BreederMenuVariationCustom.TMenuItem",
                        {
                            onclick: BreederMenuVariationCustomClick,
                            // GroupIndex: "1",
                            // RadioItem: "True",
                        },
                        caption("&Custom..."),
                    ),
                ),
                m("li.BreederMenuVaryColors.TMenuItem",
                    {
                        onclick: BreederMenuVaryColorsClick,
                        // GroupIndex: "1",
                    },
                    caption("Vary &Colors"),
                ),
                m("li.BreederMenuVary3DObjects.TMenuItem",
                    {
                        onclick: BreederMenuVary3DObjectsClick,
                        // GroupIndex: "1",
                    },
                    caption("Vary &3D Objects"),
                ),
                m("li.N6.TMenuItem",
                    {
                    },
                    "-",
                ),
                m("li.BreederMenuOtherOptions.TMenuItem",
                    {
                        onclick: BreederMenuOtherOptionsClick,
                    },
                    caption("&More Options..."),
                ),
            ),
            m("li.MenuBreederHelp.TMenuItem",
                {
                },
                caption("&Help"),
                m("li.BreederMenuHelpOnBreeding.TMenuItem",
                    {
                        onclick: BreederMenuHelpOnBreedingClick,
                    },
                    caption("Help on &Breeding"),
                ),
                m("li.N3.TMenuItem",
                    {
                    },
                    "-",
                ),
                m("li.BreederMenuHelpTopics.TMenuItem",
                    {
                        onclick: BreederMenuHelpTopicsClick,
                    },
                    caption("&Help Topics"),
                ),
            ),
        ),
        m("div.emptyWarningPanel.TPanel",
            {
                // Top: "46",
                // Left: "362",
                // Height: "93",
                // Width: "183",
                // BevelOuter: "bvNone",
                // Color: "clWindow",
                // TabOrder: "1",
            },
            m("div.Label1.TLabel",
                {
                    // Top: "8",
                    // Left: "10",
                    // Height: "70",
                    // Width: "152",
                    // WordWrap: "True",
                },
                "The breeder is empty. To make some breeder plants, select a plant (or two plants) in the main window and choose Breed from the Plant menu.",
            ),
        ),
    )
}

function BreederMenuBreedClick() { console.log("BreederMenuBreedClick") }

function BreederMenuCopyClick() { console.log("BreederMenuCopyClick") }

function BreederMenuDeleteAllClick() { console.log("BreederMenuDeleteAllClick") }

function BreederMenuDeleteRowClick() { console.log("BreederMenuDeleteRowClick") }

function BreederMenuHelpOnBreedingClick() { console.log("BreederMenuHelpOnBreedingClick") }

function BreederMenuHelpTopicsClick() { console.log("BreederMenuHelpTopicsClick") }

function BreederMenuMakeTimeSeriesClick() { console.log("BreederMenuMakeTimeSeriesClick") }

function BreederMenuOptionsBestDrawClick() { console.log("BreederMenuOptionsBestDrawClick") }

function BreederMenuOptionsCustomDrawClick() { console.log("BreederMenuOptionsCustomDrawClick") }

function BreederMenuOptionsFastDrawClick() { console.log("BreederMenuOptionsFastDrawClick") }

function BreederMenuOptionsMediumDrawClick() { console.log("BreederMenuOptionsMediumDrawClick") }

function BreederMenuOtherOptionsClick() { console.log("BreederMenuOtherOptionsClick") }

function BreederMenuPasteClick() { console.log("BreederMenuPasteClick") }

function BreederMenuRandomizeAllClick() { console.log("BreederMenuRandomizeAllClick") }

function BreederMenuRandomizeClick() { console.log("BreederMenuRandomizeClick") }

function BreederMenuRedoClick() { console.log("BreederMenuRedoClick") }

function BreederMenuSendCopyToMainWindowClick() { console.log("BreederMenuSendCopyToMainWindowClick") }

function BreederMenuUndoClick() { console.log("BreederMenuUndoClick") }

function BreederMenuUndoRedoListClick() { console.log("BreederMenuUndoRedoListClick") }

function BreederMenuVariationCustomClick() { console.log("BreederMenuVariationCustomClick") }

function BreederMenuVariationHighClick() { console.log("BreederMenuVariationHighClick") }

function BreederMenuVariationLowClick() { console.log("BreederMenuVariationLowClick") }

function BreederMenuVariationMediumClick() { console.log("BreederMenuVariationMediumClick") }

function BreederMenuVariationNoneClick() { console.log("BreederMenuVariationNoneClick") }

function BreederMenuVary3DObjectsClick() { console.log("BreederMenuVary3DObjectsClick") }

function BreederMenuVaryColorsClick() { console.log("BreederMenuVaryColorsClick") }

function BreederPopupMenuBreedClick() { console.log("BreederPopupMenuBreedClick") }

function BreederPopupMenuCopyClick() { console.log("BreederPopupMenuCopyClick") }

function BreederPopupMenuDeleteRowClick() { console.log("BreederPopupMenuDeleteRowClick") }

function BreederPopupMenuMakeTimeSeriesClick() { console.log("BreederPopupMenuMakeTimeSeriesClick") }

function BreederPopupMenuPasteClick() { console.log("BreederPopupMenuPasteClick") }

function BreederPopupMenuRandomizeClick() { console.log("BreederPopupMenuRandomizeClick") }

function BreederPopupMenuSendCopytoMainWindowClick() { console.log("BreederPopupMenuSendCopytoMainWindowClick") }

function breedButtonClick() { console.log("breedButtonClick") }

function helpButtonClick() { console.log("helpButtonClick") }

function variationCustomClick() { console.log("variationCustomClick") }

function variationHighClick() { console.log("variationHighClick") }

function variationLowClick() { console.log("variationLowClick") }

function variationMediumClick() { console.log("variationMediumClick") }

function variationNoneNumericClick() { console.log("variationNoneNumericClick") }

function vary3DObjectsClick() { console.log("vary3DObjectsClick") }

function varyColorsClick() { console.log("varyColorsClick") }
