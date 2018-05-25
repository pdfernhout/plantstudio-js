// unit Uplantmn

from conversion_common import *
import udebug
import utdo
import usplash
import umain
import u3dexport
import uturtle
import updcom
import udomain
import ucursor
import usupport
import uplant
import ucollect
import delphi_compatability

function checkVersionNumberInPlantNameLine(aLine: string): void {
    let versionNumberString: string
    let plantName: string
    let versionNumber: int
    
    // assumes line given is plant start line
    // e.g., >>> [rose] start PlantStudio plant <v1.0>
    plantName = usupport.stringBetween("[", "]", aLine)
    versionNumberString = usupport.stringBetween("<", ">", aLine)
    versionNumberString = usupport.stringBetween("v", ".", versionNumberString)
    versionNumber = StrToIntDef(versionNumberString, 0)
    if (versionNumber > 2) {
        ShowMessage("The plant \"" + plantName + "\" has a major version number of " + IntToStr(versionNumber) + "," + chr(13) + "which is higher than this major version of PlantStudio (2)." + chr(13) + chr(13) + "That means that although I may be able to read the plant," + chr(13) + "it will probably look better in the most up-to-date version of PlantStudio," + chr(13) + "which you can get at the PlantStudio web site.")
    }
}


export class PdPlantManager {
    plants: TListCollection = new TListCollection()
    privatePlantClipboard: TListCollection = new TListCollection()
    plantDrawOffset_mm: SinglePoint = new SinglePoint()
    plantDrawScale_PixelsPerMm: float = 0.0
    fitInVisibleAreaForConcentrationChange: boolean = false
    mainWindowOrientation: short = 0
    showBoundsRectangle: boolean = false
    mainWindowViewMode: short = 0
    
    create(): void {
        TObject.prototype.create.call(this)
        this.plants = ucollect.TListCollection().Create()
        this.privatePlantClipboard = ucollect.TListCollection().Create()
        this.plantDrawScale_PixelsPerMm = 1.0
    }
    
    destroy(): void {
        this.plants.free
        this.plants = null
        this.privatePlantClipboard.free
        this.privatePlantClipboard = null
        TObject.prototype.destroy.call(this)
    }
    
    addPlant(newPlant: PdPlant): void {
        this.plants.Add(newPlant)
    }
    
    removePlant(aPlant: PdPlant): boolean {
        let result = false
        // remove returns index of object in list before removal 
        result = (this.plants.Remove(aPlant) >= 0)
        return result
    }
    
    copyFromPlant(plant: PdPlant): PdPlant {
        let result = new PdPlant()
        let newPlant: PdPlant
        
        if (plant === null) {
            throw new GeneralException.create("Problem: Nil plant in method PdPlantManager.copyFromPlant.")
        }
        newPlant = uplant.PdPlant().create()
        plant.copyTo(newPlant)
        this.plants.Add(newPlant)
        result = newPlant
        return result
    }
    
    plantForIndex(index: long): PdPlant {
        let result = new PdPlant()
        result = uplant.PdPlant(this.plants.Items[index])
        return result
    }
    
