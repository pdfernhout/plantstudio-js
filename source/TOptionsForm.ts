// unit Uoptions

// from conversion_common import *
// import u3dexport
// import ucustdrw
// import umath
// import usupport
// import updform
// import udomain
// import delphi_compatability

import * as m from "mithril"
import { caption, float, imageDir, int, IntToStr, short, ShowMessage, StrToFloat, StrToIntDef, StrToIntRange } from "./common"
import { chr, digitValueString } from "./usupport"
import { domain, DomainOptionsStructure } from "./PdDomain"

// const
const kTransferLoad = 1
const kTransferSave = 2

const tabs = [ "Drawing", "Selecting", "Editing", "Posing", "Undoing", "Miscellaneous" ]

export class TOptionsForm {
    transferDirection: short = 0
    options: DomainOptionsStructure = new DomainOptionsStructure()
    messageShown: short = 0
    currentTab: string = tabs[0]
    close: ((options: DomainOptionsStructure | null) => void) | null = null

    optionsChanged(): boolean {
        return JSON.stringify(this.options) !== JSON.stringify(domain.options)
    }

    //$R *.DFM
    // FormCreate(Sender: TObject): void {
    //     this.optionsNotebook.pageIndex = 0
    // }
    
    // FormActivate(Sender: TObject): void {
    //     this.transferDirection = kTransferLoad
    //     this.transferFields()
    // }
    
    // CloseClick(Sender: TObject): void {
    //     this.transferDirection = kTransferSave
    //     this.transferFields()
    //     this.ModalResult = mrOK
    // }
    
    // cancelClick(Sender: TObject): void {
    //     this.ModalResult = mrCancel
    // }
    
    // transferFields(): void {
    //     // DRAWING
    //     this.options.memoryLimitForPlantBitmaps_MB = this.transferSmallintSpinEditBox(this.memoryLimitForPlantBitmaps_MB, this.options.memoryLimitForPlantBitmaps_MB)
    //     this.transferColor(this.backgroundColor, this.options.backgroundColor)
    //     this.transferColor(this.transparentColor, this.options.transparentColor)
    //     this.options.showPlantDrawingProgress = this.transferCheckBox(this.showPlantDrawingProgress, this.options.showPlantDrawingProgress)
    //     // SELECTING
    //     this.transferColor(this.firstSelectionRectangleColor, this.options.firstSelectionRectangleColor)
    //     this.transferColor(this.multiSelectionRectangleColor, this.options.multiSelectionRectangleColor)
    //     this.options.resizeRectSize = this.transferSmallintSpinEditBox(this.resizeRectSize, this.options.resizeRectSize)
    //     this.transferColor(this.ghostingColor, this.options.ghostingColor)
    //     this.transferColor(this.nonHiddenPosedColor, this.options.nonHiddenPosedColor)
    //     this.transferColor(this.selectedPosedColor, this.options.selectedPosedColor)
    //     // EDITING
    //     this.options.rotationIncrement = this.transferSmallintSpinEditBox(this.rotationIncrement, this.options.rotationIncrement)
    //     this.options.nudgeDistance = this.transferSmallintSpinEditBox(this.nudgeDistance, this.options.nudgeDistance)
    //     this.options.resizeKeyUpMultiplierPercent = this.transferSmallintSpinEditBox(this.resizeKeyUpMultiplierPercent, this.options.resizeKeyUpMultiplierPercent)
    //     this.options.pasteRectSize = this.transferSmallintSpinEditBox(this.pasteRectSize, this.options.pasteRectSize)
    //     // UNDOING
    //     this.options.undoLimit = this.transferSmallintSpinEditBox(this.undoLimit, this.options.undoLimit)
    //     this.options.undoLimitOfPlants = this.transferSmallintSpinEditBox(this.undoLimitOfPlants, this.options.undoLimitOfPlants)
    //     // MISCELLANEOUS
    //     this.options.openMostRecentFileAtStart = this.transferCheckBox(this.openMostRecentFileAtStart, this.options.openMostRecentFileAtStart)
    //     // v2.1
    //     this.options.ignoreWindowSettingsInFile = this.transferCheckBox(this.ignoreWindowSettingsInFile, this.options.ignoreWindowSettingsInFile)
    //     this.options.useMetricUnits = this.transferCheckBox(this.useMetricUnits, this.options.useMetricUnits)
    //     this.options.parametersFontSize = this.transferSmallintSpinEditBox(this.parametersFontSize, this.options.parametersFontSize)
    //     this.options.pauseBeforeHint = this.transferSmallintSpinEditBox(this.pauseBeforeHint, this.options.pauseBeforeHint)
    //     this.options.pauseDuringHint = this.transferSmallintSpinEditBox(this.pauseDuringHint, this.options.pauseDuringHint)
    // }
    
