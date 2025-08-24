// unit Udebug

import * as m from "mithril"
import { domain } from "./PdDomain"
import { AssignFile, caption, CloseFile, ExtractFilePath, HelpJump, long, Rewrite, TextFile, writeln } from "./common"
import { intMax } from "./umath"
import { cleanUpAfterFileSave, createSaveFileNamesStructure, FileType, getFileSaveInfo, kAskForFileName, SaveFileNamesStructure, setDecimalSeparator } from "./usupport"
import { TRect } from "./TRect"
import { unfinished } from "./temporary"
import { DebugForm, setActiveForm, setDebugForm } from "./FormHolder"

// from conversion_common import *
// import umain
// import uprginfo
// import umath
// import usupport
// import udomain
// import updform
// import delphi_compatability

//$R *.DFM
function DebugPrint(aMessage: string): void {
    if (DebugForm !== null) {
        DebugForm.print(aMessage)
    }
}

export class TDebugForm {
    DebugList: string[] = []
    // Close: TButton = new TButton()
    // saveListAs: TButton = new TButton()
    // clearList: TButton = new TButton()
    // optionsPanel: TPanel = new TPanel()
    // exceptionLabel: TLabel = new TLabel()
    // showOnExceptionCheckBox: TCheckBox = new TCheckBox()
    // logToFile: TCheckBox = new TCheckBox()
    // helpButton: TSpeedButton = new TSpeedButton()
    // supportButton: TButton = new TButton()
    outputFile: TextFile = new TextFile()
    logging: boolean = false
    
    // TODO PDF: Use or remove
    // FormCreate(): void {
    //     this.showOnExceptionCheckBox.Checked = domain.options.showWindowOnException
    //     this.logToFile.Checked = domain.options.logToFileOnException
    // }
    
    FormDestroy(): void {
        this.stopLogging()
    }
    
    startLogging(fileName: string): void {
        let dateString: string
        
        if (this.logging) {
            return
        }
        // TODO PDF: Fix or remove
        // AssignFile(this.outputFile, fileName)
        // if (!FileExists(fileName)) {
        //     // v1.5
        //     setDecimalSeparator()
        //     Rewrite(this.outputFile)
        // } else {
        //     // v1.5
        //     setDecimalSeparator()
        //     UNRESOLVED.append(this.outputFile)
        //     dateString = UNRESOLVED.formatDateTime("m/d/yyyy, h:m am/pm", UNRESOLVED.now)
        //     writeln(this.outputFile, "---- log start (" + dateString + ") ----")
        // }
        this.logging = true
    }
    
    stopLogging(): void {
        if (!this.logging) {
            return
        }
        writeln(this.outputFile, "---- log stop ----")
        CloseFile(this.outputFile)
        this.logging = false
    }
    
    saveExceptionListToFile(fileName: string): void {
        let i: long
        
        AssignFile(this.outputFile, fileName)
        // v1.5
        setDecimalSeparator()
        Rewrite(this.outputFile)
        try {
            for (i = 0; i <= this.DebugList.length - 1; i++) {
                writeln(this.outputFile, this.DebugList[i])
            }
        } finally {
            CloseFile(this.outputFile)
        }
    }
    
    printNested(level: long, aString: string): void {
        let i: long
        let prefix: string = ""
        
        if (level > 40) {
            level = 40
        }
        if (level > 0) {
            for (i = 1; i <= level; i++) {
                prefix += ".."
            }
        }
        this.print(prefix + aString)
    }
    
    print(aString: string): void {
        if (this.logging) {
            writeln(this.outputFile, aString)
            // TODO PDF: fix or remove: Flush(this.outputFile)
        }
        if (domain.options.showWindowOnException) {
            // TODO PDF: fix or remove:
            // this.Visible = true
            // this.BringToFront()
        }
        if (this.DebugList.length > 1000) {
            this.DebugList.length = 0
        }
        try {
            this.DebugList.push(aString)
        } catch (/* EOutOfResources */ e) {
            this.DebugList.length = 0
        }

        // TODO PDF: Scroll to bottom of DebugList
        // this.DebugList.ItemIndex = this.DebugList.length - 1
    }
    
    clear(): void {
        // TODO PDF: fix or remove: this.Visible = false
        this.DebugList.length = 0
    }
    
    CloseClick(): void {
        setActiveForm("MainForm")
    }
    
