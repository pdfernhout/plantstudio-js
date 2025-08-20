
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