    // transferCheckBox(checkBox: TCheckBox, value: boolean): void {
    //     if (this.transferDirection === kTransferLoad) {
    //         checkBox.Checked = value
    //     } else if (this.transferDirection === kTransferSave) {
    //         if (value !== checkBox.Checked) {
    //             this.optionsChanged = true
    //         }
    //         value = checkBox.Checked
    //     }
    //     return value
    // }
    
    // transferColor(colorPanel: TPanel, value: TColorRef): void {
    //     throw new Error("method transferColor had assigned to var parameter value not added to return -- fixup manually")
    //     if (this.transferDirection === kTransferLoad) {
    //         colorPanel.Color = value
    //     } else if (this.transferDirection === kTransferSave) {
    //         if (value !== colorPanel.Color) {
    //             this.optionsChanged = true
    //         }
    //         value = colorPanel.Color
    //     }
    // }
    
    // transferSmallintSpinEditBox(editBox: TSpinEdit, value: short): void {
    //     if (this.transferDirection === kTransferLoad) {
    //         editBox.Text = IntToStr(value)
    //     } else if (this.transferDirection === kTransferSave) {
    //         if (value !== StrToIntDef(editBox.Text, 0)) {
    //             this.optionsChanged = true
    //         }
    //         value = StrToIntDef(editBox.Text, 0)
    //     }
    //     return value
    // }
    
    // backgroundColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.backgroundColor.Color = udomain.domain.getColorUsingCustomColors(this.backgroundColor.Color)
    // }
    
    // transparentColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     // leave this enabled even if not using private bitmaps
    //     this.transparentColor.Color = udomain.domain.getColorUsingCustomColors(this.transparentColor.Color)
    // }
    
    // firstSelectionRectangleColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.firstSelectionRectangleColor.Color = udomain.domain.getColorUsingCustomColors(this.firstSelectionRectangleColor.Color)
    // }
    
    // multiSelectionRectangleColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.multiSelectionRectangleColor.Color = udomain.domain.getColorUsingCustomColors(this.multiSelectionRectangleColor.Color)
    // }
    
    // ghostingColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.ghostingColor.Color = udomain.domain.getColorUsingCustomColors(this.ghostingColor.Color)
    // }
    
    // nonHiddenPosedColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.nonHiddenPosedColor.Color = udomain.domain.getColorUsingCustomColors(this.nonHiddenPosedColor.Color)
    // }
    
    // selectedPosedColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.selectedPosedColor.Color = udomain.domain.getColorUsingCustomColors(this.selectedPosedColor.Color)
    // }
    
    // FormKeyPress(Sender: TObject, Key: char): void {
    //     Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
    //     return Key
    // }
    
    // helpButtonClick(Sender: TObject): void {
    //     delphi_compatability.Application.HelpJump("Changing_preferences")
    // }
    
    // customDrawOptionsClick(Sender: TObject): void {
    //     let customDrawForm: TCustomDrawOptionsForm
    //     let response: int
        
    //     customDrawForm = ucustdrw.TCustomDrawOptionsForm().create(this)
    //     if (customDrawForm === null) {
    //         throw new Error("Problem: Could not create 3D object mover window.")
    //     }
    //     try {
    //         customDrawForm.options = this.options
    //         response = customDrawForm.ShowModal()
    //         if ((response === mrOK) && (customDrawForm.optionsChanged)) {
    //             this.options = customDrawForm.options
    //             this.optionsChanged = true
    //         }
    //     } finally {
    //         customDrawForm.free
    //     }
    // }
    
    Image1Click(): void {
        switch (this.messageShown) {
            case 0:
                ShowMessage("We would like to take this opportunity" + chr(13) + "to say thank you to our excellent testers, " + chr(13) + "especially Ana, Joanne and Randy.")
                break
            case 1:
                ShowMessage("Thanks to our parents and families.")
                break
            case 2:
                ShowMessage("Thanks to our dogs Maize and Comet" + chr(13) + "for their many interesting suggestions.")
                break
            case 3:
                ShowMessage("Thanks to those who have graciously supported our work.")
                break
            case 4:
                ShowMessage("Thanks to everyone who sent letters.")
                break
            case 5:
                ShowMessage("Thanks to those who have spread the word about PlantStudio.")
                break
            case 6:
                ShowMessage("And thank YOU for trying PlantStudio!")
                break
        }
        this.messageShown += 1
    }

