// unit Udebug

import * as m from "mithril"
import { domain } from "./PdDomain"
import { AssignFile, caption, CloseFile, ExtractFilePath, HelpJump, imageDir, long, Rewrite, TextFile, writeln } from "./common"
import { intMax } from "./umath"
import { cleanUpAfterFileSave, createSaveFileNamesStructure, FileType, getFileSaveInfo, kAskForFileName, SaveFileNamesStructure, setDecimalSeparator } from "./usupport"
import { TRect } from "./TRect"
import { exeName, unfinished } from "./temporary"
import { activeForm, DebugForm, setActiveForm, setDebugForm } from "./FormHolder"

export function DebugPrint(aMessage: string): void {
    if (DebugForm) {
        DebugForm.print(aMessage)
    } else {
        console.log("DebugPrint called without form:", aMessage)
    }
}

export class TDebugForm {
    DebugList: string[] = []
    outputFile: TextFile = new TextFile()
    logging: boolean = false
    
    // TODO PDF: Remove or improve this to perhaps use beforeunload event, but see MDN docs on limitations
    // FormDestroy(): void {
    //     this.stopLogging()
    // }
    
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
    
    logToFileClick(event: any): void {
        domain.options.logToFileOnException = event.target.checked
        if (!this.logging) {
            this.startLogging(ExtractFilePath(exeName) + "errors.nex")
        } else {
            this.stopLogging()
        }
        this.logging = domain.options.logToFileOnException
    }
    
    showOnExceptionCheckBoxClick(event: any): void {
        domain.options.showWindowOnException = event.target.checked
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
        // COmmented code for interactive testing:
        // for (let i = 0; i < 1000; i++) {
        //     this.DebugList.push("test error " + i)
        // }
    }

    view() {
        if (activeForm && activeForm !== "DebugForm") return []
        return m("DebugForm.TDebugForm",
            m("div.f3.b", "Debug messages"),
            m("div.buttonPanel.mt1",
                m("button.Close.TButton",
                    {
                        onclick: () => this.CloseClick(),
                    },
                    caption("&Back to Main"),
                ),
                m("button.saveListAs.TButton.ml2",
                    {
                        onclick: () => this.saveListAsClick(),
                    },
                    caption("&Save as..."),
                ),
                m("button.clearList.TButton.ml2",
                    {
                        onclick: () => this.clearListClick(),
                    },
                    caption("C&lear"),
                ),
                m("button.helpButton.TSpeedButton.ml2",
                    {
                        onclick: () => this.helpButtonClick(),
                    },
                    m("img.TImage.mr1", { src: imageDir + "DebugForm_helpButton.png" } ),
                    caption("&Help"),
                ),
                m("button.supportButton.TButton.ml2",
                    {
                        onclick: () => this.supportButtonClick(),
                    },
                    caption("&Info..."),
                ),
            ),
            m("div.optionsPanel.TPanel.ba.pa2.mt1.mb1",
                m("div.exceptionLabel.TLabel",
                    "On message:",
                ),
                m("label.checkbox-inline.showOnExceptionCheckBox.TCheckBox.ml2", m("input[type=checkbox].mr1",
                    {
                        onclick: (event: any) => this.showOnExceptionCheckBoxClick(event),
                        checked: domain.options.showWindowOnException,
                    },),
                    caption("&appear"),
                ),
                m("br"),
                m("label.checkbox-inline.logToFile.TCheckBox.ml2", m("input[type=checkbox].mr1",
                    {
                        onclick: (event: any) => this.logToFileClick(event),
                        checked: domain.options.logToFileOnException,
                    },),
                    caption("l&og to file"),
                ),
            ),
            this.DebugList.length === 0 ? m("div.b", "No debug messages") : m("div.fs3.b", "Debug message are below:"),
            m("div.TListBox.DebugList.TListBox",
                this.DebugList.map(item => m("div", item))
            )
        )
    }
    
}

