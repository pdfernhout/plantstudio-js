import type { TMainForm } from "./TMainForm"
import type { TBreederForm } from "./TBreederForm"
import type { TTimeSeriesForm } from "./TTimeSeriesForm"
import type { TDebugForm } from "./TDebugForm"
import type { TWizardFormDisplayingPlant } from "./TWizardForm"

export let MainForm: TMainForm
export let BreederForm: TBreederForm
export let TimeSeriesForm: TTimeSeriesForm
export let DebugForm: TDebugForm
export let WizardForm: TWizardFormDisplayingPlant

export function setMainForm(form: TMainForm) {
    MainForm = form
}

export function setBreederForm(form: TBreederForm) {
    BreederForm = form
}

export function setTimeSeriesForm(form: TTimeSeriesForm) {
    TimeSeriesForm = form
}

export function setDebugForm(form: TDebugForm) {
    DebugForm = form
}

export function setWizardForm(form: TWizardFormDisplayingPlant) {
    WizardForm = form
}

type Form = "MainForm" | "BreederForm" | "TimeSeriesForm" | "DebugForm" | "WizardForm"
const forms: Form[] = ["MainForm", "BreederForm", "TimeSeriesForm" /*, "DebugForm", "WizardForm" */]

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
