// unit uprginfo

from conversion_common import *
import ubitmap
import umath
import usupport
import utimeser
import udomain
import ugener
import uplant
import ubreedr
import updform
import delphi_compatability

// const
const kBetweenGap = 4



export class TProgramInfoForm {
    Close: TButton = new TButton()
    saveListAs: TButton = new TButton()
    copyToClipboard: TButton = new TButton()
    helpButton: TSpeedButton = new TSpeedButton()
    infoList: TMemo = new TMemo()
    TProgramInfoForm.prototype = new PdForm()
    TProgramInfoForm.prototype.constructor = TProgramInfoForm
    
    //$R *.DFM
    FormCreate(Sender: TObject): void {
        let numParams: int
        let numSections: int
        let numHints: int
        let numPlants: int
        let numPlantsInPrivateClipboard: int
        let scale: float
        let offsetX: float
        let offsetY: float
        let memoryStatus: TMemoryStatus
        let diskSpace: long
        let screenColorBits: int
        let screenColors: long
        let screenDC: HDC
        let i: int
        let genCount: int
        let plCount: int
        let plant: PdPlant
        let generation: PdGeneration
        let totalMemory_K: double
        
        this.infoList.Lines.Clear()
        this.infoList.Lines.Add("")
        this.infoList.Lines.Add("PlantStudio Program Information")
        this.infoList.Lines.Add(usupport.gVersionName)
        this.infoList.Lines.Add("-------------------------------------------")
        // OS info
        this.infoList.Lines.Add("")
        this.infoList.Lines.Add("Operating system")
        this.infoList.Lines.Add("-------------------------------------------")
        this.GetOSInfo()
        memoryStatus.dwLength = FIX_sizeof(memoryStatus)
        UNRESOLVED.GlobalMemoryStatus(memoryStatus)
        this.infoList.Lines.Add("Percent memory in use: " + IntToStr(memoryStatus.dwMemoryLoad))
        this.infoList.Lines.Add("Total physical memory: " + IntToStr(memoryStatus.dwTotalPhys / 1024) + " K")
        this.infoList.Lines.Add("Available physical memory: " + IntToStr(memoryStatus.dwAvailPhys / 1024) + " K")
        this.infoList.Lines.Add("Total paging file: " + IntToStr(memoryStatus.dwTotalPageFile / 1024) + " K")
        this.infoList.Lines.Add("Available paging file: " + IntToStr(memoryStatus.dwAvailPageFile / 1024) + " K")
        this.infoList.Lines.Add("Total user memory: " + IntToStr(memoryStatus.dwTotalVirtual / 1024) + " K")
        this.infoList.Lines.Add("Available user memory: " + IntToStr(memoryStatus.dwAvailVirtual / 1024) + " K")
        // disk info
        this.infoList.Lines.Add("")
        this.infoList.Lines.Add("Hard disk")
        this.infoList.Lines.Add("-------------------------------------------")
        diskSpace = UNRESOLVED.DiskFree(0)
        this.infoList.Lines.Add("Disk space on current drive: " + IntToStr(diskSpace / (1024 * 1024)) + " MB")
        // screen info
        this.infoList.Lines.Add("")
        this.infoList.Lines.Add("Screen")
        this.infoList.Lines.Add("-------------------------------------------")
        screenDC = UNRESOLVED.GetDC(0)
        try {
            screenColorBits = (UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.BITSPIXEL) * UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.PLANES))
        } finally {
            UNRESOLVED.ReleaseDC(0, screenDC)
        }
        if (screenColorBits !== 32) {
            screenColors = 1 << screenColorBits
            this.infoList.Lines.Add("Colors: " + IntToStr(screenColors) + " (" + IntToStr(screenColorBits) + " bits)")
        } else {
            this.infoList.Lines.Add("Colors: true color (" + IntToStr(screenColorBits) + " bits)")
        }
        this.infoList.Lines.Add("Size: " + IntToStr(delphi_compatability.Screen.Width) + " x " + IntToStr(delphi_compatability.Screen.Height))
        this.infoList.Lines.Add("Resolution: " + IntToStr(delphi_compatability.Screen.PixelsPerInch) + " pixels/inch")
        // domain info
        this.infoList.Lines.Add("")
        this.infoList.Lines.Add("Global settings")
        this.infoList.Lines.Add("-------------------------------------------")
        this.infoList.Lines.Add("Sections: " + IntToStr(udomain.domain.sectionManager.sections.Count))
        this.infoList.Lines.Add("Parameters: " + IntToStr(udomain.domain.parameterManager.parameters.Count))
        this.infoList.Lines.Add("Hints: " + IntToStr(udomain.domain.hintManager.hints.Count))
        this.infoList.Lines.Add("Drawing scale: " + usupport.digitValueString(udomain.domain.plantManager.plantDrawScale_PixelsPerMm))
        this.infoList.Lines.Add("Drawing offset: " + usupport.digitValueString(udomain.domain.plantManager.plantDrawOffset_mm.x) + " x " + usupport.digitValueString(udomain.domain.plantManager.plantDrawOffset_mm.y))
        this.infoList.Lines.Add("")
        this.infoList.Lines.Add("Plants in file")
        this.infoList.Lines.Add("-------------------------------------------")
        // plant info
        this.infoList.Lines.Add("Plants in file: " + IntToStr(udomain.domain.plantManager.plants.Count))
        this.infoList.Lines.Add("Plants in private clipboard: " + IntToStr(udomain.domain.plantManager.privatePlantClipboard.Count))
        if (udomain.domain.plantManager.plants.Count > 0) {
            totalMemory_K = 0
            this.infoList.Lines.Add("")
            for (i = 0; i <= udomain.domain.plantManager.plants.Count - 1; i++) {
                plant = uplant.PdPlant(udomain.domain.plantManager.plants.Items[i])
                if (plant === null) {
                    continue
                }
                this.describePlant("Main window", plant)
                totalMemory_K = totalMemory_K + plant.totalMemoryUsed_K
            }
            if (totalMemory_K > 0) {
                this.infoList.Lines.Add("Total memory used by plants in main window: " + this.stringForMemoryInK(totalMemory_K))
            }
        }
        if ((ubreedr.BreederForm !== null) && (ubreedr.BreederForm.generations.Count > 0)) {
            // breeder info
            this.infoList.Lines.Add("")
            this.infoList.Lines.Add("Breeder plants")
            this.infoList.Lines.Add("-------------------------------------------")
            totalMemory_K = 0
            for (genCount = 0; genCount <= ubreedr.BreederForm.generations.Count - 1; genCount++) {
                generation = ugener.PdGeneration(ubreedr.BreederForm.generations.Items[genCount])
                if (generation.plants.Count > 0) {
                    for (plCount = 0; plCount <= generation.plants.Count - 1; plCount++) {
                        plant = uplant.PdPlant(generation.plants.Items[plCount])
                        if (plant === null) {
                            continue
                        }
                        this.describePlant("Breeder", plant)
                        totalMemory_K = totalMemory_K + plant.totalMemoryUsed_K
                    }
                }
            }
            if (totalMemory_K > 0) {
                this.infoList.Lines.Add("Total memory used by plants in breeder: " + this.stringForMemoryInK(totalMemory_K))
            }
        }
        if ((utimeser.TimeSeriesForm !== null) && (utimeser.TimeSeriesForm.plants.Count > 0)) {
            // time series info
            this.infoList.Lines.Add("")
            this.infoList.Lines.Add("Time series plants")
            this.infoList.Lines.Add("-------------------------------------------")
            totalMemory_K = 0
            for (i = 0; i <= utimeser.TimeSeriesForm.plants.Count - 1; i++) {
                plant = uplant.PdPlant(utimeser.TimeSeriesForm.plants.Items[i])
                if (plant === null) {
                    continue
                }
                this.describePlant("Time Series", plant)
                totalMemory_K = totalMemory_K + plant.totalMemoryUsed_K
            }
            if (totalMemory_K > 0) {
                this.infoList.Lines.Add("Total memory used by plants in time series window: " + this.stringForMemoryInK(totalMemory_K))
            }
        }
    }
    
    describePlant(describeString: string, plantProxy: TObject): void {
        let plant: PdPlant
        let theRect: TRect
        let totalMemUse: double
        let baseMemUse: double
        let hangingMemUse: double
        let tdoMemUse: double
        let cacheMemUse: double
        let partsMemUse: double
        
        if (plantProxy === null) {
            return
        }
        plant = plantProxy
        plant.countPlantParts()
        this.infoList.Lines.Add(describeString + " plant: " + plant.name)
        // memory
        totalMemUse = plant.calculateTotalMemorySize()
        baseMemUse = plant.instanceSize / 1024.0
        hangingMemUse = plant.hangingObjectsMemoryUse_K()
        tdoMemUse = plant.tdoMemoryUse_K()
        if (plant.previewCache !== null) {
            cacheMemUse = ubitmap.BitmapMemorySize(plant.previewCache) / 1024.0
        } else {
            cacheMemUse = 0
        }
        partsMemUse = totalMemUse - baseMemUse - hangingMemUse - tdoMemUse - cacheMemUse
        this.infoList.Lines.Add("  total memory use " + this.stringForMemoryInK(totalMemUse))
        this.infoList.Lines.Add("    base memory with parameters " + this.stringForMemoryInK(baseMemUse))
        this.infoList.Lines.Add("    posing and random number generators " + this.stringForMemoryInK(hangingMemUse))
        this.infoList.Lines.Add("    memory for 3D objects " + this.stringForMemoryInK(tdoMemUse))
        this.infoList.Lines.Add("    memory for drawing cache " + this.stringForMemoryInK(cacheMemUse))
        this.infoList.Lines.Add("    memory for plant parts " + this.stringForMemoryInK(partsMemUse))
        // status
        this.infoList.Lines.Add("  age " + IntToStr(plant.age))
        this.infoList.Lines.Add("  maturity " + IntToStr(plant.pGeneral.ageAtMaturity))
        this.infoList.Lines.Add("  scale " + usupport.digitValueString(plant.drawingScale_PixelsPerMm))
        if (plant.previewCache !== null) {
            this.infoList.Lines.Add("  cache " + IntToStr(plant.previewCache.Width) + "x" + IntToStr(plant.previewCache.Height))
        } else {
            this.infoList.Lines.Add("  no cache")
        }
        this.infoList.Lines.Add("  base " + usupport.digitValueString(plant.basePoint_mm.x) + "x" + usupport.digitValueString(plant.basePoint_mm.y))
        this.infoList.Lines.Add("  hidden " + usupport.boolToStr(plant.hidden))
        this.infoList.Lines.Add("  random number seed " + IntToStr(plant.pGeneral.startingSeedForRandomNumberGenerator))
        theRect = plant.boundsRect_pixels()
        this.infoList.Lines.Add("  bounds " + IntToStr(theRect.Left) + "x" + IntToStr(theRect.Top) + "x" + IntToStr(theRect.Right) + "x" + IntToStr(theRect.Bottom) + " (" + IntToStr(usupport.rWidth(theRect)) + "x" + IntToStr(usupport.rHeight(theRect)) + ")")
        this.infoList.Lines.Add("  parts " + IntToStr(plant.totalPlantParts))
        this.infoList.Lines.Add("")
    }
    
    stringForMemoryInK(kilobytes: double): string {
        let result = ""
        if (kilobytes <= 1024) {
            result = usupport.digitValueString(kilobytes) + " K"
        } else {
            result = usupport.digitValueString(kilobytes / 1024.0) + " MB"
        }
        return result
    }
    
    GetOSInfo(): void {
        let Platform: string
        let BuildNumber: int
        
        switch (UNRESOLVED.Win32Platform) {
            case UNRESOLVED.VER_PLATFORM_WIN32_WINDOWS:
                Platform = "Windows 95"
                BuildNumber = UNRESOLVED.Win32BuildNumber && 0x0000FFFF
                break
            case UNRESOLVED.VER_PLATFORM_WIN32_NT:
                Platform = "Windows NT"
                BuildNumber = UNRESOLVED.Win32BuildNumber
                break
            default:
                Platform = "Windows"
                BuildNumber = 0
                break
        if ((UNRESOLVED.Win32Platform === UNRESOLVED.VER_PLATFORM_WIN32_WINDOWS) || (UNRESOLVED.Win32Platform === UNRESOLVED.VER_PLATFORM_WIN32_NT)) {
            if (UNRESOLVED.Win32CSDVersion === "") {
                this.infoList.Lines.Add(UNRESOLVED.Format("%s %d.%d (Build %d)", {Platform, UNRESOLVED.Win32MajorVersion, UNRESOLVED.Win32MinorVersion, BuildNumber, }))
            } else {
                this.infoList.Lines.Add(UNRESOLVED.Format("%s %d.%d (Build %d: %s)", {Platform, UNRESOLVED.Win32MajorVersion, UNRESOLVED.Win32MinorVersion, BuildNumber, UNRESOLVED.Win32CSDVersion, }))
            }
        } else {
            this.infoList.Lines.Add(UNRESOLVED.Format("%s %d.%d", {Platform, UNRESOLVED.Win32MajorVersion, UNRESOLVED.Win32MinorVersion, }))
        }
    }
    
    saveListAsClick(Sender: TObject): void {
        let fileInfo: SaveFileNamesStructure
        
        if (this.infoList.Lines.Count <= 0) {
            return
        }
        if (!usupport.getFileSaveInfo(usupport.kFileTypeProgramInfo, usupport.kAskForFileName, "PStudio.txt", fileInfo)) {
            return
        }
        try {
            this.saveInfoListToFile(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            usupport.cleanUpAfterFileSave(fileInfo)
        }
    }
    
    saveInfoListToFile(fileName: string): void {
        let i: long
        let outputFile: TextFile
        
        AssignFile(outputFile, fileName)
        // v1.5
        usupport.setDecimalSeparator()
        Rewrite(outputFile)
        try {
            if (this.infoList.Lines.Count > 0) {
                for (i = 0; i <= this.infoList.Lines.Count - 1; i++) {
                    writeln(outputFile, this.infoList.Lines[i])
                }
            }
        } finally {
            CloseFile(outputFile)
        }
    }
    
    FormResize(Sender: TObject): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        this.Close.Left = this.ClientWidth - this.Close.Width - kBetweenGap
        this.saveListAs.Left = this.Close.Left
        this.copyToClipboard.Left = this.Close.Left
        this.helpButton.Left = this.Close.Left
        this.infoList.SetBounds(kBetweenGap, kBetweenGap, this.Close.Left - kBetweenGap * 2, umath.intMax(0, this.ClientHeight - kBetweenGap * 2))
    }
    
    CloseClick(Sender: TObject): void {
        this.ModalResult = mrCancel
    }
    
    copyToClipboardClick(Sender: TObject): void {
        this.infoList.SelectAll()
        this.infoList.CopyToClipboard()
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Getting_diagnostic_information")
    }
    
}

