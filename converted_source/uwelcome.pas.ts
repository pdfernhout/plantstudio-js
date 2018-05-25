// unit uwelcome

from conversion_common import *
import updform
import delphi_compatability

// const
const kReadSuperSpeedTour = 0
const kReadTutorial = 1
const kMakeNewPlant = 2
const kOpenPlantLibrary = 3
const kStartUsingProgram = 4



export class TWelcomeForm {
    hideWelcomeForm: TCheckBox = new TCheckBox()
    Label3: TLabel = new TLabel()
    Label1: TLabel = new TLabel()
    Image1: TImage = new TImage()
    readQuickStartTipList: TButton = new TButton()
    readTutorial: TButton = new TButton()
    makeNewPlant: TButton = new TButton()
    openPlantLibrary: TButton = new TButton()
    startUsingProgram: TButton = new TButton()
    whatToDo: short = 0
    TWelcomeForm.prototype = new PdForm()
    TWelcomeForm.prototype.constructor = TWelcomeForm
    
    //$R *.DFM
    CreateParams(Params: TCreateParams): void {
        PdForm.prototype.CreateParams.call(this, Params)
        Params.Style = Params.Style || delphi_compatability.WS_BORDER || delphi_compatability.WS_EX_DLGMODALFRAME
    }
    
    readQuickStartTipListClick(Sender: TObject): void {
        this.whatToDo = kReadSuperSpeedTour
        this.ModalResult = mrOK
    }
    
    readTutorialClick(Sender: TObject): void {
        this.whatToDo = kReadTutorial
        this.ModalResult = mrOK
    }
    
    makeNewPlantClick(Sender: TObject): void {
        this.whatToDo = kMakeNewPlant
        this.ModalResult = mrOK
    }
    
    openPlantLibraryClick(Sender: TObject): void {
        this.whatToDo = kOpenPlantLibrary
        this.ModalResult = mrOK
    }
    
    startUsingProgramClick(Sender: TObject): void {
        this.whatToDo = kStartUsingProgram
        this.ModalResult = mrOK
    }
    
}

