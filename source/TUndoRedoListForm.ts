// unit Uundo

import * as m from "mithril"
import { caption, HelpJump, imageDir, int } from "./common"
import { PdCommandList } from "./PdCommandList"

type CommandWrapper = {
    name: string
    selected: boolean
}

function hasSelection(aListBox: CommandWrapper[]) {
    return aListBox.filter(wrapper => wrapper.selected).length > 0
}

export class TUndoRedoListForm {
    undoList: CommandWrapper[] = []
    redoList: CommandWrapper[] = []
    okCaption = "Un&do/Redo"
    lastUndoSelection = -1
    lastRedoSelection = -1

    close: ((form: TUndoRedoListForm | null) => void) | null = null
    
    isOkEnabled() {
        return hasSelection(this.undoList) || hasSelection(this.redoList)
    }

    initializeWithCommandList(commandList: PdCommandList): void {
        const undoListNames: string[] = []
        commandList.fillListWithUndoableStrings(undoListNames)
        this.undoList = []
        for (const name of undoListNames) {
            this.undoList.push({name, selected: false})
        }

        const redoListNames: string[] = []
        commandList.fillListWithRedoableStrings(redoListNames)
        this.redoList = []
        for (const name of redoListNames) {
            this.redoList.push({name, selected: false})
        }
    }
    
    undoToIndex(): int {
        let result = -1
        if (this.undoList.length > 0) {
            for (let i = this.undoList.length - 1; i >= 0; i--) {
                if (this.undoList[i].selected) {
                    result = i
                    return result
                }
            }
        }
        return result
    }
    
    redoToIndex(): int {
        let result = -1
        if (this.redoList.length > 0) {
            for (let i = this.redoList.length - 1; i >= 0; i--) {
                if (this.redoList[i].selected) {
                    result = i
                    return result
                }
            }
        }
        return result
    }
    
    regulateListSelections(thisListBox: CommandWrapper[]): void {
        let otherListBox: CommandWrapper[]
        let itemIndex = -1
        if (thisListBox === this.undoList) {
            otherListBox = this.redoList
            itemIndex = this.lastUndoSelection
            this.lastRedoSelection = -1
        } else {
            otherListBox = this.undoList
            itemIndex = this.lastRedoSelection
            this.lastUndoSelection = -1
        }
        if (thisListBox === this.undoList) {
            this.okCaption = "Un&do"
        } else {
            this.okCaption = "Re&do"
        }
        if (!thisListBox[itemIndex].selected) { itemIndex-- }
        if (itemIndex >= 0) {
            for (let i = 0; i <= itemIndex; i++) {
                thisListBox[i].selected = true
            }
        }
        if (itemIndex + 1 <= thisListBox.length - 1) {
            for (let i = itemIndex + 1; i <= thisListBox.length - 1; i++) {
                thisListBox[i].selected = false
            }
        }
        if (otherListBox.length > 0) {
            for (let i = 0; i <= otherListBox.length - 1; i++) {
                otherListBox[i].selected = false
            }
        }
    }
    
    okClick(): void {
        this.close!(this)
    }
    
    cancelClick(): void {
        this.close!(null)
    }
    
    helpButtonClick(): void {
        HelpJump("Using_the_undo/redo_list")
    }

    view() {
        return m("UndoRedoListForm.TUndoRedoListForm",
            m("div.b.f4.mb2", "Undo/Redo List"),
            m("div.Group.Group.g00000004.flex.flex-row",
                m("div.w-50",
                    m("div.undoListLabel.TLabel",
                        caption("Things you can &Undo"),
                    ),
                    m("div.undoList.ba.pa1.TListBox.h5.overflow-auto",
                        this.undoList.map((commandWrapper, index) => m("div",
                            m("label",
                                m("input[type=checkbox]", {
                                    checked: commandWrapper.selected,
                                    onchange: (event: any) => {
                                        commandWrapper.selected = event.target.checked
                                        this.lastUndoSelection = index
                                        this.regulateListSelections(this.undoList)
                                    }
                                }),
                                m("span.ml1", commandWrapper.name),
                            )
                        ))
                    ),
                ),
                m("div.w-50",
                    m("div.redoListLabel.TLabel",
                        caption("Things you can &Redo"),
                    ),
                    m("div.redoList.ba.pa1.TListBox.h5.overflow-auto",
                        this.redoList.map((commandWrapper, index) => m("div",
                            m("label",
                                m("input[type=checkbox]", {
                                    checked: commandWrapper.selected,
                                    onchange: (event: any) => {
                                        commandWrapper.selected = event.target.checked
                                        this.lastRedoSelection = index
                                        this.regulateListSelections(this.redoList)
                                    }
                                }),
                                m("span.ml1", commandWrapper.name),
                            )
                        ))
                    ),
                ),
            ),
            m("div.flex.items-center.mt2.absolute",
                { style: { bottom: "0.5rem" }},
                m("button.OK.TButton",
                    {
                        onclick: () => this.okClick(),
                        disabled: !this.isOkEnabled()
                    },
                    caption(this.okCaption),
                ),
                m("button.cancel.TButton.ml2",
                    {
                        onclick: () => this.cancelClick(),
                    },
                    caption("&Cancel"),
                ),
                m("button.helpButton.TSpeedButton.ml2",
                    {
                        onclick: () => this.helpButtonClick(),
                    },
                    m("img.TImage.mr1", { src: imageDir + "UndoRedoListForm_helpButton.png" } ),
                    caption("&Help"),
                ),
            ),
        )
    }

    oninit(vnode: any) {
        this.close = vnode.attrs.close
        const commandList: PdCommandList = vnode.attrs.commandList
        this.initializeWithCommandList(commandList)
    }
}

