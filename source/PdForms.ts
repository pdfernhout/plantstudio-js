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