    findPlantAtPoint(aPoint: TPoint): PdPlant {
        let result = new PdPlant()
        let plant: PdPlant
        let i: short
        
        result = null
        if (this.plants.Count > 0) {
            for (i = 0; i <= this.plants.Count - 1; i++) {
                plant = uplant.PdPlant(this.plants.Items[i])
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
    
    findFirstPlantWithBoundsRectAtPoint(aPoint: TPoint): PdPlant {
        let result = new PdPlant()
        let plant: PdPlant
        let plantIndex: short
        
        result = null
        if (this.plants.Count > 0) {
            for (plantIndex = this.plants.Count - 1; plantIndex >= 0; plantIndex--) {
                // go through list backwards because list order is drawing order is from front to back
                plant = uplant.PdPlant(this.plants.Items[plantIndex])
                if (plant.hidden) {
                    continue
                }
                if (plant.pointInBoundsRect(aPoint)) {
                    result = plant
                    return result
                }
            }
        }
        return result
    }
    
    loadPlantObjectsIntoTStrings(stringList: TStrings): void {
        let i: int
        let plant: PdPlant
        
        if (this.plants.Count > 0) {
            for (i = 0; i <= this.plants.Count - 1; i++) {
                plant = uplant.PdPlant(this.plants.Items[i])
                stringList.AddObject(plant.getName(), plant)
            }
        }
    }
    
    // --------------------------------------------------------------------------------------- input/output 
    loadPlantsFromFile(fileName: string, inPlantMover: boolean): void {
        let inputFile: TextFile
        let plant: PdPlant
        let aLine: string
        let plantName: string
        let concentratedInFile: boolean
        let concentratedLastTimeSaved: boolean
        let lineCount: int
        
        AssignFile(inputFile, fileName)
        try {
            // v1.5
            usupport.setDecimalSeparator()
            Reset(inputFile)
            this.plants.clear()
            // defaults in case things are missing from file
            this.plantDrawOffset_mm = usupport.setSinglePoint(0, 0)
            this.plantDrawScale_PixelsPerMm = 1.0
            this.mainWindowViewMode = udomain.domain.options.mainWindowViewMode
            this.mainWindowOrientation = udomain.domain.options.mainWindowOrientation
            this.showBoundsRectangle = udomain.domain.options.showBoundsRectangle
            concentratedLastTimeSaved = false
            this.fitInVisibleAreaForConcentrationChange = false
            while (!UNRESOLVED.eof(inputFile)) {
                // cfk testing
                aLine = usupport.tolerantReadln(inputFile, aLine)
                if ((aLine === "") || (UNRESOLVED.pos(";", aLine) === 1)) {
                    continue
                }
                if (UNRESOLVED.pos("offset=", aLine) === 1) {
                    this.plantDrawOffset_mm = usupport.stringToSinglePoint(usupport.stringBeyond(aLine, "="))
                } else if (UNRESOLVED.pos("scale=", aLine) === 1) {
                    try {
                        this.plantDrawScale_PixelsPerMm = intround(StrToFloat(usupport.stringBeyond(aLine, "=")) * 100.0) / 100.0
                    } catch (Exception e) {
                        this.plantDrawScale_PixelsPerMm = 1.0
                    }
                } else if (UNRESOLVED.pos("concentrated=", aLine) === 1) {
                    concentratedLastTimeSaved = udomain.domain.viewPlantsInMainWindowOnePlantAtATime()
                    if (udomain.domain.options.ignoreWindowSettingsInFile) {
                        // v2.1 if ignoring settings in file, use current settings, otherwise use what is in file
                        concentratedInFile = (this.mainWindowViewMode === udomain.kViewPlantsInMainWindowOneAtATime)
                    } else {
                        concentratedInFile = usupport.strToBool(usupport.stringBeyond(aLine, "="))
                    }
                    if (concentratedInFile) {
                        this.mainWindowViewMode = udomain.kViewPlantsInMainWindowOneAtATime
                    } else {
                        this.mainWindowViewMode = udomain.kViewPlantsInMainWindowFreeFloating
                    }
                    if (!inPlantMover) {
                        udomain.domain.options.mainWindowViewMode = this.mainWindowViewMode
                    }
                    this.fitInVisibleAreaForConcentrationChange = concentratedInFile && !concentratedLastTimeSaved
                } else if (UNRESOLVED.pos("orientation (top/side)=", aLine) === 1) {
                    if (!udomain.domain.options.ignoreWindowSettingsInFile) {
                        // v2.1 only read if not ignoring settings in file
                        this.mainWindowOrientation = StrToInt(usupport.stringBeyond(aLine, "="))
                    }
                } else if (UNRESOLVED.pos("boxes=", aLine) === 1) {
                    this.showBoundsRectangle = usupport.strToBool(usupport.stringBeyond(aLine, "="))
                    if (!inPlantMover) {
                        udomain.domain.options.showBoundsRectangle = this.showBoundsRectangle
                    }
                    if ((umain.MainForm !== null) && (!umain.MainForm.inFormCreation) && (!inPlantMover)) {
                        umain.MainForm.updateForChangeToDomainOptions()
                        umain.MainForm.copyDrawingBitmapToPaintBox()
                    }
                } else if (UNRESOLVED.pos("[", aLine) === 1) {
                    // plant start line
                    checkVersionNumberInPlantNameLine(aLine)
                    plant = uplant.PdPlant().create()
                    plantName = usupport.stringBeyond(aLine, "[")
                    plantName = usupport.stringUpTo(plantName, "]")
                    plant.setName(plantName)
                    udomain.domain.parameterManager.setAllReadFlagsToFalse()
                    // cfk change v1.3
                    // changed reading end of plant to read "end PlantStudio plant" instead of empty line because
                    // sometimes text wrapping puts empty lines in, not a good measure of completion.
                    // now end of plant must be there to be read. could produce endless loop if no end
                    // of plant, so stop at absolute cutoff of 300 non-empty, non-comment lines (there are now 215 parameters).
                    // also stop reading if reach next plant square bracket or end of file.
                    // v2.0 increased number of params to 350 so 300 is problem, changed to 3000 to avoid this in future, oops
                    lineCount = 0
                    while ((UNRESOLVED.pos(uplant.kPlantAsTextEndString, aLine) <= 0) && (lineCount <= 3000)) {
                        // aLine <> '' do
                        aLine = usupport.tolerantReadln(inputFile, aLine)
                        if ((UNRESOLVED.pos("[", aLine) === 1) || (UNRESOLVED.eof(inputFile))) {
                            // v1.60 reversed order of the next two lines -- fixes infinite loop when no end of plant
                            // v1.3 added check for next plant or eof
                            break
                        }
                        if ((trim(aLine) === "") || (UNRESOLVED.pos(";", aLine) === 1)) {
                            // v1.3 added skip empty lines
                            continue
                        }
                        plant.readLineAndTdoFromPlantFile(aLine, inputFile)
                        lineCount = lineCount + 1
                    }
                    plant.finishLoadingOrDefaulting(uplant.kCheckForUnreadParams)
                    this.plants.Add(plant)
                }
            }
        } finally {
            CloseFile(inputFile)
        }
    }
    
    savePlantsToFile(fileName: string, inPlantMover: boolean): void {
        let outputFile: TextFile
        let i: short
        let plant: PdPlant
        
        if (this.plants.Count <= 0) {
            return
        }
        AssignFile(outputFile, fileName)
        try {
            // v1.5
            usupport.setDecimalSeparator()
            if (!inPlantMover) {
                // update before writing out (keep as read in if in mover)
                // plantDrawOffset_mm is used from here
                // plantDrawScale_PixelsPerMm is used from here
                this.mainWindowViewMode = udomain.domain.options.mainWindowViewMode
                this.mainWindowOrientation = udomain.domain.options.mainWindowOrientation
                this.showBoundsRectangle = udomain.domain.options.showBoundsRectangle
            }
            Rewrite(outputFile)
            // v2.0
            writeln(outputFile, "; PlantStudio version 2.0 plant file")
            writeln(outputFile, "offset=" + usupport.singlePointToString(this.plantDrawOffset_mm))
            writeln(outputFile, "scale=" + usupport.digitValueString(this.plantDrawScale_PixelsPerMm))
            if (this.mainWindowViewMode === udomain.kViewPlantsInMainWindowOneAtATime) {
                writeln(outputFile, "concentrated=true")
            } else {
                writeln(outputFile, "concentrated=false")
            }
            // v2.0
            writeln(outputFile, "orientation (top/side)=" + IntToStr(this.mainWindowOrientation))
            // v2.0
            writeln(outputFile, "boxes=" + usupport.boolToStr(this.showBoundsRectangle))
            writeln(outputFile)
            for (i = 0; i <= this.plants.Count - 1; i++) {
                plant = uplant.PdPlant(this.plants.Items[i])
                if (plant === null) {
                    continue
                }
                plant.writeToPlantFile(outputFile)
            }
        } finally {
            CloseFile(outputFile)
        }
    }
    
    // v1.11
    reconcileFileWithTdoLibrary(plantFileName: string, tdoLibrary: string): int {
        let result = 0
        let plantFileTdos: TListCollection
        let libraryFileTdos: TListCollection
        let plantFile: TextFile
        let tdoFile: TextFile
        let outputTdoFile: TextFile
        let i: short
        let j: short
        let tdo: KfObject3d
        let plantFileTdo: KfObject3d
        let libraryTdo: KfObject3d
        let matchInLibrary: boolean
        let aLine: string
        let fileInfo: SaveFileNamesStructure
        
        result = 0
        if (!FileExists(plantFileName)) {
            // check that files exist
            plantFileName = usupport.getFileOpenInfo(usupport.kFileTypePlant, plantFileName, "Choose a plant file")
            if (plantFileName === "") {
                return result
            }
        }
        if (!FileExists(tdoLibrary)) {
            tdoLibrary = usupport.getFileOpenInfo(usupport.kFileTypeTdo, tdoLibrary, "Choose a 3D object library (tdo) file")
            if (tdoLibrary === "") {
                return result
            }
        }
        plantFileTdos = ucollect.TListCollection().Create()
        libraryFileTdos = ucollect.TListCollection().Create()
        try {
            ucursor.cursor_startWait()
            // read tdos from plants
            AssignFile(plantFile, plantFileName)
            try {
                // v1.5
                usupport.setDecimalSeparator()
                Reset(plantFile)
                while (!UNRESOLVED.eof(plantFile)) {
                    UNRESOLVED.readln(plantFile, aLine)
                    if (UNRESOLVED.pos(utdo.kStartTdoString, aLine) > 0) {
                        tdo = utdo.KfObject3D().create()
                        tdo.readFromFileStream(plantFile, utdo.kInTdoLibrary)
                        plantFileTdos.Add(tdo)
                    }
                }
            } finally {
                CloseFile(plantFile)
            }
            // read tdos from library
            AssignFile(tdoFile, tdoLibrary)
            try {
                // v1.5
                usupport.setDecimalSeparator()
                Reset(tdoFile)
                while (!UNRESOLVED.eof(tdoFile)) {
                    tdo = utdo.KfObject3D().create()
                    tdo.readFromFileStream(tdoFile, utdo.kInTdoLibrary)
                    libraryFileTdos.Add(tdo)
                }
            } finally {
                CloseFile(tdoFile)
            }
            if (plantFileTdos.Count > 0) {
                for (i = 0; i <= plantFileTdos.Count - 1; i++) {
                    // add plant tdos not in library list to library list
                    plantFileTdo = utdo.KfObject3D(plantFileTdos.Items[i])
                    matchInLibrary = false
                    if (libraryFileTdos.Count > 0) {
                        for (j = 0; j <= libraryFileTdos.Count - 1; j++) {
                            libraryTdo = utdo.KfObject3D(libraryFileTdos.Items[j])
                            if (plantFileTdo.isSameAs(libraryTdo)) {
                                matchInLibrary = true
                                break
                            }
                        }
                    }
                    if (!matchInLibrary) {
                        tdo = utdo.KfObject3D().create()
                        tdo.copyFrom(plantFileTdo)
                        libraryFileTdos.Add(tdo)
                        result += 1
                    }
                }
            }
            if (result > 0) {
                if (usupport.getFileSaveInfo(usupport.kFileTypeTdo, usupport.kDontAskForFileName, tdoLibrary, fileInfo)) {
                    // if any tdos in plant file but not in library, rewrite library
                    AssignFile(outputTdoFile, fileInfo.tempFile)
                    try {
                        // v1.5
                        usupport.setDecimalSeparator()
                        Rewrite(outputTdoFile)
                        usupport.startFileSave(fileInfo)
                        if (libraryFileTdos.Count > 0) {
                            for (i = 0; i <= libraryFileTdos.Count - 1; i++) {
                                tdo = UNRESOLVED.TObject(libraryFileTdos.Items[i])
                                if (tdo === null) {
                                    continue
                                }
                                tdo.writeToFileStream(outputTdoFile, utdo.kInTdoLibrary)
                            }
                        }
                        fileInfo.writingWasSuccessful = true
                    } finally {
                        CloseFile(outputTdoFile)
                        usupport.cleanUpAfterFileSave(fileInfo)
                    }
                }
            }
        } finally {
            plantFileTdos.free
            libraryFileTdos.free
            ucursor.cursor_stopWait()
        }
        return result
    }
    
    visiblePlantCount(): short {
        let result = 0
        let i: short
        
        result = 0
        if (this.plants.Count > 0) {
            for (i = 0; i <= this.plants.Count - 1; i++) {
                if (!uplant.PdPlant(this.plants.Items[i]).hidden) {
                    result += 1
                }
            }
        }
        return result
    }
    
    // --------------------------------------------------------------------------------------- drawing 
    drawOnInvalidRect(destCanvas: TCanvas, selectedPlants: TList, invalidRect: TRect, excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean): void {
        let plantIndex: int
        let plant: PdPlant
        let intersection: TRect
        let plantRect: TRect
        let intersectResult: longbool
        let includePlant: boolean
        let partsDrawn: long
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        partsDrawn = 0
        if (this.plants.Count > 0) {
            for (plantIndex = this.plants.Count - 1; plantIndex >= 0; plantIndex--) {
                // go through list backwards because list order is drawing order is from front to back
                plant = uplant.PdPlant(this.plants.Items[plantIndex])
                includePlant = false
                plantRect = plant.boundsRect_pixels()
                if ((plantRect.Left === 0) && (plantRect.Right === 0) && (plantRect.Top === 0) && (plantRect.Bottom === 0)) {
                    // if plant has just been read in, recalculate bounds rect by drawing it 
                    includePlant = true
                }
                intersectResult = delphi_compatability.IntersectRect(intersection, plantRect, invalidRect)
                includePlant = includePlant || intersectResult
                if (excludeInvisiblePlants) {
                    includePlant = includePlant && !plant.hidden
                }
                if (excludeNonSelectedPlants) {
                    includePlant = includePlant && (selectedPlants.IndexOf(plant) >= 0)
                }
                if (includePlant) {
                    plant.plantPartsDrawnAtStart = partsDrawn
                    try {
                        plant.computeBounds = true
                        if ((udomain.domain.options.cachePlantBitmaps) && (!udomain.domain.drawingToMakeCopyBitmap)) {
                            destCanvas.Draw(plantRect.Left, plantRect.Top, plant.previewCache)
                        } else {
                            plant.drawOn(destCanvas)
                        }
                    } finally {
                        plant.computeBounds = false
                    }
                    partsDrawn = partsDrawn + plant.totalPlantParts
                }
            }
        }
    }
    
    //procedure drawWithOpenGLOnInvalidRect(form: TForm; selectedPlants: TList; invalidRect: TRect;
    //  glRect: TRect; excludeInvisiblePlants, excludeNonSelectedPlants: boolean);
    totalPlantPartCountInInvalidRect(selectedPlants: TList, invalidRect: TRect, excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean): long {
        let result = 0
        let plantIndex: int
        let plant: PdPlant
        let intersection: TRect
        let plantRect: TRect
        let intersectResult: longbool
        let includePlant: boolean
        
        result = 0
        if (delphi_compatability.Application.terminated) {
            return result
        }
        if (this.plants.Count > 0) {
            for (plantIndex = this.plants.Count - 1; plantIndex >= 0; plantIndex--) {
                plant = uplant.PdPlant(this.plants.Items[plantIndex])
                includePlant = false
                plantRect = plant.boundsRect_pixels()
                if ((plantRect.Left === 0) && (plantRect.Right === 0) && (plantRect.Top === 0) && (plantRect.Bottom === 0)) {
                    // if plant has just been read in, recalculate bounds rect by drawing it 
                    includePlant = true
                }
                intersectResult = delphi_compatability.IntersectRect(intersection, plantRect, invalidRect)
                includePlant = includePlant || intersectResult
                if (excludeInvisiblePlants) {
                    includePlant = includePlant && !plant.hidden
                }
                if (excludeNonSelectedPlants) {
                    includePlant = includePlant && (selectedPlants.IndexOf(plant) >= 0)
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
        let i: short
        let plant: PdPlant
        
        if (this.plants.Count > 0) {
            for (i = 0; i <= this.plants.Count - 1; i++) {
                plant = uplant.PdPlant(this.plants.Items[i])
                plant.setBoundsRect_pixels(Rect(0, 0, 0, 0))
            }
        }
    }
    
    fillListWithPlantsInRectangle(aRect: TRect, aList: TList): void {
        let plantIndex: int
        let plant: PdPlant
        let intersection: TRect
        let intersectResult: longbool
        let includePlant: boolean
        
        if (aList === null) {
            throw new GeneralException.create("Problem: Nil list in method PdPlantManager.fillListWithPlantsInRectangle.")
        }
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.plants.Count > 0) {
            for (plantIndex = 0; plantIndex <= this.plants.Count - 1; plantIndex++) {
                plant = uplant.PdPlant(this.plants.Items[plantIndex])
                includePlant = false
                intersectResult = delphi_compatability.IntersectRect(intersection, plant.boundsRect_pixels(), aRect)
                includePlant = includePlant || intersectResult
                includePlant = includePlant && !plant.hidden
                if (includePlant) {
                    aList.Add(plant)
                }
            }
        }
    }
    
    write3DOutputFileToFileName(selectedPlants: TList, excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean, fileName: string, outputType: short): void {
        let plant: PdPlant
        let i: int
        let includePlant: boolean
        let includeRect: TRect
        let includedPlants: TList
        let translatePlants: boolean
        let turtle: KfTurtle
        
        usupport.setDecimalSeparator()
        includedPlants = null
        includeRect = this.combinedPlantBoundsRects(selectedPlants, excludeInvisiblePlants, excludeNonSelectedPlants)
        if ((usupport.rWidth(includeRect) <= 0) || (usupport.rHeight(includeRect) <= 0)) {
            return
        }
        includedPlants = delphi_compatability.TList().Create()
        turtle = uturtle.KfTurtle().createFor3DOutput(outputType, fileName)
        try {
            turtle.start3DExportFile()
            if (this.plants.Count > 0) {
                for (i = 0; i <= this.plants.Count - 1; i++) {
                    // count the plants to be drawn so we know if there is more than one
                    plant = uplant.PdPlant(this.plants.Items[i])
                    includePlant = true
                    if (excludeInvisiblePlants) {
                        includePlant = includePlant && !plant.hidden
                    }
                    if (excludeNonSelectedPlants) {
                        includePlant = includePlant && (selectedPlants.IndexOf(plant) >= 0)
                    }
                    if (includePlant) {
                        includedPlants.Add(plant)
                    }
                }
            }
            if (includedPlants.Count <= 1) {
                // if only one plant, don't translate or scale
                translatePlants = false
            } else {
                translatePlants = udomain.domain.exportOptionsFor3D[outputType].translatePlantsToWindowPositions
            }
            if (includedPlants.Count > 0) {
                for (i = 0; i <= includedPlants.Count - 1; i++) {
                    // iterate over included plants
                    uplant.PdPlant(includedPlants.Items[i]).saveToGlobal3DOutputFile(i, translatePlants, includeRect, outputType, turtle)
                }
            }
        } finally {
            turtle.end3DExportFile()
            turtle.free
            turtle = null
            includedPlants.free
            includedPlants = null
        }
    }
    
    combinedPlantBoundsRects(selectedPlants: TList, excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean): TRect {
        let result = new TRect()
        let plant: PdPlant
        let plantIndex: int
        let includePlant: boolean
        
        result = delphi_compatability.Bounds(0, 0, 0, 0)
        if (this.plants.Count > 0) {
            for (plantIndex = 0; plantIndex <= this.plants.Count - 1; plantIndex++) {
                plant = uplant.PdPlant(this.plants.Items[plantIndex])
                includePlant = true
                if (excludeInvisiblePlants) {
                    includePlant = includePlant && !plant.hidden
                }
                if (excludeNonSelectedPlants) {
                    includePlant = includePlant && (selectedPlants.IndexOf(plant) >= 0)
                }
                if (includePlant) {
                    delphi_compatability.UnionRect(result, result, plant.boundsRect_pixels())
                }
            }
        }
        return result
    }
    
    largestPlantBoundsRect(selectedPlants: TList, excludeInvisiblePlants: boolean, excludeNonSelectedPlants: boolean): TRect {
        let result = new TRect()
        let plant: PdPlant
        let plantIndex: int
        let includePlant: boolean
        let plantRect: TRect
        
        result = delphi_compatability.Bounds(0, 0, 0, 0)
        if (this.plants.Count > 0) {
            for (plantIndex = 0; plantIndex <= this.plants.Count - 1; plantIndex++) {
                plant = uplant.PdPlant(this.plants.Items[plantIndex])
                includePlant = true
                if (excludeInvisiblePlants) {
                    includePlant = includePlant && !plant.hidden
                }
                if (excludeNonSelectedPlants) {
                    includePlant = includePlant && (selectedPlants.IndexOf(plant) >= 0)
                }
                if (includePlant) {
                    plantRect = plant.boundsRect_pixels()
                    if (usupport.rWidth(plantRect) > result.Right) {
                        result.Right = usupport.rWidth(plantRect)
                    }
                    if (usupport.rHeight(plantRect) > result.Bottom) {
                        result.Bottom = usupport.rHeight(plantRect)
                    }
                }
            }
        }
        return result
    }
    
    // --------------------------------------------------------------------------------------- private clipboard 
    copyPlantsInListToPrivatePlantClipboard(aList: TList): void {
        let i: short
        let plant: PdPlant
        let newPlant: PdPlant
        
        this.privatePlantClipboard.clear()
        if (aList.Count > 0) {
            for (i = 0; i <= aList.Count - 1; i++) {
                plant = uplant.PdPlant(aList.Items[i])
                newPlant = uplant.PdPlant().create()
                plant.copyTo(newPlant)
                newPlant.setName("Copy of " + newPlant.getName())
                this.privatePlantClipboard.Add(newPlant)
            }
        }
    }
    
    setCopiedFromMainWindowFlagInClipboardPlants(): void {
        let i: short
        
        if (this.privatePlantClipboard.Count > 0) {
            for (i = 0; i <= this.privatePlantClipboard.Count - 1; i++) {
                uplant.PdPlant(this.privatePlantClipboard.Items[i]).justCopiedFromMainWindow = true
            }
        }
    }
    
    pastePlantsFromPrivatePlantClipboardToList(aList: TList): void {
        let i: short
        let plant: PdPlant
        let newPlant: PdPlant
        
        if (this.privatePlantClipboard.Count > 0) {
            for (i = 0; i <= this.privatePlantClipboard.Count - 1; i++) {
                // caller takes responsibility of freeing plants 
                plant = uplant.PdPlant(this.privatePlantClipboard.Items[i])
                newPlant = uplant.PdPlant().create()
                plant.copyTo(newPlant)
                newPlant.moveBy(point(updcom.kPasteMoveDistance, 0))
                aList.Add(newPlant)
            }
        }
    }
    
    pasteFirstPlantFromPrivatePlantClipboardToPlant(newPlant: PdPlant): void {
        let plant: PdPlant
        
        if (newPlant === null) {
            // this is used by the breeder and grower windows 
            // caller creates newPlant first 
            return
        }
        if (this.privatePlantClipboard.Count > 0) {
            // caller takes responsibility of freeing plants 
            plant = uplant.PdPlant(this.privatePlantClipboard.Items[0])
            plant.copyTo(newPlant)
        }
    }
    
}

