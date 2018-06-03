// unit Ucommand

from conversion_common import *
import updcom
import umain
import usupport
import ucollect
import delphi_compatability

export enum TrackPhase { trackPress, trackMove, trackRelease }

// const
const kMaxDescriptionLength = 40


function limitDescription(description: string): string {
    let result = ""
    result = description
    if (len(description) > kMaxDescriptionLength) {
        result = UNRESOLVED.copy(description, 1, kMaxDescriptionLength - 4) + " ..."
    }
    return result
}

// const
const kMinMoveDistance = 2



export class PdCommand {
    canUndo: boolean = false
    done: boolean = false
    commandChangesPlantFile: boolean = false
    plantFileChangedBeforeCommand: boolean = false
    
    create(): void {
        TObject.prototype.create.call(this)
        this.canUndo = true
        this.done = false
        // default commandChangesPlantFile to true, since most commands change file,
        //    if command does not change file, set to false after call to inherited create 
        this.commandChangesPlantFile = true
        this.plantFileChangedBeforeCommand = false
    }
    
    destroy(): void {
        //sublass could override
        TObject.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        this.done = true
        if (this.commandChangesPlantFile) {
            this.plantFileChangedBeforeCommand = umain.plantFileChanged
            if (umain.MainForm !== null) {
                umain.MainForm.setPlantFileChanged(true)
            }
        }
        //subclass should override and call inherited
    }
    
    undoCommand(): void {
        this.done = false
        if (this.commandChangesPlantFile) {
            if (umain.MainForm !== null) {
                umain.MainForm.setPlantFileChanged(this.plantFileChangedBeforeCommand)
            }
        }
        //sublass should override and call inherited
    }
    
    redoCommand(): void {
        this.doCommand()
        //sublass may override and call inherited doCommand
    }
    
    description(): string {
        let result = ""
        result = "*command description*"
        return result
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        //subclasses may override but only if they keep copies of large objects
        return result
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand {
        let result = new PdCommand()
        //sublasses should override if needed
        result = this
        return result
    }
    
}

export class PdCommandList {
    commands: TListCollection = new TListCollection()
    lastDoneCommandIndex: long = 0
    undoLimit: long = 0
    objectUndoLimit: long = 0
    mouseCommand: PdCommand = new PdCommand()
    anchorPoint: TPoint = new TPoint()
    previousPoint: TPoint = new TPoint()
    rightButtonDown: boolean = false
    
    //PdCommandList
    create(): void {
        TObject.prototype.create.call(this)
        this.commands = ucollect.TListCollection().Create()
        this.lastDoneCommandIndex = -1
        this.undoLimit = 50
        this.objectUndoLimit = 10
    }
    
    destroy(): void {
        this.commands.free
        this.commands = null
        //if mouseCoOmmand <> nil then error condition - ignoring for now - not released
        //could only happend if quitting somehow in middle of action
        TObject.prototype.destroy.call(this)
    }
    
    command(index: long): PdCommand {
        let result = new PdCommand()
        result = PdCommand(this.commands.Items[index])
        return result
    }
    
    setNewUndoLimit(newLimit: long): void {
        if (newLimit !== this.undoLimit) {
            this.undoLimit = newLimit
            this.freeCommandsAboveLimit(this.undoLimit)
        }
    }
    
    setNewObjectUndoLimit(newObjectLimit: long): void {
        if (newObjectLimit !== this.objectUndoLimit) {
            this.objectUndoLimit = newObjectLimit
            this.freeCommandsAboveObjectLimit(this.objectUndoLimit)
        }
    }
    
    //free any command more than the number passed in
    freeCommandsAboveLimit(theLimit: long): void {
        let theCommand: PdCommand
        
        while ((this.commands.Count > theLimit) && (this.commands.Count > 0)) {
            theCommand = this.command(0)
            this.commands.Delete(0)
            theCommand.free
            this.lastDoneCommandIndex -= 1
            if (this.lastDoneCommandIndex < -1) {
                this.lastDoneCommandIndex = -1
            }
        }
    }
    
    freeCommandsAboveObjectLimit(objectLimit: long): void {
        let theCommand: PdCommand
        let objectCount: long
        
        objectCount = this.objectCountInCommandList()
        while ((objectCount > objectLimit) && (this.commands.Count > 0)) {
            theCommand = this.command(0)
            this.commands.Delete(0)
            theCommand.free
            this.lastDoneCommandIndex -= 1
            if (this.lastDoneCommandIndex < -1) {
                this.lastDoneCommandIndex = -1
            }
            objectCount = this.objectCountInCommandList()
        }
    }
    
    objectCountInCommandList(): long {
        let result = 0
        let i: long
        
        result = 0
        if (this.commands.Count <= 0) {
            return result
        }
        for (i = 0; i <= this.commands.Count - 1; i++) {
            result = result + this.command(i).numberOfStoredLargeObjects()
        }
        return result
    }
    
