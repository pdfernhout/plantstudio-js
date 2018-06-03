// PdCommandList was unit Ucommand

import { long, arrayRemove } from "./common"
import { TPoint } from "./TPoint"
import { capitalize } from "./usupport"
import { PdCommand, TrackPhase } from "./PdCommand"

// const
const kMaxDescriptionLength = 40

function limitDescription(description: string): string {
    let result = description
    if (description.length > kMaxDescriptionLength) {
        result = description.substring(0, kMaxDescriptionLength - 4) + " ..."
    }
    return result
}

// const
const kMinMoveDistance = 2

export class PdCommandList {
    commands: PdCommand[] = []
    lastDoneCommandIndex: long = -1
    undoLimit: long = 50
    objectUndoLimit: long = 10
    mouseCommand: PdCommand | null = null
    anchorPoint: TPoint = new TPoint()
    previousPoint: TPoint = new TPoint()
    rightButtonDown: boolean = false
    
    command(index: long): PdCommand {
        return this.commands[index]
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
    
    // free any command more than the number passed in
    freeCommandsAboveLimit(theLimit: long): void {
        let theCommand: PdCommand
        
        while ((this.commands.length > theLimit) && (this.commands.length > 0)) {
            theCommand = this.command(0)
            this.commands.splice(0, 1)
            this.lastDoneCommandIndex -= 1
            if (this.lastDoneCommandIndex < -1) {
                this.lastDoneCommandIndex = -1
            }
        }
    }
    
    freeCommandsAboveObjectLimit(objectLimit: long): void {
        let objectCount = this.objectCountInCommandList()
        while ((objectCount > objectLimit) && (this.commands.length > 0)) {
            const theCommand = this.command(0)
            this.commands.splice(0, 1)
            this.lastDoneCommandIndex -= 1
            if (this.lastDoneCommandIndex < -1) {
                this.lastDoneCommandIndex = -1
            }
            objectCount = this.objectCountInCommandList()
        }
    }
    
    objectCountInCommandList(): long {
        let result = 0
        if (this.commands.length <= 0) {
            return result
        }
        for (let i = 0; i <= this.commands.length - 1; i++) {
            result = result + this.command(i).numberOfStoredLargeObjects()
        }
        return result
    }
    
    doCommand(newCommand: PdCommand): void {
        if (this.isRedoEnabled()) {
            for (let i = this.commands.length - 1; i >= this.lastDoneCommandIndex + 1; i--) {
                // remove any extra commands after the current
                // do this first to free memory for command
                const theCommand = this.command(i)
                this.commands.splice(i, 1)
            }
        }
        // first see if there are too many objects and if so, scroll them 
        this.freeCommandsAboveObjectLimit(this.objectUndoLimit - 1)
        // see if too many commands are stored and if so, scroll them
        this.freeCommandsAboveLimit(this.undoLimit - 1)
        // now do this command
        // may fail in which case won't add
        newCommand.doCommand()
        this.commands.push(newCommand)
        this.lastDoneCommandIndex += 1
    }
    
    // added nextMouseCommand in these three functions to deal with unhandled exceptions occurring
    // during mouse commands.  This way, the command will not be further processed.
    // This may occasionally leak - the mouse command should be the one responsible for freeing
    // itself and returning nil if a problem occurs
    // returns whether the command finished tracking without freeing itself
    mouseDown(newCommand: PdCommand, point: TPoint): boolean {
        let result = false
        let nextMouseCommand: PdCommand
        
        result = false
        if (this.mouseCommand !== null) {
            // check if need to clear mouse command
            this.mouseUp(point)
        }
        this.mouseCommand = null
        if (newCommand !== null) {
            // save mouse command and start it
            this.anchorPoint = point
            this.previousPoint = point
            nextMouseCommand = newCommand
            this.mouseCommand = nextMouseCommand.TrackMouse(TrackPhase.trackPress, this.anchorPoint, this.previousPoint, point, false, this.rightButtonDown)
            result = (this.mouseCommand !== null)
        }
        return result
    }
    
    mouseMove(point: TPoint): void {
        const nextMouseCommand = this.mouseCommand
        this.mouseCommand = null
        if (nextMouseCommand !== null) {
            this.mouseCommand = nextMouseCommand.TrackMouse(TrackPhase.trackMove, this.anchorPoint, this.previousPoint, point, this.didMouseMove(point), this.rightButtonDown)
        }
        this.previousPoint = point
    }
    
    mouseUp(point: TPoint): void {
        let nextMouseCommand = this.mouseCommand
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
        result = (Math.abs(point.X - this.anchorPoint.X) > kMinMoveDistance) || (Math.abs(point.Y - this.anchorPoint.Y) > kMinMoveDistance)
        return result
    }
    
    isUndoEnabled(): boolean {
        let result = false
        result = this.lastDoneCommandIndex >= 0
        return result
    }
    
    isRedoEnabled(): boolean {
        let result = false
        result = this.lastDoneCommandIndex < (this.commands.length - 1)
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
        if (this.lastDoneCommandIndex < (this.commands.length - 1)) {
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
        if (this.lastDoneCommandIndex < (this.commands.length - 1)) {
            this.command(this.lastDoneCommandIndex + 1).redoCommand()
            this.lastDoneCommandIndex += 1
        }
    }
    
    fillListWithUndoableStrings(aList: string[]): void {
        if (aList === null) {
            return
        }
        if (this.lastDoneCommandIndex >= 0) {
            for (let i = this.lastDoneCommandIndex; i >= 0; i--) {
                aList.push(capitalize(this.command(i).description()))
            }
        }
    }
    
    fillListWithRedoableStrings(aList: string[]): void {
        if (aList === null) {
            return
        }
        if (this.lastDoneCommandIndex < (this.commands.length - 1)) {
            for (let i = this.lastDoneCommandIndex + 1; i < this.commands.length; i++) {
                aList.push(capitalize(this.command(i).description()))
            }
        }
    }
    
    lastCommandDone(): PdCommand | null {
        if (this.lastDoneCommandIndex < (this.commands.length - 1)) {
            return this.command(this.lastDoneCommandIndex + 1)
        }
        return null
    }
    
    removeCommand(aCommand: PdCommand): void {
        if (aCommand.done) {
            // assume this command has been undone previously 
            throw new Error("Problem: Command not undone; in PdCommandList.removeCommand.")
        }
        arrayRemove(this.commands, aCommand)
    }
    
}

