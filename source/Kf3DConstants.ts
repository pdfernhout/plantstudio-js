import { ColorDefs } from "./common"

// Shared turtle/TDO constants live in their own module to avoid the runtime
// KfTurtle <-> KfObject3D import cycle produced by the Delphi translation.
export const kMaximumRecordedPoints = 10000
export const kTdoForeColor = ColorDefs.clSilver
export const kTdoBackColor = ColorDefs.clGray
export const kTdoLineContrastIndex = 10
