import * as m from "mithril"
import { caption, HelpJump } from "./common"
import { nextForm } from "./FormHolder"

// export const menuHoverColor = ".hover-bg-orange"

// export function menuTopBar(parts) {
//     return m("div.bg-light-green", parts)
// }

// export function menuButton(label, action, disabled) {
//     return m("span.dib.pa2" + menuHoverColor + (disabled ? ".disabled-button" : ""), {
//         onclick: action, 
//     }, label)
// }

// export function menuCheckbox(label, checked, action, disabled) {
//     return m("label.dib.pa2" + menuHoverColor + (disabled ? ".disabled-button" : ""), 
//         m("input[type=checkbox].mr1", {
//             checked: checked,
//             onclick: action
//         }),
//         label
//     )
// }

export function viewSelect(options: any, value: any, callback: any) {
    return m("select", { value, onchange: (event: any) => callback(event.target.value) },
        options.map((option: any) => {
            if (option.label) {
                return m("option", { 
                    value: option.value,
                    selected: (option.value === value ? "selected" : undefined),
                }, option.label)
            } else {
                return m("option", {
                    value: option,
                    selected: (option === value ? "selected" : undefined),
                }, option)
            }
        })
    )
}

// export function interceptSaveKey(onSaveHandler) {
//     return (evt) => {
//         // derived from: https://stackoverflow.com/questions/2903991/how-to-detect-ctrlv-ctrlc-using-javascript
//         const c = evt.keyCode
//         const ctrlDown = evt.ctrlKey || evt.metaKey // Mac support

//         // Check for Alt+Gr (http://en.wikipedia.org/wiki/AltGr_key)
//         if (ctrlDown && evt.altKey) return true

//         if (ctrlDown && evt.key === "Enter") {
//             onSaveHandler()
//             return false
//         }

//         // Check for ctrl+s
//         if (ctrlDown && c == 83) {
//             onSaveHandler()
//             return false
//         }

//         // Otherwise allow
//         return true
//     }
// }

// const expanded = {}
// export function expander(name, callback) {
//     return m("div.mt2.mb2",
//         m("span.mb2", {
//             onclick: () => expanded[name] = !expanded[name]
//         }, m("span.mr1", name), (expanded[name] ? "▾" : "▸" )),
//         expanded[name] && m("div.ml4.ma1", callback())
//     )
// }

export interface MenuItem {
    type: string
    id: string
    label: string | (() => string)
    action?: (menuItem: MenuItem) => void
    submenu?: MenuItem[]
    checkedFunction?: () => boolean
    enabledFunction?: () => boolean
}

let droppedDownMenuId = ""
export function resetDroppedDownMenuId() {
    droppedDownMenuId = ""
}

// recursive
export function buildMenuFromSpec(specOriginal: any[]): MenuItem[] {
    const result: MenuItem[] = []

    const spec = specOriginal.slice()

    while (spec.length) {
        let type = spec.shift()
        if (!type) break
        if (type === "-") {
            result.push({type: "dash", id: "", label: ""})
            continue
        }
        let id
        if (!["radio", "checkbox"].includes(type)) {
            id = type
            type = "menu"
        } else {
            id = spec.shift()
        }
        const label = spec.shift()
        const actionOrMenuSpec = spec.shift()
        let checkedFunction = spec.shift()
        if (typeof checkedFunction !== "function") {
            spec.unshift(checkedFunction)
            checkedFunction = undefined
        }
        let enabledFunction = spec.shift()
        if (typeof enabledFunction !== "function") {
            spec.unshift(enabledFunction)
            enabledFunction = undefined
        }
        if (typeof actionOrMenuSpec !== "function") {
            const submenu = buildMenuFromSpec(actionOrMenuSpec)
            result.push({type, id, label, submenu, checkedFunction, enabledFunction})
        } else {
            const action = actionOrMenuSpec
            result.push({type, id, label, action, checkedFunction, enabledFunction})
        }
    }
    return result
}

