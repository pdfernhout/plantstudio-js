// unit Uplantmn

import { AssignFile, CloseFile, eof, float, int, intround, IntToStr, long, readln, Reset, Rewrite, short, ShowMessage, StrToFloat, StrToInt, StrToIntDef, TextFile, writeln } from "./common"
import { KfTurtle } from "./KfTurtle"
import { domain, ViewPlants } from "./PdDomain"
import { kCheckForUnreadParams, kPlantAsTextEndString, PdPlant } from "./PdPlant"
import { TPoint } from "./TPoint"
import { TRect } from "./TRect"
import { kPasteMoveDistance } from "./updcom"
import { SinglePoint, SaveFileNamesStructure, rWidth, rHeight, stringBetween, setDecimalSeparator, strToBool, stringBeyond, stringUpTo, singlePointToString, digitValueString, boolToStr, FileType, setSinglePoint, pos, stringToSinglePoint, kDontAskForFileName, tolerantReadln } from "./usupport"
import { KfObject3D, kInTdoLibrary, kStartTdoString } from "./KfObject3D"
import { ucursor } from "./temporary"

export function checkVersionNumberInPlantNameLine(aLine: string): void {
    let versionNumberString: string
    let plantName: string
    let versionNumber: int
    
    // assumes line given is plant start line
    // e.g., >>> [rose] start PlantStudio plant <v1.0>
    plantName = stringBetween("[", "]", aLine)
    versionNumberString = stringBetween("<", ">", aLine)
    versionNumberString = stringBetween("v", ".", versionNumberString)
    versionNumber = StrToIntDef(versionNumberString, 0)
    if (versionNumber > 2) {
        ShowMessage("The plant \"" + plantName + 
            "\" has a major version number of " + IntToStr(versionNumber) + ",\n" + 
            "which is higher than this major version of PlantStudio (2).\n\n" + 
            "That means that although I may be able to read the plant,\n" + 
            "it will probably look better in the most up-to-date version of PlantStudio,\n" + 
            "which you can get at the PlantStudio web site.")
    }
}


export class PdPlantManager {
    plants: PdPlant[] = []
    privatePlantClipboard: PdPlant[] = []
    plantDrawOffset_mm: SinglePoint = new SinglePoint()
    plantDrawScale_PixelsPerMm: float = 1.0
    fitInVisibleAreaForConcentrationChange: boolean = false
    mainWindowOrientation: short = 0
    showBoundsRectangle: boolean = false
    mainWindowViewMode: short = 0
    
    addPlant(newPlant: PdPlant): void {
        this.plants.push(newPlant)
    }
    
    removePlant(aPlant: PdPlant): boolean {
        const indexOfPlant = this.plants.indexOf(aPlant)
        if (indexOfPlant >= 0) {
            this.plants.splice(indexOfPlant, 1)
            return true
        }
        return false
    }
    
    copyFromPlant(plant: PdPlant): PdPlant { 
        if (plant === null) {
            throw new Error("Problem: Nil plant in method PdPlantManager.copyFromPlant.")
        }
        const newPlant = new PdPlant()
        plant.copyTo(newPlant)
        this.plants.push(newPlant)
        return newPlant
    }
    
    plantForIndex(index: long): PdPlant {
        const result = this.plants[index]
        return result
    }
    