    doCommand(newCommand: PdCommand): void {
        let i: long
        let theCommand: PdCommand
        
        if (this.isRedoEnabled()) {
            for (i = this.commands.Count - 1; i >= this.lastDoneCommandIndex + 1; i--) {
                //remove any extra commands after the current
                //do this first to free memory for command
                theCommand = this.command(i)
                this.commands.Delete(i)
                theCommand.free
            }
        }
        // first see if there are too many objects and if so, scroll them 
        this.freeCommandsAboveObjectLimit(this.objectUndoLimit - 1)
        //see if too many commands are stored and if so, scroll them
        this.freeCommandsAboveLimit(this.undoLimit - 1)
        //now do this command
        //may fail in which case won't add
        newCommand.doCommand()
        this.commands.Add(newCommand)
        this.lastDoneCommandIndex += 1
    }
    
    //added nextMouseCommand in these three functions to deal with unhandled exceptions occurring
    //during mouse commands.  This way, the command will not be further processed.
    //This may occasionally leak - the mouse command should be the one responsible for freeing
    //itself and returning nil if a problem occurs
    //returns whether the command finished tracking without freeing itself
    mouseDown(newCommand: PdCommand, point: Tpoint): boolean {
        let result = false
        let nextMouseCommand: PdCommand
        
        result = false
        if (this.mouseCommand !== null) {
            //check if need to clear mouse command
            this.mouseUp(point)
        }
        this.mouseCommand = null
        if (newCommand !== null) {
            //save mouse command and start it
            this.anchorPoint = point
            this.previousPoint = point
            nextMouseCommand = newCommand
            this.mouseCommand = nextMouseCommand.TrackMouse(TrackPhase.trackPress, this.anchorPoint, this.previousPoint, point, false, this.rightButtonDown)
            result = (this.mouseCommand !== null)
        }
        return result
    }
    
    mouseMove(point: TPoint): void {
        let nextMouseCommand: PdCommand
        
        nextMouseCommand = this.mouseCommand
        this.mouseCommand = null
        if (nextMouseCommand !== null) {
            this.mouseCommand = nextMouseCommand.TrackMouse(TrackPhase.trackMove, this.anchorPoint, this.previousPoint, point, this.didMouseMove(point), this.rightButtonDown)
        }
        this.previousPoint = point
    }
    
    mouseUp(point: TPoint): void {
        let nextMouseCommand: PdCommand
        
        nextMouseCommand = this.mouseCommand
        this.mouseCommand = null
        if (nextMouseCommand !== null) {
            nextMouseCommand = nextMouseCommand.TrackMouse(TrackPhase.trackRelease, this.anchorPoint, this.previousPoint, point, this.didMouseMove(point), this.rightButtonDown)
            if (nextMouseCommand !== null) {
                this.doCommand(nextMouseCommand)
            }
        }
    }
    
    didMouseMove(point: TPoint): boolean {
        let result = false
        result = (abs(point.x - this.anchorPoint.X) > kMinMoveDistance) || (abs(point.y - this.anchorPoint.Y) > kMinMoveDistance)
        return result
    }
    
    isUndoEnabled(): boolean {
        let result = false
        result = this.lastDoneCommandIndex >= 0
        return result
    }
    
    isRedoEnabled(): boolean {
        let result = false
        result = this.lastDoneCommandIndex < (this.commands.Count - 1)
        return result
    }
    
    undoDescription(): string {
        let result = ""
        if (this.lastDoneCommandIndex >= 0) {
            result = this.command(this.lastDoneCommandIndex).description()
            result = limitDescription(result)
        } else {
            result = ""
        }
        return result
    }
    
    redoDescription(): string {
        let result = ""
        if (this.lastDoneCommandIndex < (this.commands.Count - 1)) {
            result = this.command(this.lastDoneCommandIndex + 1).description()
            result = limitDescription(result)
        } else {
            result = ""
        }
        return result
    }
    
    undoLast(): void {
        if (this.lastDoneCommandIndex >= 0) {
            this.command(this.lastDoneCommandIndex).undoCommand()
            this.lastDoneCommandIndex -= 1
        }
    }
    
    redoLast(): void {
        if (this.lastDoneCommandIndex < (this.commands.Count - 1)) {
            this.command(this.lastDoneCommandIndex + 1).redoCommand()
            this.lastDoneCommandIndex += 1
        }
    }
    
    fillListWithUndoableStrings(aList: TStringList): void {
        let i: int
        
        if (aList === null) {
            return
        }
        if (this.lastDoneCommandIndex >= 0) {
            for (i = this.lastDoneCommandIndex; i >= 0; i--) {
                aList.Add(usupport.capitalize(this.command(i).description()))
            }
        }
    }
    
    fillListWithRedoableStrings(aList: TStringList): void {
        let i: int
        
        if (aList === null) {
            return
        }
        if (this.lastDoneCommandIndex < (this.commands.Count - 1)) {
            for (i = this.lastDoneCommandIndex + 1; i <= this.commands.Count - 1; i++) {
                aList.Add(usupport.capitalize(this.command(i).description()))
            }
        }
    }
    
    lastCommandDone(): PdCommand {
        let result = new PdCommand()
        result = null
        if (this.lastDoneCommandIndex < (this.commands.Count - 1)) {
            result = this.command(this.lastDoneCommandIndex + 1)
        }
        return result
    }
    
    removeCommand(aCommand: PdCommand): void {
        if (aCommand.done) {
            // assume this command has been undone previously 
            throw new GeneralException.create("Problem: Command not undone; in PdCommandList.removeCommand.")
        }
        this.commands.Remove(aCommand)
    }
    
}