export function viewMainMenu(mainMenuSpec: any, self: any, viewToolbar: () => any) {
        const menu = buildMenuFromSpec(mainMenuSpec)
        
        return m("div.sticky",
            {
                style: { zIndex: 100 }
            },
            m("div.bg-light-gray",
                m("span.green", {onclick: () => window.open("https://www.kurtz-fernhout.com/summary_plantstudio.html", "_blank") }, "PlantStudio"),
                m("span.ml1.i.br.pr1.bw2", { onclick: () => nextForm() }, self.windowName),
                menu.map(menuItem => 
                    m("span.relative", {
                            tabindex: "0",
                            onkeydown: (event: any) => {
                                if (event.key === "Escape") {
                                    droppedDownMenuId = ""
                                    event.stopPropagation()
                                } else if (event.key === "Enter") {
                                    droppedDownMenuId === menuItem.id
                                        ? droppedDownMenuId == ""
                                        : droppedDownMenuId = menuItem.id
                                    event.stopPropagation()
                                } else if (event.key === "ArrowDown" && droppedDownMenuId !== menuItem.id) {
                                    droppedDownMenuId = menuItem.id
                                    // event.stopPropagation()
                                    // TODO MAYBE: this.sendTabKey()
                                } else if (event.key === "ArrowDown" && droppedDownMenuId === menuItem.id) {
                                    // event.stopPropagation()
                                    // TODO MAYBE: this.sendTabKey()
                                // } else if (event.key === "ArrowRight") {
                                //     droppedDownMenuId = menuItem.id
                                //     event.stopPropagation()
                                }
                            }
                        }, 
                        m("span.hover-bg-green.b.ml2" + (droppedDownMenuId === menuItem.id ? ".ba" : ""), {
                            onclick: (event: any) => {
                                droppedDownMenuId === menuItem.id 
                                    ? droppedDownMenuId = ""
                                    : droppedDownMenuId = menuItem.id
                                event.stopPropagation()
                            }
                        }, caption(menuItem.label)),
                        menuItem.submenu ? null : "MISSING SUBMENU for: " + menuItem.label,
                        droppedDownMenuId === menuItem.id && m("div.absolute.ba.bg-light-gray.pb1", { id: "droppedDownMenu", style: { left: 0 } }, viewMenu(menuItem.submenu || [], self))
                    )
                ),
            ),
            viewToolbar && viewToolbar(),
        )
    }

function viewMenuItem(menuItem: MenuItem, self: any) {
    const disabled = menuItem.enabledFunction ? !menuItem.enabledFunction() : false
    switch(menuItem.type) {
        case "dash":
            return m("div.bt.mt1.mb1")
        case "menu":
            return m("div.nowrap.pl1.pr1" + (disabled ? ".gray.disabled" : ".hover-bg-green"),
                m("span.menuItem", {
                    tabindex: disabled ? undefined: "0",
                    onclick: () => menuItem.action?.call(self, menuItem),
                    onkeydown: (event: any) => {
                        if (event.key === "Enter") {
                            event.stopPropagation()
                            menuItem.action?.call(self, menuItem)
                        }
                    }
                }, caption(menuItem.label)))
        case "checkbox":
            return m("div.nowrap.pl1.pr1" + (disabled ? ".gray.disabled" : ".hover-bg-green"),
                m("label.menuItem",
                    { tabindex: disabled ? undefined : "0" },
                    m("input[type=checkbox].mr1", {
                        checked: menuItem.checkedFunction!(),
                        disabled,
                        onchange: () => menuItem.action?.call(self, menuItem),
                    }),
                    caption(menuItem.label)
                )
            )
        case "radio":
            return m("div.nowrap.pl1.pr1" + (disabled ? ".gray.disabled" : ".hover-bg-green"),
                m("label.menuItem",
                    { tabindex: disabled ? undefined : "0" },
                    m("input[type=radio].mr1", {
                        checked: menuItem.checkedFunction!(),
                        disabled,
                        onclick: () => menuItem.action?.call(self, menuItem)
                    }),
                    caption(menuItem.label)
                )
            )
        default:
            return m("div", "Unsupported MenuItem.type: " + menuItem.type)
    }
}

//  recursive
function viewMenu(menu: MenuItem[], self: any): any {
    return m("div", 
        menu.map(menuItem => {
            const disabled = menuItem.enabledFunction ? !menuItem.enabledFunction() : false
            return m("div",
                menuItem.submenu
                    ? m("div.nowrap.mt1.mb1", 
                        m("span.i.ml1"  + (disabled ? ".gray.disabled" : ""), 
                        caption(menuItem.label) + ":"), 
                        m("div.ml2", viewMenu(menuItem.submenu, self))
                    )
                    : viewMenuItem(menuItem, self)
                )
            }
    ))
}
