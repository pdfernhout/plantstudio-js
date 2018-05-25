// unit uregister

from conversion_common import *
import udebug
import uregistersupport
import usupport
import udomain
import updform
import delphi_compatability

// var
let RegistrationForm: TRegistrationForm


// const
const kMaxUnsuccessfulTries = 10



export class TRegistrationForm {
    Label11: TLabel = new TLabel()
    Panel1: TPanel = new TPanel()
    Label3: TLabel = new TLabel()
    Label4: TLabel = new TLabel()
    registrationNameEdit: TEdit = new TEdit()
    registrationCodeEdit: TEdit = new TEdit()
    Label1: TLabel = new TLabel()
    orderPageEdit: TEdit = new TEdit()
    Label2: TLabel = new TLabel()
    Label5: TLabel = new TLabel()
    openBrowser: TButton = new TButton()
    close: TButton = new TButton()
    readLicense: TButton = new TButton()
    moreInfo: TButton = new TButton()
    registerMe: TButton = new TButton()
    Label6: TLabel = new TLabel()
    PrintButton: TButton = new TButton()
    PrintDialog: TPrintDialog = new TPrintDialog()
    thankYou: TRichEdit = new TRichEdit()
    printedDetails: boolean = false
    opened: boolean = false
    unsuccessfulRegistrationTries: short = 0
    TRegistrationForm.prototype = new PdForm()
    TRegistrationForm.prototype.constructor = TRegistrationForm
    
    //$R *.DFM
    FormCreate(Sender: TObject): void {
        this.thankYou.visible = true
        this.thankYou.visible = false
        this.unsuccessfulRegistrationTries = 0
    }
    
    FormActivate(Sender: TObject): void {
        this.opened = true
    }
    
    openBrowserClick(Sender: TObject): void {
        UNRESOLVED.ShellExecute(this.Handle, "open", "http://www.kurtz-fernhout.com/order.htm", null, null, delphi_compatability.SW_SHOWNORMAL)
    }
    
    registerMeClick(Sender: TObject): void {
        let cr: string
        let correct: boolean
        
        correct = uregistersupport.RegistrationMatch(this.registrationNameEdit.Text, this.registrationCodeEdit.Text)
        if (correct) {
            this.registerMe.Hide()
            this.thankYou.clear
            cr = chr(13) + chr(10)
            this.thankYou.text = "PlantStudio version 2.x Registration Details" + cr + "-------------------------------------------" + cr + "Registration name:  " + this.registrationNameEdit.Text + cr + "Registration code:  " + this.registrationCodeEdit.Text + cr + cr + "Welcome to the PlantStudio community!" + cr + "You now own a fully registered copy of PlantStudio version 2.x." + cr + cr + "We will save encoded registration information in your settings file in your Windows directory. You should keep a copy of your name and code in a safe place in case you need to reinstall PlantStudio." + cr + cr + "(You should click Print now to print this message.)" + cr + cr + "Be sure to visit our web site to read the latest news about PlantStudio and to see the PlantStudio plant exchange and gallery. Thank you for your business!" + cr + cr + "--- Cynthia Kurtz and Paul Fernhout" + cr + "Kurtz-Fernhout Software" + cr + "http://www.kurtz-fernhout.com" + cr + "-------------------------------------------"
            this.thankYou.left = 4
            this.thankYou.top = 4
            this.thankYou.show
            this.thankYou.bringToFront
            udomain.domain.registrationName = this.registrationNameEdit.Text
            udomain.domain.registrationCode = this.registrationCodeEdit.Text
            udomain.domain.registered = true
            udomain.domain.justRegistered = true
            this.PrintButton.Visible = true
        } else {
            if (this.unsuccessfulRegistrationTries >= kMaxUnsuccessfulTries) {
                MessageDialog("The registration name and code you entered are incorrect." + chr(13) + "You have attempted to register " + IntToStr(kMaxUnsuccessfulTries) + " times during this session." + chr(13) + chr(13) + "The program will now close." + chr(13) + "Please restart the program and try again." + chr(13) + chr(13) + "If you are sure your information is correct, contact us for help.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
                delphi_compatability.Application.Terminate()
            } else {
                MessageDialog("The registration name and code you entered are incorrect." + chr(13) + "Please retype them and try again." + chr(13) + chr(13) + "If you are sure they are correct" + chr(13) + "and you still get this message, contact us.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
            }
            this.unsuccessfulRegistrationTries += 1
        }
    }
    
    FormCloseQuery(Sender: TObject, CanClose: boolean): void {
        if (!this.opened) {
            return CanClose
        }
        CanClose = false
        if ((!udomain.domain.registered) && ((trim(this.registrationNameEdit.Text) !== "") || (trim(this.registrationCodeEdit.Text) !== ""))) {
            // why do this? because people might put in the info, then click OK without clicking Register Me
            // and think they have registered when they have not
            ShowMessage("You entered registration information but didn't finish registering." + chr(13) + "You should click \"Register Me!\" or clear out the registration information.")
            return CanClose
        }
        if ((udomain.domain.registered) && (!this.printedDetails)) {
            if (MessageDialog("You registered but didn't print the information." + chr(13) + "Do you want to leave WITHOUT printing your registration information?", mtConfirmation, mbYesNoCancel, 0) !== delphi_compatability.IDYES) {
                return CanClose
            }
        }
        CanClose = true
        return CanClose
    }
    
    closeClick(Sender: TObject): void {
        if (udomain.domain.registered) {
            this.ModalResult = mrOK
        } else {
            this.ModalResult = mrCancel
        }
    }
    
    PrintButtonClick(Sender: TObject): void {
        if (this.PrintDialog.execute) {
            this.thankYou.print("PlantStudio version 1.x Registration Details")
            this.printedDetails = true
        }
    }
    
    moreInfoClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Why_register?")
    }
    
    readLicenseClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("License")
    }
    
    FormKeyPress(Sender: TObject, Key: char): void {
        Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
        return Key
    }
    
}