    view() {
        return m("OptionsForm.TOptionsForm.h5",
            {
            // Top: "188",
            // Left: "279",
            // Height: "0",
            // Width: "0",
            // ActiveControl: "cancel",
            // BorderIcons: "[biSystemMenu]",
            // BorderStyle: "bsDialog",
            // Caption: "PlantStudio Preferences",
            // ClientHeight: "247",
            // ClientWidth: "450",
            // Font.Charset: "DEFAULT_CHARSET",
            // Font.Color: "clWindowText",
            // Font.Height: "-11",
            // Font.Name: "Arial",
            // Font.Style: "[]",
            // KeyPreview: "True",
            // Position: "poScreenCenter",
            // Scaled: "False",
            // OnActivate: "FormActivate",
            // OnCreate: "FormCreate",
            // OnKeyPress: "FormKeyPress",
            // PixelsPerInch: "96",
            // TextHeight: "14",
            },
            m("TTabbedNotebook.optionsNotebook.TTabbedNotebook",
                {
                    // Top: "0",
                    // Left: "0",
                    // Height: "247",
                    // Width: "379",
                    // Align: "alLeft",
                    // PageIndex: "2",
                    // TabsPerRow: "5",
                    // TabFont.Charset: "DEFAULT_CHARSET",
                    // TabFont.Color: "clBtnText",
                    // TabFont.Height: "-11",
                    // TabFont.Name: "Arial",
                    // TabFont.Style: "[]",
                    // TabOrder: "0",
                },
                m("div.b.f4.mb2", "PlantStudio Preferences"),
                m("div.TTabSet.tabSet.TTabSet",
                    tabs.map(
                        tab => m("div.ml1.br--top.bl.bt.br.bw1.br2.dib.pa1" + (this.currentTab === tab ? ".bg-green" : ""), {
                            style: { minWidth: "4rem" },
                            onclick: () => this.setCurrentTab(tab)
                        }, tab)
                )),
                this.currentTab === "Drawing" && this.viewPage1(),
                this.currentTab === "Selecting" && this.viewPage2(),
                this.currentTab === "Editing" && this.viewPage3(),
                this.currentTab === "Posing" && this.viewPage4(),
                this.currentTab === "Undoing" && this.viewPage5(),
                this.currentTab === "Miscellaneous" && this.viewPage6()
            ),
            m("div.flex.items-center.mt2.absolute",
                { style: { bottom: "0.5rem" }},
                m("img.Image1.TImage",
                    {
                        onclick: () => this.Image1Click(),
                        src: imageDir + "OptionsForm_Image1.png"
                    },
                ),
                m("button.OK.TButton.ml2",
                    {
                        onclick: () => this.okClick(),
                        disabled: !this.optionsChanged()
                        // Top: "4",
                        // Left: "386",
                        // Height: "21",
                        // Width: "60",
                        // DragCursor: "crHandPoint",
                        // TabOrder: "1",
                    },
                    caption("&OK"),
                ),
                m("button.cancel.TButton.ml2",
                    {
                        onclick: () => this.cancelClick(),
                        // Top: "27",
                        // Left: "386",
                        // Height: "21",
                        // Width: "60",
                        // Cancel: "True",
                        // TabOrder: "2",
                    },
                    caption("&Cancel"),
                ),
                m("button.helpButton.TSpeedButton.ml2",
                        {
                        onclick: () => this.helpButtonClick(),
                        },
                    m("img.TImage",
                        {
                            src: imageDir + "OptionsForm_helpButton.png"
                        },
                    ),
                    caption("&Help"),
                ),
            ),
            // m("label.checkbox-inline.drawWithOpenGL.TCheckBox.dib.mt1", m("input[type=checkbox].mr1",
            //     {
            //         checked: this.options.drawWithOpenGL,
            //         onclick: (event: any) => this.options.drawWithOpenGL = event.target.checked
            //     }),
            //     "Draw using OpenGL",
            // ),
        )
    }

    setCurrentTab(tab: string) {
        this.currentTab = tab
    }

