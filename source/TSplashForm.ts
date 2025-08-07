// unit Usplash

import * as m from "mithril"
import { imageDir } from "./common"

export class TSplashForm {
    // versionLabel: TLabel = new TLabel()
    // loadingLabel: TLabel = new TLabel()
    // codeLabel: TLabel = new TLabel()
    // splashImage256Colors: TImage = new TImage()
    // splashImageTrueColor: TImage = new TImage()
    // close: TSpeedButton = new TSpeedButton()
    // supportButton: TSpeedButton = new TSpeedButton()
    // TSplashForm.prototype = new TForm()
    // TSplashForm.prototype.constructor = TSplashForm
    
    // //$R *.DFM
    // CreateParams(Params: TCreateParams): void {
    //     TForm.prototype.CreateParams.call(this, Params)
    //     Params.Style = Params.Style || delphi_compatability.WS_BORDER || delphi_compatability.WS_EX_DLGMODALFRAME
    // }
    
    // FormCreate(Sender: TObject): void {
    //     this.versionLabel.Caption = usupport.gVersionName
    // }
    
    // showLoadingString(aString: string): void {
    //     this.loadingLabel.Caption = aString
    //     this.Update()
    // }
    
    // showCodeString(aString: string): void {
    //     this.codeLabel.Caption = aString
    //     this.codeLabel.Show()
    //     this.Update()
    // }
    
    // goAway(): void {
    //     this.ModalResult = mrOK
    // }
    
    // FormClick(Sender: TObject): void {
    //     this.goAway()
    // }
    
    // programNameLabelClick(Sender: TObject): void {
    //     this.goAway()
    // }
    
    // controlClick(Sender: TObject): void {
    //     this.goAway()
    // }
    
    // FormKeyPress(Sender: TObject, Key: char): void {
    //     this.goAway()
    //     return Key
    // }
    
    // FormKeyDown(Sender: TObject, Key: byte, Shift: TShiftState): void {
    //     this.goAway()
    //     return Key
    // }
    
    // FormMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.goAway()
    // }
    
    // splashImage256ColorsClick(Sender: TObject): void {
    //     this.goAway()
    // }
    
    // OKClick(Sender: TObject): void {
    //     this.goAway()
    // }
    
    // FormActivate(Sender: TObject): void {
    //     let screenColorBits: int
    //     let screenDC: HDC
        
    //     screenDC = UNRESOLVED.GetDC(0)
    //     try {
    //         screenColorBits = (UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.BITSPIXEL) * UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.PLANES))
    //     } finally {
    //         UNRESOLVED.ReleaseDC(0, screenDC)
    //     }
    //     if (screenColorBits > 8) {
    //         this.splashImageTrueColor.Visible = true
    //         this.splashImage256Colors.Visible = false
    //         this.splashImageTrueColor.Left = 0
    //         this.splashImageTrueColor.Top = 0
    //         this.splashImageTrueColor.SendToBack()
    //     } else {
    //         this.splashImage256Colors.Visible = true
    //         this.splashImageTrueColor.Visible = false
    //         this.splashImage256Colors.Left = 0
    //         this.splashImage256Colors.Top = 0
    //         this.splashImage256Colors.SendToBack()
    //     }
    // }
    
    // closeClick(Sender: TObject): void {
    //     this.ModalResult = mrOK
    // }
    
    // supportButtonClick(Sender: TObject): void {
    //     let infoForm: TProgramInfoForm
        
    //     infoForm = uprginfo.TProgramInfoForm().create(delphi_compatability.Application)
    //     try {
    //         infoForm.ShowModal()
    //     } finally {
    //         infoForm.free
    //         infoForm = null
    //     }
    // }

    view(vnode: any) {
        return m("div",
            { 
                tabindex: "0",
                onclick: () => vnode.attrs.close(),
                onkeydown: () => vnode.attrs.close(),
                oncreate: (vnode: any) => vnode.dom.focus()
            },
            m("img.w-100.h-100", {
                src: imageDir + "SplashForm_splashImageTrueColor.png", 
                alt: "Apical infloresences example"
            })
        )
    }
}

