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
import { caption, float, imageDir, int, IntToStr, short, ShowMessage, StrToFloat, StrToIntDef } from "./common"
import { chr, digitValueString } from "./usupport"
import { DomainOptionsStructure } from "./PdDomain"

// const
const kTransferLoad = 1
const kTransferSave = 2

const tabs = [ "Drawing", "Selecting", "Editing", "Posing", "Undoing", "Miscellaneous" ]

export class TOptionsForm {
    // Close: TButton = new TButton()
    // cancel: TButton = new TButton()
    // optionsNotebook: TTabbedNotebook = new TTabbedNotebook()
    // drawWithOpenGL: TCheckBox = new TCheckBox()
    // wholeProgramBox: TGroupBox = new TGroupBox()
    // backgroundColor: TPanel = new TPanel()
    // backgroundColorLabel: TLabel = new TLabel()
    // showPlantDrawingProgress: TCheckBox = new TCheckBox()
    // GroupBox1: TGroupBox = new TGroupBox()
    // firstSelectionRectangleColorLabel: TLabel = new TLabel()
    // multiSelectionRectangleColorLabel: TLabel = new TLabel()
    // firstSelectionRectangleColor: TPanel = new TPanel()
    // multiSelectionRectangleColor: TPanel = new TPanel()
    // GroupBox2: TGroupBox = new TGroupBox()
    // rotationIncrementLabel: TLabel = new TLabel()
    // nudgeDistanceLabel: TLabel = new TLabel()
    // rotationIncrement: TSpinEdit = new TSpinEdit()
    // nudgeDistance: TSpinEdit = new TSpinEdit()
    // GroupBox6: TGroupBox = new TGroupBox()
    // parametersFontSizeLabel: TLabel = new TLabel()
    // useMetricUnits: TCheckBox = new TCheckBox()
    // parametersFontSize: TSpinEdit = new TSpinEdit()
    // GroupBox7: TGroupBox = new TGroupBox()
    // pauseBeforeHintLabel: TLabel = new TLabel()
    // pauseDuringHintLabel: TLabel = new TLabel()
    // openMostRecentFileAtStart: TCheckBox = new TCheckBox()
    // pauseBeforeHint: TSpinEdit = new TSpinEdit()
    // pauseDuringHint: TSpinEdit = new TSpinEdit()
    // helpButton: TSpeedButton = new TSpeedButton()
    // resizeKeyUpMultiplierPercent: TSpinEdit = new TSpinEdit()
    // resizeDistanceLabel: TLabel = new TLabel()
    // mainWindowDrawingOptionsBox: TGroupBox = new TGroupBox()
    // customDrawOptions: TButton = new TButton()
    // Label1: TLabel = new TLabel()
    // transparentColor: TPanel = new TPanel()
    // transparentColorLabel: TLabel = new TLabel()
    // memoryLimitForPlantBitmaps_MB: TSpinEdit = new TSpinEdit()
    // memoryLimitLabel: TLabel = new TLabel()
    // Panel1: TPanel = new TPanel()
    // Image1: TImage = new TImage()
    // pasteRectSize: TSpinEdit = new TSpinEdit()
    // pasteRectSizeLabel: TLabel = new TLabel()
    // GroupBox4: TGroupBox = new TGroupBox()
    // Label9: TLabel = new TLabel()
    // Label10: TLabel = new TLabel()
    // ghostingColor: TPanel = new TPanel()
    // nonHiddenPosedColor: TPanel = new TPanel()
    // selectedPosedColor: TPanel = new TPanel()
    // Label3: TLabel = new TLabel()
    // GroupBox5: TGroupBox = new TGroupBox()
    // undoLimitLabel: TLabel = new TLabel()
    // undoLimitOfPlantsLabel: TLabel = new TLabel()
    // undoLimit: TSpinEdit = new TSpinEdit()
    // undoLimitOfPlants: TSpinEdit = new TSpinEdit()
    // resizeRectSize: TSpinEdit = new TSpinEdit()
    // resizeRectSizeLabel: TLabel = new TLabel()
    // ignoreWindowSettingsInFile: TCheckBox = new TCheckBox()
    transferDirection: short = 0
    options: DomainOptionsStructure = new DomainOptionsStructure()
    optionsChanged: boolean = false
    messageShown: short = 0
    close: (() => void) | null = null
    currentTab: string = tabs[0]

    // TOptionsForm.prototype = new PdForm()
    // TOptionsForm.prototype.constructor = TOptionsForm
    
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
    
