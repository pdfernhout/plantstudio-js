// unit Uundo

from conversion_common import *
import umain
import udomain
import umath
import updform
import ucommand
import delphi_compatability

// const
const kBetweenGap = 4



export class TUndoRedoListForm {
    OK: TButton = new TButton()
    cancel: TButton = new TButton()
    helpButton: TSpeedButton = new TSpeedButton()
    undoListLabel: TLabel = new TLabel()
    redoListLabel: TLabel = new TLabel()
    undoList: TListBox = new TListBox()
    redoList: TListBox = new TListBox()
    TUndoRedoListForm.prototype = new PdForm()
    TUndoRedoListForm.prototype.constructor = TUndoRedoListForm
    
    //$R *.DFM
    FormCreate(Sender: TObject): void {
        let tempBoundsRect: TRect
        
        // keep window on screen - left corner of title bar 
        tempBoundsRect = udomain.domain.undoRedoListWindowRect
        if ((tempBoundsRect.Left !== 0) || (tempBoundsRect.Right !== 0) || (tempBoundsRect.Top !== 0) || (tempBoundsRect.Bottom !== 0)) {
            if (tempBoundsRect.Left > delphi_compatability.Screen.Width - umain.kMinWidthOnScreen) {
                tempBoundsRect.Left = delphi_compatability.Screen.Width - umain.kMinWidthOnScreen
            }
            if (tempBoundsRect.Top > delphi_compatability.Screen.Height - umain.kMinHeightOnScreen) {
                tempBoundsRect.Top = delphi_compatability.Screen.Height - umain.kMinHeightOnScreen
            }
            this.SetBounds(tempBoundsRect.Left, tempBoundsRect.Top, tempBoundsRect.Right, tempBoundsRect.Bottom)
        }
        // make list boxes have horizontal scroll bars
        UNRESOLVED.sendMessage(this.undoList.Handle, UNRESOLVED.LB_SETHORIZONTALEXTENT, 1000, 0)
        UNRESOLVED.sendMessage(this.redoList.Handle, UNRESOLVED.LB_SETHORIZONTALEXTENT, 1000, 0)
    }
    
    initializeWithCommandList(commandList: PdCommandList): void {
        let aList: TStringList
        
        aList = delphi_compatability.TStringList.create
        try {
            commandList.fillListWithUndoableStrings(aList)
            this.undoList.Items.Assign(aList)
            aList.Clear()
            commandList.fillListWithRedoableStrings(aList)
            this.redoList.Items.Assign(aList)
        } finally {
            aList.free
        }
        this.OK.Enabled = (this.undoList.SelCount > 0) || (this.redoList.SelCount > 0)
    }
    
    undoToIndex(): int {
        let result = 0
        let i: int
        
        result = -1
        if (this.undoList.Items.Count > 0) {
            for (i = this.undoList.Items.Count - 1; i >= 0; i--) {
                if (this.undoList.Selected[i]) {
                    result = i
                    return result
                }
            }
        }
        return result
    }
    
    redoToIndex(): int {
        let result = 0
        let i: int
        
        result = -1
        if (this.redoList.Items.Count > 0) {
            for (i = this.redoList.Items.Count - 1; i >= 0; i--) {
                if (this.redoList.Selected[i]) {
                    result = i
                    return result
                }
            }
        }
        return result
    }
    