    viewPage1(): m.Children {
        return m("div.page1.TTabPage.pa1",
            m("div.mainWindowDrawingOptionsBox.TGroupBox",
                m("label.memoryLimitLabel.TLabel.dib.mt1",
                    caption("&Upper limit on memory devoted to plant bitmaps (1-200 MB)"),
                    m("br"),
                    m("input[type=number].memoryLimitForPlantBitmaps_MB.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.memoryLimitForPlantBitmaps_MB),
                            onchange: (event: any) => this.options.memoryLimitForPlantBitmaps_MB = StrToIntRange(event.target.value, 1, 200),
                            step: 10,
                            min: "1",
                            max: "200"
                        },
                    ),
                ),
                m("button.customDrawOptions.TButton",
                    {
                        onclick: customDrawOptionsClick,
                        // Top: "54",
                        // Left: "8",
                        // Height: "21",
                        // Width: "202",
                        // TabOrder: "1",
                    },
                    caption("Change Custom Dra&wing Options..."),
                ),
            ),
            m("div.wholeProgramBox.TGroupBox",
                m("div.backgroundColor.TPanel",
                    {
                        // Top: "17",
                        // Left: "9",
                        // Height: "20",
                        // Width: "20",
                        // BevelInner: "bvLowered",
                        // BevelOuter: "bvLowered",
                        // Color: "clWhite",
                        // TabOrder: "0",
                        // OnMouseUp: "backgroundColorMouseUp",
                    },
                ),
                m("div.backgroundColorLabel.TLabel.dib.mt1",
                    {
                        // Top: "20",
                        // Left: "34",
                        // Height: "14",
                        // Width: "152",
                        // FocusControl: "backgroundColor",
                    },
                    caption("&Background color behind plants"),
                ),
                m("div.transparentColor.TPanel",
                    {
                        // Top: "43",
                        // Left: "9",
                        // Height: "20",
                        // Width: "20",
                        // BevelInner: "bvLowered",
                        // BevelOuter: "bvLowered",
                        // Color: "clWhite",
                        // TabOrder: "1",
                        // OnMouseUp: "transparentColorMouseUp",
                    },
                ),
                m("div.transparentColorLabel.TLabel.dib.mt1",
                    {
                        // Top: "46",
                        // Left: "34",
                        // Height: "14",
                        // Width: "292",
                        // FocusControl: "transparentColor",
                    },
                    caption("&Transparent color for overlaying plants if using plant bitmaps"),
                ),
                m("label.checkbox-inline.showPlantDrawingProgress.TCheckBox.dib.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.showPlantDrawingProgress,
                        onclick: (event: any) => this.options.showPlantDrawingProgress = event.target.checked
                    }),
                    caption("&Show drawing progress"),
                ),
            ),
        )
    }

    viewPage2(): m.Children {
        return  m("div.page2.TTabPage.pa1",
            m("div.GroupBox1.TGroupBox",
                m("div.firstSelectionRectangleColor.TPanel",
                    {
                        // Top: "18",
                        // Left: "8",
                        // Height: "20",
                        // Width: "20",
                        // BevelInner: "bvLowered",
                        // BevelOuter: "bvLowered",
                        // Color: "clRed",
                        // TabOrder: "0",
                        // OnMouseUp: "firstSelectionRectangleColorMouseUp",
                    },
                ),
                m("div.firstSelectionRectangleColorLabel.TLabel.dib.mt1",
                    {
                        // Top: "21",
                        // Left: "32",
                        // Height: "14",
                        // Width: "161",
                        // FocusControl: "firstSelectionRectangleColor",
                    },
                    caption("Rectangle color for &focused plant"),
                ),
                m("div.multiSelectionRectangleColor.TPanel",
                    {
                        // Top: "40",
                        // Left: "8",
                        // Height: "20",
                        // Width: "20",
                        // BevelInner: "bvLowered",
                        // BevelOuter: "bvLowered",
                        // Color: "clBlue",
                        // TabOrder: "1",
                        // OnMouseUp: "multiSelectionRectangleColorMouseUp",
                    },
                ),
                m("div.multiSelectionRectangleColorLabel.TLabel.dib.mt1",
                    {
                        // Top: "43",
                        // Left: "32",
                        // Height: "14",
                        // Width: "196",
                        // FocusControl: "multiSelectionRectangleColor",
                    },
                    caption("Rectangle color for &other selected plants"),
                ),
            ),
        )
    }

    viewPage3(): m.Children {
        return m("div.page3.TTabPage.pa1",
            m("div.GroupBox2.TGroupBox",
                m("label.rotationIncrementLabel.TLabel.dib.mt1",
                    caption("&Rotation change with arrow or mouse click (1-100 degrees)"),
                    m("br"),
                    m("input[type=number].rotationIncrement.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.rotationIncrement),
                            onchange: (event: any) => this.options.rotationIncrement = StrToIntRange(event.target.value, 1, 100),
                            step: 1,
                            min: "1",
                            max: "100"
                        },
                    ),
                ),
                m("label.nudgeDistanceLabel.TLabel.dib.mt1",
                    // Fixed bug in Delphi version -- UI had 0-100
                    caption("Distance plant &moves with Control-arrow key (1-100 pixels)"),
                    m("br"),
                    m("input[type=number].nudgeDistance.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.nudgeDistance),
                            onchange: (event: any) => this.options.nudgeDistance = StrToIntRange(event.target.value, 1, 100),
                            step: 1,
                            min: "1",
                            max: "100"
                        },
                    ),
                ),
                m("label.resizeDistanceLabel.TLabel.dib.mt1",
                    caption("Size &increase with Control-Shift-up-arrow key (100-200%)"),
                    m("br"),
                    m("input[type=number].resizeKeyUpMultiplierPercent.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.resizeKeyUpMultiplierPercent),
                            onchange: (event: any) => this.options.resizeKeyUpMultiplierPercent = StrToIntRange(event.target.value, 100, 200),
                            step: 10,
                            min: "100",
                            max: "200"
                        },
                    ),
                ),
                m("label.pasteRectSizeLabel.TLabel.dib.mt1",
                    caption(" Width and height of plant &pasted from text (50-500 pixels)"),
                    m("br"),
                    m("input[type=number].pasteRectSize.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.pasteRectSize),
                            onchange: (event: any) => this.options.pasteRectSize = StrToIntRange(event.target.value, 50, 500),
                            step: 10,
                            min: "50",
                            max: "500"
                        },
                    ),
                ),
                m("label.resizeRectSizeLabel.TLabel.dib.mt1",
                    caption(" Width and height of resizing &square (2-20 pixels)"),
                    m("br"),
                    m("input[type=number].resizeRectSize.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.resizeRectSize),
                            onchange: (event: any) => this.options.resizeRectSize = StrToIntRange(event.target.value, 2, 20),
                            step: 1,
                            min: "2",
                            max: "20"
                        }   
                    ),
                ),
            ),
        )
    }

    viewPage4(): m.Children {
        return m("div.page4.TTabPage.pa1",
            m("div.GroupBox4.TGroupBox",
                m("div.ghostingColor.TPanel",
                    {
                        // Top: "20",
                        // Left: "8",
                        // Height: "20",
                        // Width: "20",
                        // BevelInner: "bvLowered",
                        // BevelOuter: "bvLowered",
                        // Color: "clGray",
                        // TabOrder: "0",
                        // OnMouseUp: "ghostingColorMouseUp",
                    },
                ),
                m("div.Label9.TLabel.dib.mt1",
                    {
                        // Top: "23",
                        // Left: "32",
                        // Height: "14",
                        // Width: "70",
                        // FocusControl: "ghostingColor",
                    },
                    caption("&Ghosting color"),
                ),
                m("div.nonHiddenPosedColor.TPanel",
                    {
                        // Top: "43",
                        // Left: "8",
                        // Height: "20",
                        // Width: "20",
                        // BevelInner: "bvLowered",
                        // BevelOuter: "bvLowered",
                        // Color: "clBlue",
                        // TabOrder: "1",
                        // OnMouseUp: "nonHiddenPosedColorMouseUp",
                    },
                ),
                m("div.Label10.TLabel.dib.mt1",
                    {
                        // Top: "45",
                        // Left: "32",
                        // Height: "14",
                        // Width: "198",
                        // FocusControl: "nonHiddenPosedColor",
                    },
                    caption("&Highlighting color for all posed plant parts"),
                ),
                m("div.selectedPosedColor.TPanel",
                    {
                        // Top: "66",
                        // Left: "8",
                        // Height: "20",
                        // Width: "20",
                        // BevelInner: "bvLowered",
                        // BevelOuter: "bvLowered",
                        // Color: "clRed",
                        // TabOrder: "2",
                        // OnMouseUp: "selectedPosedColorMouseUp",
                    },
                ),
                m("div.Label3.TLabel.dib.mt1",
                    {
                        // Top: "69",
                        // Left: "32",
                        // Height: "14",
                        // Width: "223",
                        // FocusControl: "selectedPosedColor",
                    },
                    caption("Highlighting color for &selected posed plant part"),
                ),
            ),
        )
    }

    viewPage5(): m.Children {
        return m("div.page5.TTabPage.pa1",
            m("div.GroupBox5.TGroupBox",
                m("label.undoLimitLabel.TLabel.dib.mt1",
                    caption("&Number of actions to keep in undo list (1-1000 actions)"),
                    m("br"),
                    m("input[type=number].undoLimit.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.undoLimit),
                            onchange: (event: any) => this.options.undoLimit = StrToIntRange(event.target.value, 1, 1000),
                            step: 1,
                            min: "1",
                            max: "1000"
                        }   
                    ),
                ),
                m("label.undoLimitOfPlantsLabel.TLabel.dib.mt1",
                    caption("Number of &plants to keep in undo list (1-500 plants)"),
                    m("br"),
                    m("input[type=number].undoLimitOfPlants.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.undoLimitOfPlants),
                            onchange: (event: any) => this.options.undoLimitOfPlants = StrToIntRange(event.target.value, 1, 500),
                            step: 1,
                            min: "1",
                            max: "500"
                        },
                    ),
                ),
            ),
        )
    }

    viewPage6(): m.Children {
        return m("div.page6.TTabPage.pa1",
            m("div.GroupBox6.TGroupBox",
                m("label.checkbox-inline.useMetricUnits.TCheckBox.dib.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.useMetricUnits,
                        onclick: (event: any) => this.options.useMetricUnits = event.target.checked
                    }),
                    caption("&Default to metric units instead of English in parameter panels"),
                ),
                m("label.parametersFontSizeLabel.TLabel.dib.mt1",
                    caption("Font size for &parameter panels (6-20)"),
                    m("br"),
                    m("input[type=number].parametersFontSize.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.parametersFontSize),
                            onchange: (event: any) => this.options.parametersFontSize = StrToIntRange(event.target.value, 6, 20),
                            step: 1,
                            min: "6",
                            max: "20"
                        },
                    ),
                ),
            ),
            m("div.GroupBox7.TGroupBox",
                m("label.checkbox-inline.openMostRecentFileAtStart.TCheckBox.dib.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.openMostRecentFileAtStart,
                        onclick: (event: any) => this.options.openMostRecentFileAtStart = event.target.checked
                    }),
                    caption("Open most recent &file at start"),
                ),
                m("label.checkbox-inline.ignoreWindowSettingsInFile.TCheckBox.dib.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.ignoreWindowSettingsInFile,
                        onclick: (event: any) => this.options.ignoreWindowSettingsInFile = event.target.checked
                    }),
                    caption("&Ignore window settings (top/side, one/many) saved in file"),
                ),
                m("label.pauseBeforeHintLabel.TLabel.dib.mt1",
                    caption("&Show hint after mouse is still for (0-100 seconds)"),
                    m("br"),
                    m("input[type=number].pauseBeforeHint.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.pauseBeforeHint),
                            onchange: (event: any) => this.options.pauseBeforeHint = StrToIntRange(event.target.value, 0, 100),
                            step: 1,
                            min: "0",
                            max: "100"
                        },
                    ),
                ),
                m("label.pauseDuringHintLabel.TLabel.dib.mt1",
                    {
                        // Top: "92",
                        // Left: "64",
                        // Height: "14",
                        // Width: "169",
                        // FocusControl: "pauseDuringHint",
                    },
                    caption("&Remove hint after (0-100 seconds)"),
                    m("br"),
                    m("input[type=number].pauseDuringHint.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.pauseDuringHint),
                            onchange: (event: any) => this.options.pauseDuringHint = StrToIntRange(event.target.value, 0, 100),
                            step: 1,
                            min: "0",
                            max: "100"
                        },
                    ),
                ),
                m("div.Label1.TLabel.dib.mt1.f7.ml2",
                    "(This applies only when long button or parameter hints are on.)",
                ),
            ),
        )
    }

    okClick() {
        this.close!(this.optionsChanged() ? this.options : null)
    }

    cancelClick() {
        this.close!(null)
    }

    helpButtonClick() { 
        console.log("helpButtonClick")
    }

    oninit(vnode: any) {
        this.close = vnode.attrs.close
        this.options = JSON.parse(JSON.stringify(domain.options))
    }
    
}

function customDrawOptionsClick() { console.log("customDrawOptionsClick") }
