// unit Uwait

from conversion_common import *
import delphi_compatability

// var
let WaitForm: TWaitForm


function startWaitMessage(messageString: string): void {
    if (messageString === "") {
        return
    }
    if (WaitForm === null) {
        return
    }
    if (WaitForm.messageLabel === null) {
        return
    }
    if (WaitForm.messageLabel.Canvas === null) {
        return
    }
    WaitForm.messageLabel.Caption = messageString
    WaitForm.ClientWidth = WaitForm.messageLabel.Left + WaitForm.messageLabel.Width + 12
    if (WaitForm.ClientHeight < WaitForm.messageLabel.Canvas.TextHeight("W") + 8) {
        WaitForm.ClientHeight = WaitForm.messageLabel.Canvas.TextHeight("W") + 8
    }
    WaitForm.messageLabel.Invalidate()
    WaitForm.Show()
    delphi_compatability.Application.ProcessMessages()
}

function stopWaitMessage(): void {
    WaitForm.Hide()
    delphi_compatability.Application.ProcessMessages()
}


export class TWaitForm {
    Panel1: TPanel = new TPanel()
    messageLabel: TLabel = new TLabel()
    Image1: TImage = new TImage()
    TWaitForm.prototype = new TForm()
    TWaitForm.prototype.constructor = TWaitForm
    
    //$R *.DFM
    CreateParams(Params: TCreateParams): void {
        TForm.prototype.CreateParams.call(this, Params)
        Params.Style = Params.Style || delphi_compatability.WS_BORDER || delphi_compatability.WS_EX_DLGMODALFRAME
    }
    
}