    findPlantAtPoint(aPoint: TPoint): PdPlant | null {
        let result: PdPlant | null = null
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                if (plant.hidden) {
                    continue
                }
                if (plant.includesPoint(aPoint)) {
                    result = plant
                    return result
                }
            }
        }
        return result
    }
    
    findFirstPlantWithBoundsRectAtPoint(aPoint: TPoint): PdPlant | null {
        if (this.plants.length > 0) {
            for (let plantIndex = this.plants.length - 1; plantIndex >= 0; plantIndex--) {
                // go through list backwards because list order is drawing order is from front to back
                const plant = this.plants[plantIndex]
                if (plant.hidden) {
                    continue
                }
                if (plant.pointInBoundsRect(aPoint)) {
                    return plant
                }
            }
        }
        return null
    }
    
    // loadPlantObjectsIntoTStrings(stringList: TStrings): void {
    //     if (this.plants.length > 0) {
    //         for (let i = 0; i <= this.plants.length - 1; i++) {
    //             const plant = this.plants[i]
    //             stringList.AddObject(plant.getName(), plant)
    //         }
    //     }
    // }
    
    // --------------------------------------------------------------------------------------- input/output 
    loadPlantsFromFile(fileName: string, inPlantMover: boolean, fileContents: string): void {
        let inputFile: TextFile = new  TextFile()
        let aLine: string
        
        AssignFile(inputFile, fileName, fileContents)
        try {
            // v1.5
            setDecimalSeparator()
            Reset(inputFile)
            this.plants = []
            // defaults in case things are missing from file
            this.plantDrawOffset_mm = setSinglePoint(0, 0)
            this.plantDrawScale_PixelsPerMm = 1.0
            this.mainWindowViewMode = domain.options.mainWindowViewMode
            this.mainWindowOrientation = domain.options.mainWindowOrientation
            this.showBoundsRectangle = domain.options.showBoundsRectangle
            this.fitInVisibleAreaForConcentrationChange = false
            while (!eof(inputFile)) {
                // cfk testing
                aLine = tolerantReadln(inputFile)
                if ((aLine === "") || (pos(";", aLine) === 1)) {
                    continue
                }
                if (pos("offset=", aLine) === 1) {
                    this.plantDrawOffset_mm = stringToSinglePoint(stringBeyond(aLine, "="))
                } else if (pos("scale=", aLine) === 1) {
                    try {
                        this.plantDrawScale_PixelsPerMm = intround(StrToFloat(stringBeyond(aLine, "=")) * 100.0) / 100.0
                    } catch (e) {
                        this.plantDrawScale_PixelsPerMm = 1.0
                    }
                } else if (pos("concentrated=", aLine) === 1) {
                    let concentratedLastTimeSaved = domain.viewPlantsInMainWindowOnePlantAtATime()
                    let concentratedInFile: boolean
                    if (domain.options.ignoreWindowSettingsInFile) {
                        // v2.1 if ignoring settings in file, use current settings, otherwise use what is in file
                        concentratedInFile = (this.mainWindowViewMode === ViewPlants.kViewPlantsInMainWindowOneAtATime)
                    } else {
                        concentratedInFile = strToBool(stringBeyond(aLine, "="))
                    }
                    if (concentratedInFile) {
                        this.mainWindowViewMode = ViewPlants.kViewPlantsInMainWindowOneAtATime
                    } else {
                        this.mainWindowViewMode = ViewPlants.kViewPlantsInMainWindowFreeFloating
                    }
                    if (!inPlantMover) {
                        domain.options.mainWindowViewMode = this.mainWindowViewMode
                    }
                    this.fitInVisibleAreaForConcentrationChange = concentratedInFile && !concentratedLastTimeSaved
                } else if (pos("orientation (top/side)=", aLine) === 1) {
                    if (!domain.options.ignoreWindowSettingsInFile) {
                        // v2.1 only read if not ignoring settings in file
                        this.mainWindowOrientation = StrToInt(stringBeyond(aLine, "="))
                    }
                } else if (pos("boxes=", aLine) === 1) {
                    this.showBoundsRectangle = strToBool(stringBeyond(aLine, "="))
                    if (!inPlantMover) {
                        domain.options.showBoundsRectangle = this.showBoundsRectangle
                    }
                    // TODO when convert MainForm
                    // if ((umain.MainForm !== null) && (!umain.MainForm.inFormCreation) && (!inPlantMover)) {
                    //     umain.MainForm.updateForChangeToDomainOptions()
                    //     umain.MainForm.copyDrawingBitmapToPaintBox()
                    // }
                } else if (pos("[", aLine) === 1) {
                    // plant start line
                    checkVersionNumberInPlantNameLine(aLine)
                    const plant = new PdPlant()
                    let plantName = stringBeyond(aLine, "[")
                    plantName = stringUpTo(plantName, "]")
                    plant.setName(plantName)
                    domain.parameterManager.setAllReadFlagsToFalse()
                    // cfk change v1.3
                    // changed reading end of plant to read "end PlantStudio plant" instead of empty line because
                    // sometimes text wrapping puts empty lines in, not a good measure of completion.
                    // now end of plant must be there to be read. could produce endless loop if no end
                    // of plant, so stop at absolute cutoff of 300 non-empty, non-comment lines (there are now 215 parameters).
                    // also stop reading if reach next plant square bracket or end of file.
                    // v2.0 increased number of params to 350 so 300 is problem, changed to 3000 to avoid this in future, oops
                    let lineCount = 0
                    while ((pos(kPlantAsTextEndString, aLine) <= 0) && (lineCount <= 3000)) {
                        // aLine <> '' do
                        aLine = tolerantReadln(inputFile)
                        if ((pos("[", aLine) === 1) || (eof(inputFile))) {
                            // v1.60 reversed order of the next two lines -- fixes infinite loop when no end of plant
                            // v1.3 added check for next plant or eof
                            break
                        }
                        if ((aLine.trim() === "") || (pos(";", aLine) === 1)) {
                            // v1.3 added skip empty lines
                            continue
                        }
                        plant.readLineAndTdoFromPlantFile(aLine, inputFile)
                        lineCount = lineCount + 1
                    }
                    plant.finishLoadingOrDefaulting(kCheckForUnreadParams)
                    this.plants.push(plant)
                }
            }
        } finally {
            CloseFile(inputFile)
        }
    }
    
    savePlantsToFile(fileName: string, inPlantMover: boolean): void {
        let outputFile: TextFile = new TextFile()
        
        if (this.plants.length <= 0) {
            return
        }
        AssignFile(outputFile, fileName)
        try {
            // v1.5
            setDecimalSeparator()
            if (!inPlantMover) {
                // update before writing out (keep as read in if in mover)
                // plantDrawOffset_mm is used from here
                // plantDrawScale_PixelsPerMm is used from here
                this.mainWindowViewMode = domain.options.mainWindowViewMode
                this.mainWindowOrientation = domain.options.mainWindowOrientation
                this.showBoundsRectangle = domain.options.showBoundsRectangle
            }
            Rewrite(outputFile)
            // v2.0
            writeln(outputFile, "; PlantStudio version 2.0 plant file")
            writeln(outputFile, "offset=" + singlePointToString(this.plantDrawOffset_mm))
            writeln(outputFile, "scale=" + digitValueString(this.plantDrawScale_PixelsPerMm))
            if (this.mainWindowViewMode === ViewPlants.kViewPlantsInMainWindowOneAtATime) {
                writeln(outputFile, "concentrated=true")
            } else {
                writeln(outputFile, "concentrated=false")
            }
            // v2.0
            writeln(outputFile, "orientation (top/side)=" + IntToStr(this.mainWindowOrientation))
            // v2.0
            writeln(outputFile, "boxes=" + boolToStr(this.showBoundsRectangle))
            writeln(outputFile)
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                if (plant === null) {
                    continue
                }
                plant.writeToPlantFile(outputFile)
            }
        } finally {
            CloseFile(outputFile)
        }
    }

    // TODO when convert MainForm -- reconcileFileWithTdoLibrary
    // v1.11
    reconcileFileWithTdoLibrary(plantFileName: string, tdoLibrary: string): int {
        throw new Error("TOD Unfinished")
        // let plantFileTdos: KfObject3D[] = []
        // let libraryFileTdos: KfObject3D[] = []
        // let plantFile: TextFile = new TextFile()
        // let tdoFile: TextFile = new TextFile()
        // let outputTdoFile: TextFile = new TextFile()
        // let fileInfo: SaveFileNamesStructure
        
        // let result = 0
        // if (!FileExists(plantFileName)) {
        //     // check that files exist
        //     plantFileName = usupport.getFileOpenInfo(FileType.kFileTypePlant, plantFileName, "Choose a plant file")
        //     if (plantFileName === "") {
        //         return result
        //     }
        // }
        // if (!FileExists(tdoLibrary)) {
        //     tdoLibrary = usupport.getFileOpenInfo(FileType.kFileTypeTdo, tdoLibrary, "Choose a 3D object library (tdo) file")
        //     if (tdoLibrary === "") {
        //         return result
        //     }
        // }
        // try {
        //     ucursor.cursor_startWait()
        //     // read tdos from plants
        //     AssignFile(plantFile, plantFileName)
        //     try {
        //         // v1.5
        //         setDecimalSeparator()
        //         Reset(plantFile)
        //         while (!eof(plantFile)) {
        //             const aLine = readln(plantFile)
        //             if (pos(kStartTdoString, aLine) > 0) {
        //                 const tdo = new KfObject3D()
        //                 tdo.readFromFileStream(plantFile, kInTdoLibrary)
        //                 plantFileTdos.push(tdo)
        //             }
        //         }
        //     } finally {
        //         CloseFile(plantFile)
        //     }
        //     // read tdos from library
        //     AssignFile(tdoFile, tdoLibrary)
        //     try {
        //         // v1.5
        //         setDecimalSeparator()
        //         Reset(tdoFile)
        //         while (!eof(tdoFile)) {
        //             const tdo = new KfObject3D()
        //             tdo.readFromFileStream(tdoFile, kInTdoLibrary)
        //             libraryFileTdos.push(tdo)
        //         }
        //     } finally {
        //         CloseFile(tdoFile)
        //     }
        //     if (plantFileTdos.length > 0) {
        //         for (let i = 0; i <= plantFileTdos.length - 1; i++) {
        //             // add plant tdos not in library list to library list
        //             const plantFileTdo = plantFileTdos[i]
        //             let matchInLibrary = false
        //             if (libraryFileTdos.length > 0) {
        //                 for (let j = 0; j <= libraryFileTdos.length - 1; j++) {
        //                     const libraryTdo = libraryFileTdos[j]
        //                     if (plantFileTdo.isSameAs(libraryTdo)) {
        //                         matchInLibrary = true
        //                         break
        //                     }
        //                 }
        //             }
        //             if (!matchInLibrary) {
        //                 const tdo = new KfObject3D()
        //                 tdo.copyFrom(plantFileTdo)
        //                 libraryFileTdos.push(tdo)
        //                 result += 1
        //             }
        //         }
        //     }
        //     if (result > 0) {
        //         if (usupport.getFileSaveInfo(FileType.kFileTypeTdo, kDontAskForFileName, tdoLibrary, fileInfo)) {
        //             // if any tdos in plant file but not in library, rewrite library
        //             AssignFile(outputTdoFile, fileInfo.tempFile)
        //             try {
        //                 // v1.5
        //                 setDecimalSeparator()
        //                 Rewrite(outputTdoFile)
        //                 usupport.startFileSave(fileInfo)
        //                 if (libraryFileTdos.length > 0) {
        //                     for (let i = 0; i <= libraryFileTdos.length - 1; i++) {
        //                         const tdo = libraryFileTdos[i]
        //                         if (tdo === null) {
        //                             continue
        //                         }
        //                         tdo.writeToFileStream(outputTdoFile, kInTdoLibrary)
        //                     }
        //                 }
        //                 fileInfo.writingWasSuccessful = true
        //             } finally {
        //                 CloseFile(outputTdoFile)
        //                 usupport.cleanUpAfterFileSave(fileInfo)
        //             }
        //         }
        //     }
        // } finally {
        //     ucursor.cursor_stopWait()
        // }
        // return result
    }
    
    visiblePlantCount(): short {
        let result = 0
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                if (!this.plants[i].hidden) {
                    result += 1
                }
            }
        }
        return result
    }
    
    // --------------------------------------------------------------------------------------- drawing 
    drawOnInvalidRect(destCanvas: HTMLCanvasElement, selectedPlants: PdPlant[], invalidRect: TRect, excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean): void {
        let partsDrawn: long
        
        partsDrawn = 0
        if (this.plants.length > 0) {
            for (let plantIndex = this.plants.length - 1; plantIndex >= 0; plantIndex--) {
                // go through list backwards because list order is drawing order is from front to back
                const plant = this.plants[plantIndex]
                let includePlant = false
                const plantRect = plant.boundsRect_pixels()
                if ((plantRect.Left === 0) && (plantRect.Right === 0) && (plantRect.Top === 0) && (plantRect.Bottom === 0)) {
                    // if plant has just been read in, recalculate bounds rect by drawing it 
                    includePlant = true
                }
                const intersectResult = plantRect.intersects(invalidRect)
                includePlant = includePlant || intersectResult
                if (excludeInvisiblePlants) {
                    includePlant = includePlant && !plant.hidden
                }
                if (excludeNonSelectedPlants) {
                    includePlant = includePlant && (selectedPlants.indexOf(plant) >= 0)
                }
                if (includePlant) {
                    plant.plantPartsDrawnAtStart = partsDrawn
                    try {
                        plant.computeBounds = true
                        if ((domain.options.cachePlantBitmaps) && (!domain.drawingToMakeCopyBitmap)) {
                            // TODO -- FIX ME plant.previewCache
                            // destCanvas.Draw(plantRect.Left, plantRect.Top, plant.previewCache)
                            // const context = plant.previewCache.Context
                            // if (context) {
                            //     destCanvas.drawImage(context.createImageData, plantRect.Left, plantRect.Top)
                            // }
                        } else {
                            const context = destCanvas.getContext("2d")
                            if (!context) return
                            plant.drawOn(context)
                        }
                    } finally {
                        plant.computeBounds = false
                    }
                    partsDrawn = partsDrawn + plant.totalPlantParts
                }
            }
        }
    }
    
    //procedure drawWithOpenGLOnInvalidRect(form: TForm; selectedPlants: PdPlant[]; invalidRect: TRect;
    //  glRect: TRect; excludeInvisiblePlants, excludeNonSelectedPlants: boolean);
    totalPlantPartCountInInvalidRect(selectedPlants: PdPlant[], invalidRect: TRect, excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean): long {
        let plantRect: TRect

        let result = 0
        if (this.plants.length > 0) {
            for (let plantIndex = this.plants.length - 1; plantIndex >= 0; plantIndex--) {
                const plant = this.plants[plantIndex]
                let includePlant = false
                plantRect = plant.boundsRect_pixels()
                if ((plantRect.Left === 0) && (plantRect.Right === 0) && (plantRect.Top === 0) && (plantRect.Bottom === 0)) {
                    // if plant has just been read in, recalculate bounds rect by drawing it 
                    includePlant = true
                }
                const intersectResult = plantRect.intersects(invalidRect)
                includePlant = includePlant || intersectResult
                if (excludeInvisiblePlants) {
                    includePlant = includePlant && !plant.hidden
                }
                if (excludeNonSelectedPlants) {
                    includePlant = includePlant && (selectedPlants.indexOf(plant) >= 0)
                }
                if (includePlant) {
                    plant.countPlantParts()
                    result = result + plant.totalPlantParts
                }
            }
        }
        return result
    }
    
    zeroAllBoundsRectsToForceRedraw(): void {
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                plant.setBoundsRect_pixels(new TRect(0, 0, 0, 0))
            }
        }
    }
    
    fillListWithPlantsInRectangle(aRect: TRect, aList: PdPlant[]): void {
        if (aList === null) {
            throw new Error("Problem: Nil list in method PdPlantManager.fillListWithPlantsInRectangle.")
        }
        if (this.plants.length > 0) {
            for (let plantIndex = 0; plantIndex <= this.plants.length - 1; plantIndex++) {
                const plant = this.plants[plantIndex]
                const intersectResult = aRect.intersects(plant.boundsRect_pixels())
                const includePlant = intersectResult && !plant.hidden
                if (includePlant) {
                    aList.push(plant)
                }
            }
        }
    }
    
    write3DOutputFileToFileName(selectedPlants: PdPlant[], excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean, fileName: string, outputType: short): void {
        let includePlant: boolean
        let includeRect: TRect
        let includedPlants: PdPlant[] = []
        let translatePlants: boolean
        
        setDecimalSeparator()
        includeRect = this.combinedPlantBoundsRects(selectedPlants, excludeInvisiblePlants, excludeNonSelectedPlants)
        if ((rWidth(includeRect) <= 0) || (rHeight(includeRect) <= 0)) {
            return
        }
        const turtle = new KfTurtle()
        turtle.createFor3DOutput(outputType, fileName)
        try {
            turtle.start3DExportFile()
            if (this.plants.length > 0) {
                for (let i = 0; i <= this.plants.length - 1; i++) {
                    // count the plants to be drawn so we know if there is more than one
                    const plant = this.plants[i]
                    includePlant = true
                    if (excludeInvisiblePlants) {
                        includePlant = includePlant && !plant.hidden
                    }
                    if (excludeNonSelectedPlants) {
                        includePlant = includePlant && (selectedPlants.indexOf(plant) >= 0)
                    }
                    if (includePlant) {
                        includedPlants.push(plant)
                    }
                }
            }
            if (includedPlants.length <= 1) {
                // if only one plant, don't translate or scale
                translatePlants = false
            } else {
                translatePlants = domain.exportOptionsFor3D[outputType].translatePlantsToWindowPositions
            }
            if (includedPlants.length > 0) {
                for (let i = 0; i <= includedPlants.length - 1; i++) {
                    // iterate over included plants
                    includedPlants[i].saveToGlobal3DOutputFile(i, translatePlants, includeRect, outputType, turtle)
                }
            }
        } finally {
            turtle.end3DExportFile()
        }
    }
    
    combinedPlantBoundsRects(selectedPlants: PdPlant[], excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean): TRect {
        let result = new TRect()
        let includePlant: boolean
        
        if (this.plants.length > 0) {
            for (let plantIndex = 0; plantIndex <= this.plants.length - 1; plantIndex++) {
                const plant = this.plants[plantIndex]
                includePlant = true
                if (excludeInvisiblePlants) {
                    includePlant = includePlant && !plant.hidden
                }
                if (excludeNonSelectedPlants) {
                    includePlant = includePlant && (selectedPlants.indexOf(plant) >= 0)
                }
                if (includePlant) {
                    result = result.union(plant.boundsRect_pixels())
                }
            }
        }
        return result
    }
    
    largestPlantBoundsRect(selectedPlants: PdPlant[], excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean): TRect {
        let result = new TRect()
        let includePlant: boolean
        let plantRect: TRect
        
        if (this.plants.length > 0) {
            for (let plantIndex = 0; plantIndex <= this.plants.length - 1; plantIndex++) {
                const plant = this.plants[plantIndex]
                includePlant = true
                if (excludeInvisiblePlants) {
                    includePlant = includePlant && !plant.hidden
                }
                if (excludeNonSelectedPlants) {
                    includePlant = includePlant && (selectedPlants.indexOf(plant) >= 0)
                }
                if (includePlant) {
                    plantRect = plant.boundsRect_pixels()
                    if (rWidth(plantRect) > result.Right) {
                        result.Right = rWidth(plantRect)
                    }
                    if (rHeight(plantRect) > result.Bottom) {
                        result.Bottom = rHeight(plantRect)
                    }
                }
            }
        }
        return result
    }
    
    // --------------------------------------------------------------------------------------- private clipboard 
    copyPlantsInListToPrivatePlantClipboard(aList: PdPlant[]): void {
        this.privatePlantClipboard = []
        if (aList.length > 0) {
            for (let i = 0; i <= aList.length - 1; i++) {
                const plant = aList[i]
                const newPlant = new PdPlant()
                plant.copyTo(newPlant)
                newPlant.setName("Copy of " + newPlant.getName())
                this.privatePlantClipboard.push(newPlant)
            }
        }
    }
    
    setCopiedFromMainWindowFlagInClipboardPlants(): void { 
        if (this.privatePlantClipboard.length > 0) {
            for (let i = 0; i <= this.privatePlantClipboard.length - 1; i++) {
                this.privatePlantClipboard[i].justCopiedFromMainWindow = true
            }
        }
    }
    
    pastePlantsFromPrivatePlantClipboardToList(aList: PdPlant[]): void {        
        if (this.privatePlantClipboard.length > 0) {
            for (let i = 0; i <= this.privatePlantClipboard.length - 1; i++) {
                // caller takes responsibility of freeing plants 
                const plant = this.privatePlantClipboard[i]
                const newPlant = new PdPlant()
                plant.copyTo(newPlant)
                newPlant.moveBy(new TPoint(kPasteMoveDistance, 0))
                aList.push(newPlant)
            }
        }
    }
    
    pasteFirstPlantFromPrivatePlantClipboardToPlant(newPlant: PdPlant): void {
        if (newPlant === null) {
            // this is used by the breeder and grower windows 
            // caller creates newPlant first 
            return
        }
        if (this.privatePlantClipboard.length > 0) {
            // caller takes responsibility of freeing plants 
            const plant = this.privatePlantClipboard[0]
            plant.copyTo(newPlant)
        }
    }
    
}

