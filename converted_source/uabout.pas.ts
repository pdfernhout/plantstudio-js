// unit uabout

from conversion_common import *
import uprginfo
import umath
import usupport
import uregister
import udomain
import delphi_compatability

// var
let AboutForm: TAboutForm



export class TAboutForm {
    close: TButton = new TButton()
    cancel: TButton = new TButton()
    versionLabel: TLabel = new TLabel()
    splashScreenPicture: TImage = new TImage()
    Label2: TLabel = new TLabel()
    supportButton: TButton = new TButton()
    TAboutForm.prototype = new TForm()
    TAboutForm.prototype.constructor = TAboutForm
    
    //$R *.DFM
    initializeWithWhetherClosingProgram(closingProgram: boolean): void {
        if (closingProgram) {
            this.close.Caption = "Quit"
        } else {
            this.close.Caption = "Close"
        }
        this.cancel.Visible = closingProgram
    }
    
    FormActivate(Sender: TObject): void {
        let timeBetween: TDateTime
        let hours: byte
        let minutes: byte
        let seconds: byte
        let milliseconds: byte
        let smallHours: byte
        let randomNumber: int
        let i: short
        
        this.versionLabel.Caption = usupport.gVersionName
    }
    
    closeClick(Sender: TObject): void {
        this.ModalResult = mrOK
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