    regulateListSelections(Sender: TObject): void {
        let i: int
        let thisListBox: TListBox
        let otherListBox: TListBox
        
        if ((Sender === null) || (!(Sender instanceof delphi_compatability.TListBox))) {
            throw new GeneralException.create("Problem: Wrong sender in method TUndoRedoListForm.regulateListSelections.")
        }
        thisListBox = Sender
        if (Sender === this.undoList) {
            otherListBox = this.redoList
        } else {
            otherListBox = this.undoList
        }
        if (Sender === this.undoList) {
            this.OK.Caption = "Un&do"
        } else {
            this.OK.Caption = "Re&do"
        }
        this.OK.Enabled = (this.undoList.SelCount > 0) || (this.redoList.SelCount > 0)
        if (thisListBox.ItemIndex >= 0) {
            for (i = 0; i <= thisListBox.ItemIndex; i++) {
                thisListBox.Selected[i] = true
            }
        }
        if (thisListBox.ItemIndex + 1 <= thisListBox.Items.Count - 1) {
            for (i = thisListBox.ItemIndex + 1; i <= thisListBox.Items.Count - 1; i++) {
                thisListBox.Selected[i] = false
            }
        }
        if (otherListBox.Items.Count > 0) {
            for (i = 0; i <= otherListBox.Items.Count - 1; i++) {
                otherListBox.Selected[i] = false
            }
        }
        otherListBox.ItemIndex = -1
    }
    
    OKClick(Sender: TObject): void {
        this.ModalResult = mrOK
    }
    
    cancelClick(Sender: TObject): void {
        this.ModalResult = mrCancel
    }
    
    FormClose(Sender: TObject, Action: TCloseAction): void {
        udomain.domain.undoRedoListWindowRect = Rect(this.Left, this.Top, this.Width, this.Height)
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Using_the_undo/redo_list")
    }
    
    FormResize(Sender: TObject): void {
        let listHeight: int
        

    view() {
        return m("UndoRedoListForm.TUndoRedoListForm",
            {
            // Top: "254",
            // Left: "384",
            // Height: "0",
            // Width: "0",
            // AutoScroll: "False",
            // Caption: "Undo/Redo List",
            // ClientHeight: "255",
            // ClientWidth: "467",
            // Font.Charset: "DEFAULT_CHARSET",
            // Font.Color: "clWindowText",
            // Font.Height: "-11",
            // Font.Name: "MS Sans Serif",
            // Font.Style: "[]",
            // Position: "poDefaultPosOnly",
            // Scaled: "False",
            // OnClose: "FormClose",
            // OnCreate: "FormCreate",
            // OnResize: "FormResize",
            // PixelsPerInch: "96",
            // TextHeight: "13",
            },
            m("Group.Group.g00000004",
                m("div.undoListLabel.TLabel",
                    {
                        // Top: "4",
                        // Left: "4",
                        // Height: "13",
                        // Width: "102",
                    },
                    caption("Things you can &Undo"),
                ),
                m("button.OK.TButton",
                    {
                        onclick: OKClick,
                        // Top: "4",
                        // Left: "385",
                        // Height: "21",
                        // Width: "80",
                        // TabOrder: "0",
                    },
                    caption("Un&do/Redo"),
                ),
            ),
            m("TListBox.undoList.TListBox",
                {
                    onclick: regulateListSelections,
                    // Top: "20",
                    // Left: "4",
                    // Height: "97",
                    // Width: "375",
                    // ItemHeight: "13",
                    // MultiSelect: "True",
                    // TabOrder: "2",
                },
            ),
            m("button.cancel.TButton",
                {
                    onclick: cancelClick,
                    // Top: "30",
                    // Left: "385",
                    // Height: "21",
                    // Width: "80",
                    // TabOrder: "1",
                },
                caption("&Cancel"),
            ),
            m("button.helpButton.TSpeedButton",
                {
                    onclick: helpButtonClick,
                    // Top: "69",
                    // Left: "385",
                    // Height: "25",
                    // Width: "80",
                    // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
                },
                caption("&Help"),
            ),
            m("div.redoListLabel.TLabel",
                {
                    // Top: "122",
                    // Left: "4",
                    // Height: "13",
                    // Width: "102",
                },
                caption("Things you can &Redo"),
            ),
            m("TListBox.redoList.TListBox",
                {
                    onclick: regulateListSelections,
                    // Top: "140",
                    // Left: "4",
                    // Height: "107",
                    // Width: "373",
                    // ItemHeight: "13",
                    // MultiSelect: "True",
                    // TabOrder: "3",
                },
            ),
        )
    }
}

