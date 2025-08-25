// unit unoted

from conversion_common import *
import udomain
import updform
import delphi_compatability

// const
const kBetweenGap = 4



export class TNoteEditForm {
    OK: TButton = new TButton()
    cancel: TButton = new TButton()
    noteEditMemo: TMemo = new TMemo()
    wrapLines: TCheckBox = new TCheckBox()
    helpButton: TSpeedButton = new TSpeedButton()
    TNoteEditForm.prototype = new PdForm()
    TNoteEditForm.prototype.constructor = TNoteEditForm
    
    //$R *.DFM
    FormCreate(Sender: TObject): void {
        this.noteEditMemo.WordWrap = udomain.domain.options.noteEditorWrapLines
        this.wrapLines.Checked = udomain.domain.options.noteEditorWrapLines
    }
    
    FormResize(Sender: TObject): void {
        this.OK.Left = this.ClientWidth - this.OK.Width - kBetweenGap
        this.cancel.Left = this.OK.Left
        this.helpButton.Left = this.OK.Left
        this.wrapLines.Left = this.OK.Left + kBetweenGap
        this.noteEditMemo.SetBounds(kBetweenGap, kBetweenGap, this.OK.Left - kBetweenGap * 2, this.ClientHeight - kBetweenGap * 2)
    }
    
    wrapLinesClick(Sender: TObject): void {
        udomain.domain.options.noteEditorWrapLines = this.wrapLines.Checked
        this.noteEditMemo.WordWrap = udomain.domain.options.noteEditorWrapLines
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Editing_plant_notes")
    }
    
}