    // transferFloatEditBox(editBox: TEdit, value: float): void {
    //     let oldValue: float
    //     let newValue: float
        
    //     if (this.transferDirection === kTransferLoad) {
    //         editBox.Text = digitValueString(value)
    //     } else if (this.transferDirection === kTransferSave) {
    //         oldValue = value
    //         try {
    //             newValue = StrToFloat(editBox.Text)
    //         } catch (e) {
    //             newValue = oldValue
    //         }
    //         if (value !== newValue) {
    //             this.optionsChanged = true
    //         }
    //         value = newValue
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
                m("button.Close.TButton.ml2",
                    {
                        onclick: () => this.closeClick(),
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
            )
            // m("label.checkbox-inline.drawWithOpenGL.TCheckBox", m("input[type=checkbox]",
            //     {
            //         // Top: "266",
            //         // Left: "413",
            //         // Height: "17",
            //         // Width: "149",
            //         // TabOrder: "4",
            //         // Visible: "False",
            //     },),
            //     "Draw using OpenGL",
            // ),
        )
    }

    setCurrentTab(tab: string) {
        this.currentTab = tab
    }

    viewPage1(): m.Children {
        return m("div.page1.TTabPage.pa3",
            {
                // Top: "25",
                // Left: "4",
                // Height: "0",
                // Width: "0",
            },
            m("TGroupBox.mainWindowDrawingOptionsBox.TGroupBox",
                {
                    // Top: "4",
                    // Left: "4",
                    // Height: "85",
                    // Width: "362",
                    // TabOrder: "0",
                },
                m("TSpinEdit.memoryLimitForPlantBitmaps_MB.TSpinEdit",
                    {
                        // Top: "24",
                        // Left: "8",
                        // Height: "23",
                        // Width: "47",
                        // MaxValue: "200",
                        // MinValue: "1",
                        // TabOrder: "0",
                        // Value: "200",
                    },
                ),
                m("div.memoryLimitLabel.TLabel",
                    {
                        // Top: "29",
                        // Left: "60",
                        // Height: "14",
                        // Width: "282",
                        // FocusControl: "memoryLimitForPlantBitmaps_MB",
                    },
                    caption("&Upper limit on memory devoted to plant bitmaps (1-200 MB)"),
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
            m("TGroupBox.wholeProgramBox.TGroupBox",
                {
                    // Top: "94",
                    // Left: "4",
                    // Height: "95",
                    // Width: "362",
                    // TabOrder: "1",
                },
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
                m("div.backgroundColorLabel.TLabel",
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
                m("div.transparentColorLabel.TLabel",
                    {
                        // Top: "46",
                        // Left: "34",
                        // Height: "14",
                        // Width: "292",
                        // FocusControl: "transparentColor",
                    },
                    caption("&Transparent color for overlaying plants if using plant bitmaps"),
                ),
                m("label.checkbox-inline.showPlantDrawingProgress.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "69",
                        // Left: "9",
                        // Height: "17",
                        // Width: "161",
                        // TabOrder: "2",
                    },),
                    caption("&Show drawing progress"),
                ),
            ),
        )
    }

    viewPage2(): m.Children {
        return  m("div.page2.TTabPage.pa3",
            {
                // Top: "25",
                // Left: "4",
                // Height: "0",
                // Width: "0",
            },
            m("TGroupBox.GroupBox1.TGroupBox",
                {
                    // Top: "4",
                    // Left: "4",
                    // Height: "69",
                    // Width: "362",
                    // TabOrder: "0",
                },
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
                m("div.firstSelectionRectangleColorLabel.TLabel",
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
                m("div.multiSelectionRectangleColorLabel.TLabel",
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
        return m("div.page3.TTabPage.pa3",
            {
                // Top: "25",
                // Left: "4",
                // Height: "0",
                // Width: "0",
            },
            m("TGroupBox.GroupBox2.TGroupBox",
                {
                    // Top: "4",
                    // Left: "4",
                    // Height: "176",
                    // Width: "362",
                    // TabOrder: "0",
                },
                m("TSpinEdit.rotationIncrement.TSpinEdit",
                    {
                        // Top: "19",
                        // Left: "8",
                        // Height: "23",
                        // Width: "53",
                        // MaxValue: "100",
                        // MinValue: "1",
                        // TabOrder: "0",
                        // Value: "1",
                    },
                ),
                m("div.rotationIncrementLabel.TLabel",
                    {
                        // Top: "24",
                        // Left: "67",
                        // Height: "14",
                        // Width: "289",
                        // FocusControl: "rotationIncrement",
                    },
                    caption("&Rotation change with arrow or mouse click (1-100 degrees)"),
                ),
                m("TSpinEdit.nudgeDistance.TSpinEdit",
                    {
                        // Top: "49",
                        // Left: "8",
                        // Height: "23",
                        // Width: "53",
                        // MaxValue: "100",
                        // MinValue: "1",
                        // TabOrder: "1",
                        // Value: "1",
                    },
                ),
                m("div.nudgeDistanceLabel.TLabel",
                    {
                        // Top: "54",
                        // Left: "67",
                        // Height: "14",
                        // Width: "288",
                        // FocusControl: "nudgeDistance",
                    },
                    caption("Distance plant &moves with Control-arrow key (0-100 pixels)"),
                ),
                m("TSpinEdit.resizeKeyUpMultiplierPercent.TSpinEdit",
                    {
                        // Top: "80",
                        // Left: "8",
                        // Height: "23",
                        // Width: "53",
                        // Increment: "10",
                        // MaxValue: "200",
                        // MinValue: "100",
                        // TabOrder: "2",
                        // Value: "100",
                    },
                ),
                m("div.resizeDistanceLabel.TLabel",
                    {
                        // Top: "84",
                        // Left: "67",
                        // Height: "14",
                        // Width: "284",
                        // FocusControl: "resizeKeyUpMultiplierPercent",
                    },
                    caption("Size &increase with Control-Shift-up-arrow key (100-200%)"),
                ),
                m("TSpinEdit.pasteRectSize.TSpinEdit",
                    {
                        // Top: "110",
                        // Left: "8",
                        // Height: "23",
                        // Width: "53",
                        // Increment: "10",
                        // MaxValue: "500",
                        // MinValue: "50",
                        // TabOrder: "3",
                        // Value: "100",
                    },
                ),
                m("div.pasteRectSizeLabel.TLabel",
                    {
                        // Top: "114",
                        // Left: "67",
                        // Height: "14",
                        // Width: "280",
                    },
                    caption(" Width and height of plant &pasted from text (50-500 pixels)"),
                ),
                m("TSpinEdit.resizeRectSize.TSpinEdit",
                    {
                        // Top: "140",
                        // Left: "8",
                        // Height: "23",
                        // Width: "53",
                        // MaxValue: "20",
                        // MinValue: "2",
                        // TabOrder: "4",
                        // Value: "2",
                    },
                ),
                m("div.resizeRectSizeLabel.TLabel",
                    {
                        // Top: "146",
                        // Left: "67",
                        // Height: "14",
                        // Width: "238",
                    },
                    caption(" Width and height of resizing &square (2-20 pixels)"),
                ),
            ),
        )
    }

    viewPage4(): m.Children {
        return m("div.page4.TTabPage.pa3",
            {
                // Top: "25",
                // Left: "4",
                // Height: "0",
                // Width: "0",
            },
            m("TGroupBox.GroupBox4.TGroupBox",
                {
                    // Top: "5",
                    // Left: "4",
                    // Height: "97",
                    // Width: "362",
                    // TabOrder: "0",
                },
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
                m("div.Label9.TLabel",
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
                m("div.Label10.TLabel",
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
                m("div.Label3.TLabel",
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
        return m("div.page5.TTabPage.pa3",
            {
                // Top: "25",
                // Left: "4",
                // Height: "0",
                // Width: "0",
            },
            m("TGroupBox.GroupBox5.TGroupBox",
                {
                    // Top: "4",
                    // Left: "4",
                    // Height: "81",
                    // Width: "362",
                    // TabOrder: "0",
                },
                m("TSpinEdit.undoLimit.TSpinEdit",
                    {
                        // Top: "20",
                        // Left: "8",
                        // Height: "23",
                        // Width: "53",
                        // MaxValue: "1000",
                        // MinValue: "1",
                        // TabOrder: "0",
                        // Value: "1",
                    },
                ),
                m("div.undoLimitLabel.TLabel",
                    {
                        // Top: "23",
                        // Left: "66",
                        // Height: "14",
                        // Width: "263",
                        // FocusControl: "undoLimit",
                    },
                    caption("&Number of actions to keep in undo list (1-1000 actions)"),
                ),
                m("TSpinEdit.undoLimitOfPlants.TSpinEdit",
                    {
                        // Top: "48",
                        // Left: "8",
                        // Height: "23",
                        // Width: "53",
                        // MaxValue: "500",
                        // MinValue: "1",
                        // TabOrder: "1",
                        // Value: "1",
                    },
                ),
                m("div.undoLimitOfPlantsLabel.TLabel",
                    {
                        // Top: "51",
                        // Left: "66",
                        // Height: "14",
                        // Width: "245",
                        // FocusControl: "undoLimitOfPlants",
                    },
                    caption("Number of &plants to keep in undo list (1-500 plants)"),
                ),
            ),
        )
    }

    viewPage6(): m.Children {
        return m("div.page6.TTabPage.pa3",
            {
                // Top: "25",
                // Left: "4",
                // Height: "0",
                // Width: "0",
            },
            m("TGroupBox.GroupBox6.TGroupBox",
                {
                    // Top: "4",
                    // Left: "4",
                    // Height: "75",
                    // Width: "362",
                    // TabOrder: "0",
                },
                m("label.checkbox-inline.useMetricUnits.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "20",
                        // Left: "8",
                        // Height: "17",
                        // Width: "319",
                        // TabOrder: "0",
                    },),
                    caption("&Default to metric units instead of English in parameter panels"),
                ),
                m("TSpinEdit.parametersFontSize.TSpinEdit",
                    {
                        // Top: "43",
                        // Left: "8",
                        // Height: "23",
                        // Width: "53",
                        // MaxValue: "20",
                        // MinValue: "6",
                        // TabOrder: "1",
                        // Value: "8",
                    },
                ),
                m("div.parametersFontSizeLabel.TLabel",
                    {
                        // Top: "48",
                        // Left: "66",
                        // Height: "14",
                        // Width: "181",
                        // FocusControl: "parametersFontSize",
                    },
                    caption("Font size for &parameter panels (6-20)"),
                ),
            ),
            m("TGroupBox.GroupBox7.TGroupBox",
                {
                    // Top: "84",
                    // Left: "4",
                    // Height: "133",
                    // Width: "362",
                    // TabOrder: "1",
                },
                m("label.checkbox-inline.openMostRecentFileAtStart.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "20",
                        // Left: "8",
                        // Height: "17",
                        // Width: "237",
                        // TabOrder: "0",
                    },),
                    caption("Open most recent &file at start"),
                ),
                m("label.checkbox-inline.ignoreWindowSettingsInFile.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "39",
                        // Left: "8",
                        // Height: "17",
                        // Width: "313",
                        // TabOrder: "3",
                    },),
                    caption("&Ignore window settings (top/side, one/many) saved in file"),
                ),
                m("TSpinEdit.pauseBeforeHint.TSpinEdit",
                    {
                        // Top: "61",
                        // Left: "7",
                        // Height: "23",
                        // Width: "53",
                        // MaxValue: "100",
                        // MinValue: "0",
                        // TabOrder: "1",
                        // Value: "100",
                    },
                ),
                m("div.pauseBeforeHintLabel.TLabel",
                    {
                        // Top: "66",
                        // Left: "64",
                        // Height: "14",
                        // Width: "240",
                        // FocusControl: "pauseBeforeHint",
                    },
                    caption("&Show hint after mouse is still for (0-100 seconds)"),
                ),
                m("TSpinEdit.pauseDuringHint.TSpinEdit",
                    {
                        // Top: "87",
                        // Left: "7",
                        // Height: "23",
                        // Width: "53",
                        // Increment: "5",
                        // MaxValue: "100",
                        // MinValue: "0",
                        // TabOrder: "2",
                        // Value: "100",
                    },
                ),
                m("div.pauseDuringHintLabel.TLabel",
                    {
                        // Top: "92",
                        // Left: "64",
                        // Height: "14",
                        // Width: "169",
                        // FocusControl: "pauseDuringHint",
                    },
                    caption("&Remove hint after (0-100 seconds)"),
                ),
                m("div.Label1.TLabel",
                    {
                        // Top: "110",
                        // Left: "64",
                        // Height: "14",
                        // Width: "295",
                    },
                    "This applies only when long button or parameter hints are on.",
                ),
            ),
        )
    }

    closeClick() {
        this.close!()
    }

    cancelClick() {
        this.close!()
    }

    helpButtonClick() { 
        console.log("helpButtonClick")
    }

    oninit(vnode: any) {
        this.close = vnode.attrs.close
    }
    
}

function customDrawOptionsClick() { console.log("customDrawOptionsClick") }