    saveListAsClick(): void {
        let fileInfo: SaveFileNamesStructure = createSaveFileNamesStructure()
        
        if (this.DebugList.length <= 0) {
            return
        }
        if (!getFileSaveInfo(FileType.kFileTypeExceptionList, kAskForFileName, "pstudio.nex", fileInfo)) {
            return
        }
        try {
            this.saveExceptionListToFile(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            cleanUpAfterFileSave(fileInfo)
        }
    }
    
    clearListClick(): void {
        if (this.DebugList.length <= 0) {
            return
        }
        this.DebugList.length = 0
    }
    
    helpButtonClick(): void {
        HelpJump("Numerical_exceptions")
    }
    
    logToFileClick(): void {
        unfinished()
        // domain.options.logToFileOnException = this.logToFile.Checked
        // if (!this.logging) {
        //     this.startLogging(ExtractFilePath(delphi_compatability.Application.exeName) + "errors.nex")
        // } else {
        //     this.stopLogging()
        // }
        // this.logging = this.logToFile.Checked
    }
    
    showOnExceptionCheckBoxClick(): void {
        unfinished()
        // domain.options.showWindowOnException = this.showOnExceptionCheckBox.Checked
    }
    
    supportButtonClick(): void {
        unfinished()
        // let infoForm: TProgramInfoForm
        
        // infoForm = uprginfo.TProgramInfoForm().create(delphi_compatability.Application)
        // try {
        //     infoForm.ShowModal()
        // } finally {
        //     infoForm.free
        //     infoForm = null
        // }
    }

    oninit() {
        setDebugForm(this)
    }

    view() {
        return m("DebugForm.TDebugForm",
            {
            // Top: "308",
            // Left: "365",
            // Height: "0",
            // Width: "0",
            // AutoScroll: "False",
            // Caption: "Messages",
            // ClientHeight: "165",
            // ClientWidth: "427",
            // Font.Charset: "DEFAULT_CHARSET",
            // Font.Color: "clWindowText",
            // Font.Height: "-11",
            // Font.Name: "Arial",
            // Font.Style: "[]",
            // Position: "poDefaultPosOnly",
            // Scaled: "False",
            // OnCreate: "FormCreate",
            // OnDestroy: "FormDestroy",
            // OnResize: "FormResize",
            // PixelsPerInch: "96",
            // TextHeight: "14",
            },
            m("TListBox.DebugList.TListBox",
                {
                    // Top: "-110",
                    // Left: "-136",
                    // Height: "249",
                    // Width: "497",
                    // Font.Charset: "DEFAULT_CHARSET",
                    // Font.Color: "clWindowText",
                    // Font.Height: "-11",
                    // Font.Name: "Arial",
                    // Font.Style: "[]",
                    // ItemHeight: "14",
                    // ParentFont: "False",
                    // TabOrder: "0",
                },
            ),
            m("button.Close.TButton",
                {
                    onclick: () => this.CloseClick(),
                    // Top: "4",
                    // Left: "364",
                    // Height: "21",
                    // Width: "60",
                    // Cancel: "True",
                    // Default: "True",
                    // TabOrder: "2",
                },
                caption("&Close"),
            ),
            m("button.saveListAs.TButton",
                {
                    onclick: () => this.saveListAsClick(),
                    // Top: "39",
                    // Left: "365",
                    // Height: "21",
                    // Width: "60",
                    // TabOrder: "3",
                },
                caption("&Save as..."),
            ),
            m("button.clearList.TButton",
                {
                    onclick: () => this.clearListClick(),
                    // Top: "63",
                    // Left: "364",
                    // Height: "21",
                    // Width: "60",
                    // TabOrder: "4",
                },
                caption("C&lear"),
            ),
            m("button.helpButton.TSpeedButton",
                {
                    onclick: () => this.helpButtonClick(),
                    // Top: "99",
                    // Left: "364",
                    // Height: "25",
                    // Width: "61",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
                },
                caption("&Help"),
            ),
            m("button.supportButton.TButton",
                {
                    onclick: () => this.supportButtonClick(),
                    // Top: "133",
                    // Left: "364",
                    // Height: "21",
                    // Width: "60",
                    // TabOrder: "5",
                },
                caption("&Info..."),
            ),
            m("div.optionsPanel.TPanel",
                {
                    // Top: "140",
                    // Left: "0",
                    // Height: "25",
                    // Width: "361",
                    // BevelInner: "bvRaised",
                    // BevelOuter: "bvLowered",
                    // TabOrder: "1",
                },
                m("div.exceptionLabel.TLabel",
                    {
                        // Top: "5",
                        // Left: "8",
                        // Height: "14",
                        // Width: "64",
                    },
                    "On message:",
                ),
                m("label.checkbox-inline.showOnExceptionCheckBox.TCheckBox", m("input[type=checkbox]",
                    {
                        onclick: () => this.showOnExceptionCheckBoxClick(),
                        // Top: "5",
                        // Left: "83",
                        // Height: "17",
                        // Width: "68",
                        // TabOrder: "0",
                    },),
                    caption("&appear"),
                ),
                m("label.checkbox-inline.logToFile.TCheckBox", m("input[type=checkbox]",
                    {
                        onclick: () => this.logToFileClick(),
                        // Top: "5",
                        // Left: "146",
                        // Height: "17",
                        // Width: "77",
                        // TabOrder: "1",
                    },),
                    caption("l&og to file"),
                ),
            ),
        )
    }
    
}

