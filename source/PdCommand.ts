// PdCommand was in unit Ucommand

import { MainForm } from "./temporary"
import { TPoint } from "./TPoint"
import { long } from "./common"

export enum TrackPhase { trackPress, trackMove, trackRelease }

export class PdCommand {
    canUndo: boolean = false
    done: boolean = false
    // default commandChangesPlantFile to true, since most commands change file,
    //    if command does not change file, set to false after call to inherited create 
    commandChangesPlantFile: boolean = true
    plantFileChangedBeforeCommand: boolean = false
    
    doCommand(): void {
        this.done = true
        if (this.commandChangesPlantFile) {
            this.plantFileChangedBeforeCommand = MainForm.plantFileChanged
            if (MainForm !== null) {
                MainForm.setPlantFileChanged(true)
            }
        }
        // subclass should override and call inherited
    }
    
    undoCommand(): void {
        this.done = false
        if (this.commandChangesPlantFile) {
            if (MainForm !== null) {
                MainForm.setPlantFileChanged(this.plantFileChangedBeforeCommand)
            }
        }
        // subclass should override and call inherited
    }
    
    redoCommand(): void {
        this.doCommand()
        // subclass may override and call inherited doCommand
    }
    
    description(): string {
        return "*command description*"
    }
    
    numberOfStoredLargeObjects(): long {
        // subclasses may override but only if they keep copies of large objects
        return 0
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand | null {
        // sublasses should override if needed
        return this
    }
    
}
