// unit Uoptions

import * as m from "mithril"
import { caption, HelpJump, imageDir, int, IntToStr, short, ShowMessage, StrToIntRange } from "./common"
import { chr } from "./usupport"
import { domain, DomainOptionsStructure } from "./PdDomain"
import { convertColorNumberToCSS, convertCSSHexColorToNumber } from "./KfDrawingSurface"

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
            m("TTabbedNotebook.optionsNotebook.TTabbedNotebook",
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
                    },
                    caption("&OK"),
                ),
                m("button.cancel.TButton.ml2",
                    {
                        onclick: () => this.cancelClick(),
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
            // TODO PDF: Improve or remove OpenGL-related code
            // m("label.checkbox-inline.drawWithOpenGL.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
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
                m("label.memoryLimitLabel.TLabel.db.mt1",
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
            ),
            m("div.wholeProgramBox.TGroupBox",
                m("label.backgroundColorLabel.TLabel.db.mt1",
                    m("input[type=color].backgroundColor.TPanel.mr1",
                        {
                            value: convertColorNumberToCSS(this.options.backgroundColor),
                            onchange: (event: any) => this.options.backgroundColor = convertCSSHexColorToNumber(event.target.value)
                        },
                    ),
                    caption("&Background color behind plants"),
                ),
                m("label.transparentColorLabel.TLabel.db.mt1",
                    m("input[type=color].transparentColor.TPanel.mr1",
                        {
                            value: convertColorNumberToCSS(this.options.transparentColor),
                            onchange: (event: any) => this.options.transparentColor = convertCSSHexColorToNumber(event.target.value)
                        },
                    ),
                    caption("&Transparent color for overlaying plants if using plant bitmaps"),
                ),
                m("label.checkbox-inline.showPlantDrawingProgress.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
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
                m("label.firstSelectionRectangleColorLabel.TLabel.db.mt1",
                    m("input[type=color].firstSelectionRectangleColor.TPanel.mr1",
                        {
                            value: convertColorNumberToCSS(this.options.firstSelectionRectangleColor),
                            onchange: (event: any) => this.options.firstSelectionRectangleColor = convertCSSHexColorToNumber(event.target.value)
                        },
                    ),
                    caption("Rectangle color for &focused plant"),
                ),
                m("div.multiSelectionRectangleColorLabel.TLabel.db.mt1",
                    m("input[type=color].multiSelectionRectangleColor.TPanel.mr1",
                        {
                            value: convertColorNumberToCSS(this.options.multiSelectionRectangleColor),
                            onchange: (event: any) => this.options.multiSelectionRectangleColor = convertCSSHexColorToNumber(event.target.value)
                        },
                    ),
                    caption("Rectangle color for &other selected plants"),
                ),
            ),
        )
    }

    viewPage3(): m.Children {
        return m("div.page3.TTabPage.pa1",
            m("div.GroupBox2.TGroupBox",
                m("label.rotationIncrementLabel.TLabel.db.mt1",
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
                m("label.nudgeDistanceLabel.TLabel.db.mt1",
                    // Fixed bug in Delphi version -- UI label had 0-100
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
                m("label.resizeDistanceLabel.TLabel.db.mt1",
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
                m("label.pasteRectSizeLabel.TLabel.db.mt1",
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
                m("label.resizeRectSizeLabel.TLabel.db.mt1",
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
                m("label.Label9.TLabel.db.mt1",
                    m("input[type=color].ghostingColor.TPanel.mr1",
                        {
                            value: convertColorNumberToCSS(this.options.ghostingColor),
                            onchange: (event: any) => this.options.ghostingColor = convertCSSHexColorToNumber(event.target.value)
                        },
                    ),
                    caption("&Ghosting color"),
                ),
                m("label.Label10.TLabel.db.mt1",
                    m("input[type=color].nonHiddenPosedColor.TPanel.mr1",
                        {
                            value: convertColorNumberToCSS(this.options.nonHiddenPosedColor),
                            onchange: (event: any) => this.options.nonHiddenPosedColor = convertCSSHexColorToNumber(event.target.value)
                        },
                    ),
                    caption("&Highlighting color for all posed plant parts"),
                ),
                m("label.Label3.TLabel.db.mt1",
                    m("input[type=color].selectedPosedColor.TPanel.mr1",
                        {
                            value: convertColorNumberToCSS(this.options.selectedPosedColor),
                            onchange: (event: any) => this.options.selectedPosedColor = convertCSSHexColorToNumber(event.target.value)
                        },
                    ),
                    caption("Highlighting color for &selected posed plant part"),
                ),
            ),
        )
    }

    viewPage5(): m.Children {
        return m("div.page5.TTabPage.pa1",
            m("div.GroupBox5.TGroupBox",
                m("label.undoLimitLabel.TLabel.db.mt1",
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
                m("label.undoLimitOfPlantsLabel.TLabel.db.mt1",
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
                m("label.checkbox-inline.useMetricUnits.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.useMetricUnits,
                        onclick: (event: any) => this.options.useMetricUnits = event.target.checked
                    }),
                    caption("&Default to metric units instead of English in parameter panels"),
                ),
                m("label.parametersFontSizeLabel.TLabel.db.mt1",
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
                m("label.checkbox-inline.openMostRecentFileAtStart.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.openMostRecentFileAtStart,
                        onclick: (event: any) => this.options.openMostRecentFileAtStart = event.target.checked
                    }),
                    caption("Open most recent &file at start"),
                ),
                m("label.checkbox-inline.ignoreWindowSettingsInFile.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.ignoreWindowSettingsInFile,
                        onclick: (event: any) => this.options.ignoreWindowSettingsInFile = event.target.checked
                    }),
                    caption("&Ignore window settings (top/side, one/many) saved in file"),
                ),
                m("label.pauseBeforeHintLabel.TLabel.db.mt1",
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
                m("label.pauseDuringHintLabel.TLabel.db.mt1",
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
                m("div.Label1.TLabel.db.mt1.f7.ml2",
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
        HelpJump("Changing_preferences")
    }

    oninit(vnode: any) {
        this.close = vnode.attrs.close
        this.options = JSON.parse(JSON.stringify(domain.options))
    }
    
}

function customDrawOptionsClick() { console.log("customDrawOptionsClick") }
