import { TMainForm } from "./TMainForm"
import { TBreederForm } from "./TBreederForm"
import { TTimeSeriesForm } from "./TTimeSeriesForm"

export let MainForm: TMainForm
export let BreederForm: TBreederForm
export let TimeSeriesForm: TTimeSeriesForm

export function setMainForm(form: TMainForm) {
    MainForm = form
}

export function setBreederForm(form: TBreederForm) {
    BreederForm = form
}

export function setTimeSeriesForm(form: TTimeSeriesForm) {
    TimeSeriesForm = form
}

type Form = "MainForm" | "BreederForm" | "TimeSeriesForm"
const forms: Form[] = ["MainForm", "BreederForm", "TimeSeriesForm"]

export let activeForm: Form

export function setActiveForm(form: Form) {
    activeForm = form
}

export function nextForm() {
    let nextFormIndex = forms.indexOf(activeForm) + 1
    if (nextFormIndex >= forms.length) {
        nextFormIndex = 0
    }
    setActiveForm(forms[nextFormIndex])
}
