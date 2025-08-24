// unit Udebug

from conversion_common import *
import umain
import uprginfo
import umath
import usupport
import udomain
import updform
import delphi_compatability

// var
let DebugForm: TDebugForm


//$R *.DFM
function DebugPrint(aMessage: string): void {
    if (DebugForm !== null) {
        DebugForm.print(aMessage)
    }
}

// const
const kBetweenGap = 4



export class TDebugForm {
    DebugList: TListBox = new TListBox()
    Close: TButton = new TButton()
    saveListAs: TButton = new TButton()
    clearList: TButton = new TButton()
    optionsPanel: TPanel = new TPanel()
    exceptionLabel: TLabel = new TLabel()
    showOnExceptionCheckBox: TCheckBox = new TCheckBox()
    logToFile: TCheckBox = new TCheckBox()
    helpButton: TSpeedButton = new TSpeedButton()
    supportButton: TButton = new TButton()
    outputFile: TextFile = new TextFile()
    logging: boolean = false
    TDebugForm.prototype = new PdForm()
    TDebugForm.prototype.constructor = TDebugForm
    
    FormCreate(Sender: TObject): void {
        let tempBoundsRect: TRect
        
        // keep window on screen - left corner of title bar 
        tempBoundsRect = udomain.domain.debugWindowRect
        if ((tempBoundsRect.Left !== 0) || (tempBoundsRect.Right !== 0) || (tempBoundsRect.Top !== 0) || (tempBoundsRect.Bottom !== 0)) {
            if (tempBoundsRect.Left > delphi_compatability.Screen.Width - umain.kMinWidthOnScreen) {
                tempBoundsRect.Left = delphi_compatability.Screen.Width - umain.kMinWidthOnScreen
            }
            if (tempBoundsRect.Top > delphi_compatability.Screen.Height - umain.kMinHeightOnScreen) {
                tempBoundsRect.Top = delphi_compatability.Screen.Height - umain.kMinHeightOnScreen
            }
            this.SetBounds(tempBoundsRect.Left, tempBoundsRect.Top, tempBoundsRect.Right, tempBoundsRect.Bottom)
        }
        this.showOnExceptionCheckBox.Checked = udomain.domain.options.showWindowOnException
        this.logToFile.Checked = udomain.domain.options.logToFileOnException
        // this will make the list box create a horizontal scroll bar 
        UNRESOLVED.sendMessage(this.DebugList.Handle, UNRESOLVED.LB_SETHORIZONTALEXTENT, 1000, 0)
    }
    
    FormDestroy(Sender: TObject): void {
        this.stopLogging()
    }
    
    startLogging(fileName: string): void {
        let dateString: string
        
        if (this.logging) {
            return
        }
        AssignFile(this.outputFile, fileName)
        if (!FileExists(fileName)) {
            // v1.5
            usupport.setDecimalSeparator()
            Rewrite(this.outputFile)
        } else {
            // v1.5
            usupport.setDecimalSeparator()
            UNRESOLVED.append(this.outputFile)
            dateString = UNRESOLVED.formatDateTime("m/d/yyyy, h:m am/pm", UNRESOLVED.now)
            writeln(this.outputFile, "---- log start (" + dateString + ") ----")
        }
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
        usupport.setDecimalSeparator()
        Rewrite(this.outputFile)
        try {
            if (this.DebugList.Items.Count > 0) {
                for (i = 0; i <= this.DebugList.Items.Count - 1; i++) {
                    writeln(this.outputFile, this.DebugList.Items[i])
                }
            }
        } finally {
            CloseFile(this.outputFile)
        }
    }
    
    printNested(level: long, aString: string): void {
        let i: long
        let prefix: ansistring
        
        if (level > 40) {
            level = 40
        }
        prefix = ""
        if (level > 0) {
            for (i = 1; i <= level; i++) {
                UNRESOLVED.AppendStr(prefix, "..")
            }
        }
        this.print(prefix + aString)
    }
    
    print(aString: string): void {
        if (this.logging) {
            writeln(this.outputFile, aString)
            Flush(this.outputFile)
        }
        if (udomain.domain.options.showWindowOnException) {
            this.Visible = true
            this.BringToFront()
        }
        if (this.DebugList.Items.Count > 1000) {
            this.DebugList.Items.Clear()
        }
        try {
            this.DebugList.Items.Add(aString)
        } catch (EOutOfResources e) {
            this.DebugList.Items.Clear()
        }
        this.DebugList.ItemIndex = this.DebugList.Items.Count - 1
        this.DebugList.Invalidate()
        this.DebugList.Refresh()
    }
    
    clear(): void {
        this.Visible = false
        this.DebugList.Items.Clear()
    }
    
    CloseClick(Sender: TObject): void {
        this.Visible = false
    }
    
    saveListAsClick(Sender: TObject): void {
        let fileInfo: SaveFileNamesStructure
        
        if (this.DebugList.Items.Count <= 0) {
            return
        }
        if (!usupport.getFileSaveInfo(usupport.kFileTypeExceptionList, usupport.kAskForFileName, "pstudio.nex", fileInfo)) {
            return
        }
        try {
            this.saveExceptionListToFile(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            usupport.cleanUpAfterFileSave(fileInfo)
        }
    }
    
    clearListClick(Sender: TObject): void {
        if (this.DebugList.Items.Count <= 0) {
            return
        }
        this.DebugList.Items.Clear()
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Numerical_exceptions")
    }
    
    FormResize(Sender: TObject): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        this.Close.Left = this.ClientWidth - this.Close.Width - kBetweenGap
        this.saveListAs.Left = this.Close.Left
        this.clearList.Left = this.Close.Left
        this.helpButton.Left = this.Close.Left
        this.supportButton.Left = this.Close.Left
        this.DebugList.SetBounds(kBetweenGap, kBetweenGap, this.Close.Left - kBetweenGap * 2, umath.intMax(0, this.ClientHeight - this.optionsPanel.Height - kBetweenGap * 3))
        this.optionsPanel.SetBounds(kBetweenGap, umath.intMax(0, this.ClientHeight - this.optionsPanel.Height - kBetweenGap), this.Close.Left - kBetweenGap * 2, this.optionsPanel.Height)
    }
    
    WMGetMinMaxInfo(MSG: Tmessage): void {
        PdForm.prototype.WMGetMinMaxInfo.call(this)
        //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
        UNRESOLVED.ptMinTrackSize.x = 350
        UNRESOLVED.ptMinTrackSize.y = 190
    }
    
    logToFileClick(Sender: TObject): void {
        udomain.domain.options.logToFileOnException = this.logToFile.Checked
        if (!this.logging) {
            this.startLogging(ExtractFilePath(delphi_compatability.Application.exeName) + "errors.nex")
        } else {
            this.stopLogging()
        }
        this.logging = this.logToFile.Checked
    }
    
    showOnExceptionCheckBoxClick(Sender: TObject): void {
        udomain.domain.options.showWindowOnException = this.showOnExceptionCheckBox.Checked
    }
    
    supportButtonClick(Sender: TObject): void {
        let infoForm: TProgramInfoForm
        
        infoForm = uprginfo.TProgramInfoForm().create(delphi_compatability.Application)
        try {
            infoForm.ShowModal()
        } finally {
            infoForm.free
            infoForm = null
        }
    }
    
}

