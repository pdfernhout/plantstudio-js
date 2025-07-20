import * as m from "mithril"

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
