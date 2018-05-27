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
    registerIt: TButton = new TButton()
    readLicense: TButton = new TButton()
    cancel: TButton = new TButton()
    whyRegister: TButton = new TButton()
    versionLabel: TLabel = new TLabel()
    registrationInfoPanel: TPanel = new TPanel()
    noDistributeLabel: TLabel = new TLabel()
    timeWarningLabel: TLabel = new TLabel()
    hoursLabel: TLabel = new TLabel()
    Label4: TLabel = new TLabel()
    Label5: TLabel = new TLabel()
    Label6: TLabel = new TLabel()
    unregistered2DExportReminder: TImage = new TImage()
    Label7: TLabel = new TLabel()
    Label1: TLabel = new TLabel()
    splashScreenPicture: TImage = new TImage()
    Label2: TLabel = new TLabel()
    unregistered3DExportReminder: TImage = new TImage()
    supportButton: TButton = new TButton()
    exportRestrictionLabel: TLabel = new TLabel()
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
        this.exportRestrictionLabel.Caption = "- restricting the number of exports to " + IntToStr(udomain.kMaxUnregExportsAllowed) + " at first, then " + IntToStr(udomain.kMaxUnregExportsPerSessionAfterMaxReached) + " per session"
        this.ActiveControl = this.registerIt
        UNRESOLVED.randomize
        for (i = 0; i <= 100; i++) {
            UNRESOLVED.random
        }
        randomNumber = UNRESOLVED.random(2)
        switch (randomNumber) {
            case 0:
                this.close.Top = 4
                this.registerIt.Top = this.close.Top + this.close.Height + 3
                break
            case 1:
                this.registerIt.Top = 4
                this.close.Top = this.registerIt.Top + this.registerIt.Height + 3
                break
        }
        this.hoursLabel.Caption = "You have been evaluating PlantStudio for "
        timeBetween = umath.max((UNRESOLVED.Now - udomain.domain.startTimeThisSession), 0) + udomain.domain.accumulatedUnregisteredTime
        UNRESOLVED.DecodeTime(timeBetween, smallHours, minutes, seconds, milliseconds)
        hours = smallHours
        if (timeBetween >= 1.0) {
            hours = hours + trunc(timeBetween) * 24
        }
        if ((minutes < 1) && (hours < 1)) {
            this.hoursLabel.Caption = this.hoursLabel.Caption + "less than one minute."
        } else if ((minutes === 1) && (hours < 1)) {
            this.hoursLabel.Caption = this.hoursLabel.Caption + "one minute."
        } else if (hours < 1) {
            this.hoursLabel.Caption = this.hoursLabel.Caption + IntToStr(minutes) + " minutes."
        } else if (hours === 1) {
            this.hoursLabel.Caption = this.hoursLabel.Caption + IntToStr(hours) + " hour and " + IntToStr(minutes) + " minutes."
        } else {
            this.hoursLabel.Caption = this.hoursLabel.Caption + IntToStr(hours) + " hours and " + IntToStr(minutes) + " minutes."
        }
        this.timeWarningLabel.Caption = "If you have been using PlantStudio for " + IntToStr(usupport.kMaxEvaluationTime_hours) + " hours or more (in total), you are legally required to register it."
        if (hours >= usupport.kMaxEvaluationTime_hours) {
            this.timeWarningLabel.Font.Color = delphi_compatability.clGreen
            this.timeWarningLabel.Font.Style = {UNRESOLVED.fsBold, }
        }
    }
    
    closeClick(Sender: TObject): void {
        this.ModalResult = mrOK
    }
    
    registerItClick(Sender: TObject): void {
        if (uregister.RegistrationForm.ShowModal() === mrOK) {
            this.ModalResult = mrCancel
        }
    }
    
    readLicenseClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("License")
    }
    
    whyRegisterClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Why_register?")
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

