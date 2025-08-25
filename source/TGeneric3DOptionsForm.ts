// unit uoptions3dexport

import * as m from "mithril"
import { caption, ffFixed, float, FloatToStrF, HelpJump, imageDir, int, intround, IntToStr, long, MessageDialog, mtConfirmation, short, StrToFloat, StrToIntDef, TColorRef } from "./common"
import { domain, kIncludeAllPlants, kIncludeSelectedPlants, kIncludeVisiblePlants, kMaxOutputCylinderFaces, kMinOutputCylinderFaces } from "./PdDomain"
import { dxfColors, ExportFormats, ExportPart, FileExport3DOptionsStructure, kMax3DFaces, kMax3DPoints, kMaxStoredMaterials, longNameForDXFPartType } from "./U3dexport"
import { chr, len, valueString } from "./usupport"
import { unfinished } from "./temporary"
import { TRect } from "./TRect"
import { PdPlant } from "./PdPlant"
import { MainForm } from "./FormHolder"

// from conversion_common import *
// import uplant
// import umain
// import udomain
// import udxfclr
// import usupport
// import updform
// import u3dexport
// import uturtle
// import delphi_compatability

const kTransferLoad = 1
const kTransferSave = 2

export class TGeneric3DOptionsForm {
    // drawWhichPlantsGroupBox: TGroupBox = new TGroupBox()
    useSelectedPlants: boolean = true
    useVisiblePlants: boolean = false
    useAllPlants: boolean = false
    // otherGroupBox: TGroupBox = new TGroupBox()
    // translatePlantsToWindowPositions: TCheckBox = new TCheckBox()
    // dxfColorsGroupBox: TGroupBox = new TGroupBox()
    // colorDXFFromRGB: TRadioButton = new TRadioButton()
    // colorDXFFromOneColor: TRadioButton = new TRadioButton()
    // wholePlantColor: TPanel = new TPanel()
    // colorDXFFromPlantPartType: TRadioButton = new TRadioButton()
    // colorsByPlantPart: TListBox = new TListBox()
    // setPlantPartColor: TButton = new TButton()
    // povLimitsGroupBox: TGroupBox = new TGroupBox()
    // Label4: TLabel = new TLabel()
    // Label5: TLabel = new TLabel()
    // minLineLengthToWrite: TEdit = new TEdit()
    // minTdoScaleToWrite: TEdit = new TEdit()
    // nestingGroupBox: TGroupBox = new TGroupBox()
    // nestLeafAndPetiole: TCheckBox = new TCheckBox()
    // nestCompoundLeaf: TCheckBox = new TCheckBox()
    // nestInflorescence: TCheckBox = new TCheckBox()
    // nestPedicelAndFlowerFruit: TCheckBox = new TCheckBox()
    // nestFloralLayers: TCheckBox = new TCheckBox()
    // commentOutUnionAtEnd: TCheckBox = new TCheckBox()
    // layeringOption: TRadioGroup = new TRadioGroup()
    // writeColors: TCheckBox = new TCheckBox()
    // Close: TButton = new TButton()
    // cancel: TButton = new TButton()
    // helpButton: TSpeedButton = new TSpeedButton()
    // threeDSWarningPanel: TPanel = new TPanel()
    // Label6: TLabel = new TLabel()
    // plantNameAndCylinderSidesPanel: TPanel = new TPanel()
    // Label2: TLabel = new TLabel()
    // Label3: TLabel = new TLabel()
    // stemCylinderFacesLabel: TLabel = new TLabel()
    // sidesLabel: TLabel = new TLabel()
    // lengthOfShortName: TSpinEdit = new TSpinEdit()
    // stemCylinderFaces: TSpinEdit = new TSpinEdit()
    // dxfWriteColors: TCheckBox = new TCheckBox()
    // reorientGroupBox: TGroupBox = new TGroupBox()
    // xRotationBeforeDraw: TSpinEdit = new TSpinEdit()
    // writePlantNumberInFrontOfName: TCheckBox = new TCheckBox()
    // vrmlVersionRadioGroup: TRadioGroup = new TRadioGroup()
    // Label10: TLabel = new TLabel()
    // Label1: TLabel = new TLabel()
    // overallScalingFactor_pct: TSpinEdit = new TSpinEdit()
    // Label9: TLabel = new TLabel()
    // Label7: TLabel = new TLabel()
    // estimationStringGrid: TStringGrid = new TStringGrid()
    // pressPlantsPanel: TPanel = new TPanel()
    // pressPlants: TCheckBox = new TCheckBox()
    // directionToPressPlants: TComboBox = new TComboBox()
    // Label8: TLabel = new TLabel()
    // makeTrianglesDoubleSided: TCheckBox = new TCheckBox()
    outputType: short = 0
    transferDirection: short = 0
    options: FileExport3DOptionsStructure = new FileExport3DOptionsStructure()
    optionsChanged: boolean = false
    totalPlants: long = 0
    totalParts: long = 0
    totalPoints: long = 0
    totalTriangles: long = 0
    totalMaterials: long = 0
    Caption: string = "3D Export Options"
    close: ((form: TGeneric3DOptionsForm | null) => void) | null = null
    
    //$R *.DFM
    FormActivate(): void {
        // outputType must be set before this is called
        this.transferDirection = kTransferLoad
        if (this.outputType === ExportFormats.kDXF) {
            this.fillPlantPartColors()
        }
        this.transferFields()
    }
    
    CloseClick(): void {
        if ((this.useSelectedPlants) && (MainForm.selectedPlants.length <= 0)) {
            // do not let them complete action if no plants are selected
            MessageDialog("You chose \"selected\" for \"Draw which plants\", but no plants are selected." + chr(13) + 
            "You should make another choice, or click Cancel and select some plants.", 0 /* mtError */, 0, 0)
            return
        }
        if (this.outputType === ExportFormats.kLWO) {
            if ((this.totalPoints > kMax3DPoints) || (this.totalTriangles > kMax3DFaces)) {
                // do not let them complete action if too many points are selected - only for LWO which holds ALL
                // points and faces until the end of the file
                MessageDialog("You have selected too many points or triangles for this file format." + chr(13) + 
                "A maximum of 65,536 points or triangles can be exported to one LWO file." + chr(13) + chr(13) + 
                "You should make another choice of plants, or click Cancel and select fewer plants," + chr(13) + 
                "or export to another format.", 0, /* mtWarning */ 0, 0)
                return
            }
        }
        switch (this.outputType) {
            case ExportFormats.kOBJ:
                if ((this.totalPlants * (ExportPart.kExportPartLast + 1) > kMaxStoredMaterials)) {
                    // warn them if the colors list will be truncated
                    // limit of 1000 materials
                    if (MessageDialog("You have selected too many materials for this file format." + chr(13) + 
                        "The number of distinct colors will be bounded at " + IntToStr(kMaxStoredMaterials) + "." + chr(13) + 
                        "Some plants may refer to non-existent colors." + chr(13) + chr(13) + 
                        "To proceed anyway, click OK.", mtConfirmation, 0, 0) === false) {
                        return
                    }
                }
                break
            case ExportFormats.kLWO:
                if ((this.totalPlants * (ExportPart.kExportPartLast + 1) > kMaxStoredMaterials)) {
                    // warn them if the colors list will be truncated
                    // limit of 1000 materials
                    if (MessageDialog("You have selected too many materials for this file format." + chr(13) + 
                    "The number of distinct colors will be bounded at " + IntToStr(kMaxStoredMaterials) + "." + chr(13) + 
                    "Some plants may refer to non-existent colors." + chr(13) + chr(13) + 
                    "To proceed anyway, click OK.", mtConfirmation, 0, 0) === false) {
                        return
                    }
                }
                break
        }
        this.transferDirection = kTransferSave
        this.transferFields()
        this.close!(this)
    }
    
    cancelClick(): void {
        this.close!(null)
    }
    
    rearrangeItemsForOutputType(): void {
        // TODO PDF:  Use or remove commented code in rearrangeItemsForOutputType
        switch (this.outputType) {
            case ExportFormats.kDXF:
                this.Caption = "Save DXF File"
                // this.writeColors.Visible = false
                // this.makeTrianglesDoubleSided.Top = this.writeColors.Top
                // this.translatePlantsToWindowPositions.Top = this.makeTrianglesDoubleSided.Top + this.makeTrianglesDoubleSided.Height + 4
                // this.otherGroupBox.Height = this.translatePlantsToWindowPositions.Top + this.translatePlantsToWindowPositions.Height + 6
                // this.dxfColorsGroupBox.SetBounds(4, this.otherGroupBox.Top + this.otherGroupBox.Height + 4, this.dxfColorsGroupBox.Width, this.dxfColorsGroupBox.Height)
                // this.dxfColorsGroupBox.Visible = true
                break
            case ExportFormats.kPOV:
                this.Caption = "Save POV Include (INC) File"
                // this.plantNameAndCylinderSidesPanel.Visible = false
                // this.writePlantNumberInFrontOfName.Visible = false
                // this.pressPlantsPanel.Top = 16
                // this.writeColors.Top = this.pressPlantsPanel.Top + this.pressPlantsPanel.Height
                // this.makeTrianglesDoubleSided.Top = this.writeColors.Top + this.writeColors.Height + 4
                // this.translatePlantsToWindowPositions.Top = this.makeTrianglesDoubleSided.Top + this.makeTrianglesDoubleSided.Height + 4
                // this.otherGroupBox.Height = this.translatePlantsToWindowPositions.Top + this.translatePlantsToWindowPositions.Height + 6
                // this.reorientGroupBox.SetBounds(4, this.drawWhichPlantsGroupBox.Top + this.drawWhichPlantsGroupBox.Height + 4, this.reorientGroupBox.Width, this.reorientGroupBox.Height)
                // this.otherGroupBox.SetBounds(4, this.reorientGroupBox.Top + this.reorientGroupBox.Height + 4, this.otherGroupBox.Width, this.otherGroupBox.Height)
                // this.povLimitsGroupBox.SetBounds(4, this.otherGroupBox.Top + this.otherGroupBox.Height + 4, this.povLimitsGroupBox.Width, this.povLimitsGroupBox.Height)
                // this.povLimitsGroupBox.Visible = true
                // this.nestingGroupBox.SetBounds(4, this.povLimitsGroupBox.Top + this.povLimitsGroupBox.Height + 4, this.nestingGroupBox.Width, this.nestingGroupBox.Height)
                // this.nestingGroupBox.Visible = true
                // this.layeringOption.Visible = false
                break
            case ExportFormats.k3DS:
                this.Caption = "Save 3DS File"
                // this.threeDSWarningPanel.SetBounds(4, this.otherGroupBox.Top + this.otherGroupBox.Height + 4, this.threeDSWarningPanel.Width, this.threeDSWarningPanel.Height)
                // this.threeDSWarningPanel.Visible = true
                break
            case ExportFormats.kOBJ:
                this.Caption = "Save WaveFront OBJ File (ASCII)"
                break
            case ExportFormats.kVRML:
                this.Caption = "Save VRML File"
                // this.layeringOption.Visible = false
                // this.reorientGroupBox.SetBounds(4, this.drawWhichPlantsGroupBox.Top + this.drawWhichPlantsGroupBox.Height + 4, this.reorientGroupBox.Width, this.reorientGroupBox.Height)
                // this.otherGroupBox.SetBounds(4, this.reorientGroupBox.Top + this.reorientGroupBox.Height + 4, this.otherGroupBox.Width, this.otherGroupBox.Height)
                // this.vrmlVersionRadioGroup.SetBounds(4, this.otherGroupBox.Top + this.otherGroupBox.Height + 4, this.vrmlVersionRadioGroup.Width, this.vrmlVersionRadioGroup.Height)
                // this.vrmlVersionRadioGroup.Visible = true
                // this.nestingGroupBox.SetBounds(4, this.vrmlVersionRadioGroup.Top + this.vrmlVersionRadioGroup.Height + 4, this.nestingGroupBox.Width, this.nestingGroupBox.Height)
                // this.commentOutUnionAtEnd.Visible = false
                // this.nestingGroupBox.Height = this.nestInflorescence.Top + this.nestInflorescence.Height + 6
                // this.nestingGroupBox.Visible = true
                break
            case ExportFormats.kLWO:
                this.Caption = "Save Lightwave LWO File"
                break
        }
    }
    
    transferFields(): void {
        let oldExportType: short
        
        // options that work for all types
        if (this.transferDirection === kTransferLoad) {
            switch (this.options.exportType) {
                case kIncludeSelectedPlants:
                    this.useSelectedPlants = true
                    this.useVisiblePlants = false
                    this.useAllPlants = false
                    break
                case kIncludeVisiblePlants:
                    this.useSelectedPlants = false
                    this.useVisiblePlants = true
                    this.useAllPlants = false
                    break
                case kIncludeAllPlants:
                    this.useSelectedPlants = false
                    this.useVisiblePlants = false
                    this.useAllPlants = true
                    break
            }
        } else {
            oldExportType = this.options.exportType
            if (this.useSelectedPlants) {
                this.options.exportType = kIncludeSelectedPlants
            } else if (this.useVisiblePlants) {
                this.options.exportType = kIncludeVisiblePlants
            } else if (this.useAllPlants) {
                this.options.exportType = kIncludeAllPlants
            }
            if ((oldExportType !== this.options.exportType)) {
                this.optionsChanged = true
            }
        }
        this.options.layeringOption = this.transferRadioGroup(this.layeringOption, this.options.layeringOption)
        this.options.stemCylinderFaces = this.transferSmallintSpinEditBox(this.stemCylinderFaces, this.options.stemCylinderFaces)
        this.options.lengthOfShortName = this.transferSmallintSpinEditBox(this.lengthOfShortName, this.options.lengthOfShortName)
        this.options.xRotationBeforeDraw = this.transferSmallintSpinEditBox(this.xRotationBeforeDraw, this.options.xRotationBeforeDraw)
        this.options.translatePlantsToWindowPositions = this.transferCheckBox(this.translatePlantsToWindowPositions, this.options.translatePlantsToWindowPositions)
        this.options.writePlantNumberInFrontOfName = this.transferCheckBox(this.writePlantNumberInFrontOfName, this.options.writePlantNumberInFrontOfName)
        this.options.writeColors = this.transferCheckBox(this.writeColors, this.options.writeColors)
        this.options.overallScalingFactor_pct = this.transferSmallintSpinEditBox(this.overallScalingFactor_pct, this.options.overallScalingFactor_pct)
        this.options.pressPlants = this.transferCheckBox(this.pressPlants, this.options.pressPlants)
        this.options.directionToPressPlants = this.transferComboBox(this.directionToPressPlants, this.options.directionToPressPlants)
        this.options.makeTrianglesDoubleSided = this.transferCheckBox(this.makeTrianglesDoubleSided, this.options.makeTrianglesDoubleSided)
        // nothing yet
        switch (this.outputType) {
            case ExportFormats.kDXF:
                // options for specific types
                // do after general one to override
                this.options.writeColors = this.transferCheckBox(this.dxfWriteColors, this.options.writeColors)
                if (this.transferDirection === kTransferLoad) {
                    this.dxfWriteColorsClick(this)
                }
                this.options.dxf_whereToGetColors = this.transferRadioButton(this.colorDXFFromRGB, this.options.dxf_whereToGetColors, u3dexport.kColorDXFFromRGB)
                this.options.dxf_whereToGetColors = this.transferRadioButton(this.colorDXFFromOneColor, this.options.dxf_whereToGetColors, u3dexport.kColorDXFFromOneColor)
                this.options.dxf_whereToGetColors = this.transferRadioButton(this.colorDXFFromPlantPartType, this.options.dxf_whereToGetColors, u3dexport.kColorDXFFromPlantPartType)
                this.wholePlantColor.Color = u3dexport.dxfColors[this.options.dxf_wholePlantColorIndex]
                if (this.transferDirection === kTransferLoad) {
                    this.colorsByPlantPart.Invalidate()
                }
                break
            case ExportFormats.kPOV:
                this.options.pov_minLineLengthToWrite = this.transferSingleEditBox(this.minLineLengthToWrite, this.options.pov_minLineLengthToWrite)
                this.options.pov_minTdoScaleToWrite = this.transferSingleEditBox(this.minTdoScaleToWrite, this.options.pov_minTdoScaleToWrite)
                this.options.pov_commentOutUnionAtEnd = this.transferCheckBox(this.commentOutUnionAtEnd, this.options.pov_commentOutUnionAtEnd)
                this.options.nest_Inflorescence = this.transferCheckBox(this.nestInflorescence, this.options.nest_Inflorescence)
                this.options.nest_LeafAndPetiole = this.transferCheckBox(this.nestLeafAndPetiole, this.options.nest_LeafAndPetiole)
                this.options.nest_CompoundLeaf = this.transferCheckBox(this.nestCompoundLeaf, this.options.nest_CompoundLeaf)
                this.options.nest_PedicelAndFlowerFruit = this.transferCheckBox(this.nestPedicelAndFlowerFruit, this.options.nest_PedicelAndFlowerFruit)
                this.options.nest_FloralLayers = this.transferCheckBox(this.nestFloralLayers, this.options.nest_FloralLayers)
                break
            case ExportFormats.k3DS:
                // nothing special
                break
            case ExportFormats.kOBJ:
                // nothing special
                break
            case ExportFormats.kVRML:
                this.options.nest_Inflorescence = this.transferCheckBox(this.nestInflorescence, this.options.nest_Inflorescence)
                this.options.nest_LeafAndPetiole = this.transferCheckBox(this.nestLeafAndPetiole, this.options.nest_LeafAndPetiole)
                this.options.nest_CompoundLeaf = this.transferCheckBox(this.nestCompoundLeaf, this.options.nest_CompoundLeaf)
                this.options.nest_PedicelAndFlowerFruit = this.transferCheckBox(this.nestPedicelAndFlowerFruit, this.options.nest_PedicelAndFlowerFruit)
                this.options.nest_FloralLayers = this.transferCheckBox(this.nestFloralLayers, this.options.nest_FloralLayers)
                this.options.vrml_version = this.transferRadioGroup(this.vrmlVersionRadioGroup, this.options.vrml_version)
                break
            case ExportFormats.kLWO:
                break
        }
    }

    predictedSizeView() {
        this.totalPlants = 0
        this.totalPoints = 0
        this.totalTriangles = 0
        this.totalParts = 0
        this.totalMaterials = 0
        if (domain.plantManager.plants.length > 0) {
            for (let i = 0; i <= domain.plantManager.plants.length - 1; i++) {
                const plant = domain.plantManager.plants[i]
                if (plant === null) {
                    continue
                }
                if ((this.useSelectedPlants) && (!MainForm.isSelected(plant))) {
                    continue
                }
                if ((this.useVisiblePlants) && (plant.hidden)) {
                    continue
                }
                plant.countPlantPartsFor3DOutput(this.outputType, this.options.stemCylinderFaces /* TODO PDF: Use or remove: StrToIntDef(this.stemCylinderFaces.Text, 20) */)
                this.totalPoints = this.totalPoints + plant.total3DExportPoints
                this.totalTriangles = this.totalTriangles + plant.total3DExportTriangles
                this.totalParts = this.totalParts + plant.totalPlantParts
                this.totalMaterials = this.totalMaterials + plant.total3DExportMaterials
                this.totalPlants += 1
            }
        }
        const estimatedBytes = this.estimateBytes(domain.plantManager.plants.length, this.totalParts, this.totalPoints, this.totalTriangles)
        // in MB
        this.options.fileSize = 1.0 * estimatedBytes / (1024 * 1024)

        let sizeAndUnit
        if (this.options.fileSize > 1.0) {
            sizeAndUnit = FloatToStrF(this.options.fileSize, ffFixed, 7, 2) + " MB"
        } else {
            sizeAndUnit = IntToStr(intround(this.options.fileSize * 1024)) + " K"
        }

        return m("table.collapse",
            m("thead",
                m("tr",
                    m("th.pa1.ba", "plants"),
                    m("th.pa1.ba", "parts"),
                    m("th.pa1.ba", "points"),
                    m("th.pa1.ba", "polygons"),
                    m("th.pa1.ba", "colors"),
                    m("th.pa1.ba", "size"),
                ),
            ),
            m("tbody",
                m("tr",
                    m("td.pa1.ba", IntToStr(this.totalPlants)),
                    m("td.pa1.ba", IntToStr(this.totalParts)),
                    m("td.pa1.ba", IntToStr(this.totalPoints)),
                    m("td.pa1.ba", IntToStr(this.totalTriangles)),
                    m("td.pa1.ba", IntToStr(this.totalMaterials)),
                    m("td.pa1.ba", sizeAndUnit),
                ),
            ),
        )
        // TODO PDF: Use or remove: this.translatePlantsToWindowPositions.Visible = (this.totalPlants > 1)
    }
    
    estimateBytes(numPlants: long, numParts: long, numPoints: long, numTriangles: long): long {
        let result = 0
        switch (this.outputType) {
            case ExportFormats.kDXF:
                result = numPoints * 250
                break
            case ExportFormats.kPOV:
                result = numPlants * 25 + numParts * 25 + numTriangles * 150
                break
            case ExportFormats.k3DS:
                result = numPlants * 48 + numParts * 48 + numPoints * 24 + numTriangles * 24
                break
            case ExportFormats.kOBJ:
                result = numPlants * 100 + numParts * 100 + numPoints * 50 + numTriangles * 50
                break
            case ExportFormats.kVRML:
                result = numPlants * 100 + numParts * 100 + numPoints * 80 + numTriangles * 80
                break
            case ExportFormats.kLWO:
                result = numPlants * 600 + numParts * 100 + numPoints * 20 + numTriangles * 20
                break
            default:
                throw new Error("Problem: Invalid 3d export type for size estimation.")
                break
        }
        return result
    }
    
    fillPlantPartColors(): void {
        let i: short
        let firstPlant: PdPlant
        
        this.colorsByPlantPart.Clear()
        if ((domain === null) || (domain.plantManager === null) || (domain.plantManager.plants.length < 0)) {
            // use first plant to get DXF part type names - there must be at least one plant to bring up this form
            return
        }
        firstPlant = domain.plantManager.plants[0]
        if (firstPlant === null) {
            return
        }
        for (i = 0; i <= ExportPart.kExportPartLast; i++) {
            this.colorsByPlantPart.Items.Add(longNameForDXFPartType(i))
        }
    }
    
    colorsByPlantPartDrawItem(Control: TWinControl, index: int, Rect: TRect, State: TOwnerDrawState): void {
        let selected: boolean
        let colorRect: TRect
        let remainderRect: TRect
        let cText: string
        
        if ((this.colorsByPlantPart.Items.Count <= 0) || (index < 0) || (index > this.colorsByPlantPart.Items.Count - 1)) {
            return
        }
        selected = (delphi_compatability.TOwnerDrawStateType.odSelected in State)
        // set up rectangles 
        colorRect = Rect
        colorRect.Right = colorRect.Left + this.colorsByPlantPart.ItemHeight
        remainderRect = Rect
        remainderRect.Left = remainderRect.Left + this.colorsByPlantPart.ItemHeight
        // fill first box with white, rest with clHighlight if selected 
        this.colorsByPlantPart.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        this.colorsByPlantPart.Canvas.Brush.Color = u3dexport.dxfColors[this.options.dxf_plantPartColorIndexes[index]]
        this.colorsByPlantPart.Canvas.FillRect(colorRect)
        this.colorsByPlantPart.Canvas.Font = this.colorsByPlantPart.Font
        if (selected) {
            this.colorsByPlantPart.Canvas.Brush.Color = UNRESOLVED.clHighlight
            this.colorsByPlantPart.Canvas.Font.Color = UNRESOLVED.clHighlightText
        } else {
            this.colorsByPlantPart.Canvas.Brush.Color = delphi_compatability.clWindow
            this.colorsByPlantPart.Canvas.Font.Color = UNRESOLVED.clBtnText
        }
        this.colorsByPlantPart.Canvas.FillRect(remainderRect)
        cText = this.colorsByPlantPart[index]
        // margin for text 
        remainderRect.Left = remainderRect.Left + 5
        UNRESOLVED.winprocs.drawText(this.colorsByPlantPart.Canvas.Handle, cText, len(cText), remainderRect, delphi_compatability.DT_LEFT)
    }
    
    wholePlantColorMouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let colorForm: TChooseDXFColorForm
        let response: int
        
        colorForm = udxfclr.TChooseDXFColorForm().create(this)
        if (colorForm === null) {
            throw new Error("Problem: Could not create color window.")
        }
        try {
            colorForm.colorIndex = this.options.dxf_wholePlantColorIndex
            response = colorForm.ShowModal()
            if (response === mrOK) {
                this.options.dxf_wholePlantColorIndex = colorForm.colorIndex
                this.wholePlantColor.Color = dxfColors[this.options.dxf_wholePlantColorIndex]
                this.wholePlantColor.Invalidate()
                this.optionsChanged = true
            }
        } finally {
            colorForm.free
            colorForm = null
        }
    }
    
    setPlantPartColorClick(): void {
        let colorForm: TChooseDXFColorForm
        let response: int
        let firstColorIndex: TColorRef
        
        firstColorIndex = -1
        for (let i = 0; i < this.colorsByPlantPart.Items.Count; i++) {
            if (this.colorsByPlantPart.Selected[i]) {
                if (firstColorIndex === -1) {
                    firstColorIndex = this.options.dxf_plantPartColorIndexes[i]
                }
            }
        }
        if (firstColorIndex < 0) {
            return
        }
        colorForm = udxfclr.TChooseDXFColorForm().create(this)
        if (colorForm === null) {
            throw new Error("Problem: Could not create color window.")
        }
        try {
            colorForm.colorIndex = firstColorIndex
            response = colorForm.ShowModal()
            if (response === mrOK) {
                for (let i = 0; i < this.colorsByPlantPart.Items.Count; i++) {
                    if (this.colorsByPlantPart.Selected[i]) {
                        this.options.dxf_plantPartColorIndexes[i] = colorForm.colorIndex
                    }
                }
                this.colorsByPlantPart.Invalidate()
                this.optionsChanged = true
            }
        } finally {
            colorForm.free
            colorForm = null
        }
    }
    
    colorsByPlantPartDblClick(): void {
        this.setPlantPartColorClick()
    }
    
    transferRadioButton(radioButton: TRadioButton, value: short, radioIndex: short): void {
        if (this.transferDirection === kTransferLoad) {
            if (value === radioIndex) {
                radioButton.Checked = true
            }
        } else if (this.transferDirection === kTransferSave) {
            if ((radioButton.Checked) && (value !== radioIndex)) {
                this.optionsChanged = true
            }
            if (radioButton.Checked) {
                value = radioIndex
            }
        }
        return value
    }
    
    transferCheckBox(checkBox: TCheckBox, value: boolean): void {
        if (this.transferDirection === kTransferLoad) {
            checkBox.Checked = value
        } else if (this.transferDirection === kTransferSave) {
            if (value !== checkBox.Checked) {
                this.optionsChanged = true
            }
            value = checkBox.Checked
        }
        return value
    }
    
    transferColor(colorPanel: TPanel, value: TColorRef): void {
        unfinished()
        // TODO PDF: Fix this:
        // raise "method transferColor had assigned to var parameter value not added to return -- fixup manually"
        // if (this.transferDirection === kTransferLoad) {
        //     colorPanel.Color = value
        // } else if (this.transferDirection === kTransferSave) {
        //     if (value !== colorPanel.Color) {
        //         this.optionsChanged = true
        //     }
        //     value = colorPanel.Color
        // }
    }
    
    transferSmallintSpinEditBox(editBox: TSpinEdit, value: short): void {
        if (this.transferDirection === kTransferLoad) {
            editBox.Text = IntToStr(value)
        } else if (this.transferDirection === kTransferSave) {
            if (value !== StrToIntDef(editBox.Text, 0)) {
                this.optionsChanged = true
            }
            value = StrToIntDef(editBox.Text, 0)
        }
        return value
    }
    
    transferRadioGroup(radioGroup: TRadioGroup, value: short): void {
        if (this.transferDirection === kTransferLoad) {
            radioGroup.ItemIndex = value
        } else if (this.transferDirection === kTransferSave) {
            if (value !== radioGroup.ItemIndex) {
                this.optionsChanged = true
            }
            value = radioGroup.ItemIndex
        }
        return value
    }
    
    transferComboBox(comboBox: TComboBox, value: short): void {
        if (this.transferDirection === kTransferLoad) {
            comboBox.ItemIndex = value
        } else if (this.transferDirection === kTransferSave) {
            if (value !== comboBox.ItemIndex) {
                this.optionsChanged = true
            }
            value = comboBox.ItemIndex
        }
        return value
    }
    
    transferSingleEditBox(editBox: TEdit, value: float): void {
        let newValue: float
        
        if (this.transferDirection === kTransferLoad) {
            editBox.Text = valueString(value)
        } else if (this.transferDirection === kTransferSave) {
            try {
                newValue = StrToFloat(editBox.Text)
            } catch (e) {
                newValue = value
            }
            if (newValue !== value) {
                this.optionsChanged = true
            }
            value = newValue
        }
        return value
    }
    
    helpButtonClick(): void {
        HelpJump("Exporting_3D_models_in_general")
    }
    
    // TODO PDF: Fix or remove: makeEnterWorkAsTab
    // FormKeyPress(Key: char): void {
    //     Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
    //     return Key
    // }
    
    useSelectedPlantsClick(): void {
        this.useSelectedPlants = true
        this.useVisiblePlants = false
        this.useAllPlants = false
    }
    
    useVisiblePlantsClick(): void {
        this.useSelectedPlants = false
        this.useVisiblePlants = true
        this.useAllPlants = false
    }
    
    useAllPlantsClick(): void {
        this.useSelectedPlants = false
        this.useVisiblePlants = false
        this.useAllPlants = true
    }
    
    stemCylinderFacesChange(): void {
        let value: int
        
        value = StrToIntDef(this.stemCylinderFaces.Text, 5)
        if (value < kMinOutputCylinderFaces) {
            value = kMinOutputCylinderFaces
        }
        if (value > kMaxOutputCylinderFaces) {
            value = kMaxOutputCylinderFaces
        }
        this.stemCylinderFaces.Text = IntToStr(value)
    }
    
    dxfWriteColorsClick(): void {
        this.colorDXFFromRGB.Visible = this.dxfWriteColors.Checked
        this.colorDXFFromOneColor.Visible = this.dxfWriteColors.Checked
        this.wholePlantColor.Visible = this.dxfWriteColors.Checked
        this.colorDXFFromPlantPartType.Visible = this.dxfWriteColors.Checked
        this.colorsByPlantPart.Visible = this.dxfWriteColors.Checked
        this.setPlantPartColor.Visible = this.dxfWriteColors.Checked
    }

    oninit(vnode: any) {
        this.close = vnode.attrs.close
        this.outputType = vnode.attrs.outputType,
        this.options = JSON.parse(JSON.stringify(vnode.attrs.options))
        this.rearrangeItemsForOutputType()
    }
    
    view() {
        return m("div.Generic3DOptionsForm.TGeneric3DOptionsForm.h-100.overflow-auto",
            m("div.fs3.b", this.Caption),
            m("div.Group.Group.g00000004",
                m("div.TGroupBox.drawWhichPlantsGroupBox.TGroupBox",
                    "Include:",
                    m("div.Group.Group.g00000016.ml2",
                        m("label",
                            m("input[type=radio].mr1.useSelectedPlants.TRadioButton",
                                {
                                    onclick: () => this.useSelectedPlantsClick(),
                                    checked: this.useSelectedPlants
                                },
                            ),
                            caption("se&lected plants"),
                        ),
                        m("br"),
                        m("label",
                            m("input[type=radio].mr1.useVisiblePlants.TRadioButton",
                                {
                                    onclick: () => this.useVisiblePlantsClick(),
                                    checked: this.useVisiblePlants
                                },
                            ),
                            caption("&visible plants"),
                        ),
                        m("br"),
                        m("label",
                            m("input[type=radio].mr1.useAllPlants.TRadioButton",
                                {
                                    onclick: () => this.useAllPlantsClick(),
                                    checked: this.useAllPlants
                                },
                            ),
                            caption("&all plants"),
                        ),
                    ),
                    m("div.TStringGrid.estimationStringGrid.TStringGrid.mt1.mb1",
                        this.predictedSizeView()
                    ),
                ),
            ),
            m("div.TRadioGroup.layeringOption.TRadioGroup",
                {
                    // Top: "81",
                    // Left: "4",
                    // Height: "75",
                    // Width: "280",
                    // Ctl3D: "True",
                    // ItemIndex: "0",
                    // Items.Strings: ["&whole plant","&type of plant part","individual plant &part"],
                    // ParentCtl3D: "False",
                    // TabOrder: "5",
                },
                " Group by ",
            ),
            m("div.TGroupBox.dxfColorsGroupBox.TGroupBox",
                {
                    // Top: "91",
                    // Left: "290",
                    // Height: "152",
                    // Width: "280",
                    // TabOrder: "2",
                    // Visible: "False",
                },
                " Colors ",
                m("label.checkbox-inline.dxfWriteColors.TCheckBox", m("input[type=checkbox]",
                    {
                        onclick: () => this.dxfWriteColorsClick(),
                        // Top: "16",
                        // Left: "10",
                        // Height: "17",
                        // Width: "101",
                        // TabOrder: "6",
                    },),
                    caption("Write &colors"),
                ),
                m("input[type=radio].colorDXFFromRGB.TRadioButton",
                    {
                        // Top: "35",
                        // Left: "9",
                        // Height: "17",
                        // Width: "232",
                        // TabOrder: "0",
                    },
                    caption("use front-face &RGB colors"),
                ),
                m("div.Group.Group.g00000056",
                    m("input[type=radio].colorDXFFromOneColor.TRadioButton",
                        {
                            // Top: "56",
                            // Left: "9",
                            // Height: "15",
                            // Width: "244",
                            // TabOrder: "1",
                        },
                        caption("use this o&ne color         for all plant parts"),
                    ),
                    m("div.wholePlantColor.TPanel",
                        {
                            // Top: "56",
                            // Left: "119",
                            // Height: "14",
                            // Width: "16",
                            // BevelInner: "bvLowered",
                            // BevelOuter: "bvLowered",
                            // TabOrder: "2",
                            // OnMouseUp: "wholePlantColorMouseUp",
                        },
                    ),
                ),
                m("button.setPlantPartColor.TButton",
                    {
                        onclick: () => this.setPlantPartColorClick(),
                        // Top: "71",
                        // Left: "221",
                        // Height: "22",
                        // Width: "53",
                        // TabOrder: "5",
                    },
                    caption("&Set..."),
                ),
                m("input[type=radio].colorDXFFromPlantPartType.TRadioButton",
                    {
                        // Top: "77",
                        // Left: "9",
                        // Height: "15",
                        // Width: "182",
                        // TabOrder: "3",
                    },
                    caption("use colors &based on type of part"),
                ),
                m("div.TListBox.colorsByPlantPart.TListBox",
                    {
                        // Top: "95",
                        // Left: "27",
                        // Height: "52",
                        // Width: "247",
                        // ItemHeight: "16",
                        // Items.Strings: ["Meristems","Internodes","Leaves","First leaves","Flowers (F)","Flowers (M)","Inflor. (F)","Inflor. (M)","Fruit","Root top"],
                        // MultiSelect: "True",
                        // Style: "lbOwnerDrawFixed",
                        // TabOrder: "4",
                        // OnDblClick: "colorsByPlantPartDblClick",
                        // OnDrawItem: "colorsByPlantPartDrawItem",
                    },
                ),
            ),
            m("div.TGroupBox.reorientGroupBox.TGroupBox",
                {
                    // Top: "158",
                    // Left: "4",
                    // Height: "70",
                    // Width: "281",
                    // TabOrder: "9",
                },
                " Reorient ",
                m("TSpinEdit.xRotationBeforeDraw.TSpinEdit",
                    {
                        // Top: "15",
                        // Left: "62",
                        // Height: "23",
                        // Width: "57",
                        // Increment: "5",
                        // MaxValue: "180",
                        // MinValue: "-180",
                        // TabOrder: "0",
                        // Value: "0",
                    },
                ),
                m("div.Group.Group.g00000019",
                    m("div.Label1.TLabel",
                        {
                            // Top: "19",
                            // Left: "10",
                            // Height: "14",
                            // Width: "46",
                        },
                        "Rotate by",
                    ),
                    m("div.Label10.TLabel",
                        {
                            // Top: "19",
                            // Left: "124",
                            // Height: "14",
                            // Width: "106",
                        },
                        "degrees (-180 to 180)",
                    ),
                ),
                m("TSpinEdit.overallScalingFactor_pct.TSpinEdit",
                    {
                        // Top: "41",
                        // Left: "62",
                        // Height: "23",
                        // Width: "57",
                        // Increment: "5",
                        // MaxValue: "10000",
                        // MinValue: "1",
                        // TabOrder: "1",
                        // Value: "10000",
                    },
                ),
                m("div.Group.Group.g00000045",
                    m("div.Label7.TLabel",
                        {
                            // Top: "45",
                            // Left: "10",
                            // Height: "14",
                            // Width: "42",
                        },
                        "Scale by",
                    ),
                    m("div.Label9.TLabel",
                        {
                            // Top: "45",
                            // Left: "124",
                            // Height: "14",
                            // Width: "91",
                        },
                        "percent (1-10,000)",
                    ),
                ),
            ),
            m("div.TGroupBox.otherGroupBox.TGroupBox",
                {
                    // Top: "232",
                    // Left: "4",
                    // Height: "175",
                    // Width: "280",
                    // TabOrder: "1",
                },
                " Other options ",
                m("div.plantNameAndCylinderSidesPanel.TPanel",
                    {
                        // Top: "16",
                        // Left: "6",
                        // Height: "56",
                        // Width: "261",
                        // BevelOuter: "bvNone",
                        // TabOrder: "2",
                    },
                    m("TSpinEdit.lengthOfShortName.TSpinEdit",
                        {
                            // Top: "3",
                            // Left: "99",
                            // Height: "23",
                            // Width: "45",
                            // MaxValue: "60",
                            // MinValue: "1",
                            // TabOrder: "0",
                            // Value: "3",
                        },
                    ),
                    m("div.Group.Group.g00000007",
                        m("div.Label2.TLabel",
                            {
                                // Top: "7",
                                // Left: "5",
                                // Height: "14",
                                // Width: "88",
                                // FocusControl: "stemCylinderFaces",
                            },
                            caption("Limit plant &name to"),
                        ),
                        m("div.Label3.TLabel",
                            {
                                // Top: "7",
                                // Left: "151",
                                // Height: "14",
                                // Width: "86",
                            },
                            "characters (1-60)",
                        ),
                    ),
                    m("TSpinEdit.stemCylinderFaces.TSpinEdit",
                        {
                            // Top: "30",
                            // Left: "153",
                            // Height: "23",
                            // Width: "45",
                            // MaxValue: "20",
                            // MinValue: "3",
                            // TabOrder: "1",
                            // Value: "3",
                            // OnChange: "stemCylinderFacesChange",
                        },
                    ),
                    m("div.Group.Group.g00000035",
                        m("div.stemCylinderFacesLabel.TLabel",
                            {
                                // Top: "35",
                                // Left: "5",
                                // Height: "14",
                                // Width: "145",
                                // FocusControl: "stemCylinderFaces",
                            },
                            caption("Draw stems as c&ylinders with"),
                        ),
                        m("div.sidesLabel.TLabel",
                            {
                                // Top: "35",
                                // Left: "200",
                                // Height: "14",
                                // Width: "59",
                            },
                            "sides (3-20)",
                        ),
                    ),
                ),
                m("div.pressPlantsPanel.TPanel",
                    {
                        // Top: "69",
                        // Left: "2",
                        // Height: "28",
                        // Width: "273",
                        // BevelOuter: "bvNone",
                        // TabOrder: "4",
                    },
                    m("select.directionToPressPlants.TComboBox",
                        {
                            // Top: "3",
                            // Left: "108",
                            // Height: "22",
                            // Width: "41",
                            // Style: "csDropDownList",
                            // ItemHeight: "14",
                            // Items.Strings: ["x","y","z"],
                            // TabOrder: "1",
                        },
                    ),
                    m("label.checkbox-inline.pressPlants.TCheckBox", m("input[type=checkbox]",
                        {
                            // Top: "8",
                            // Left: "8",
                            // Height: "17",
                            // Width: "99",
                            // TabOrder: "0",
                        },),
                        caption("\"Pr&ess\" plants in"),
                    ),
                    m("div.Label8.TLabel",
                        {
                            // Top: "11",
                            // Left: "154",
                            // Height: "14",
                            // Width: "48",
                        },
                        "dimension",
                    ),
                ),
                m("label.checkbox-inline.writePlantNumberInFrontOfName.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "96",
                        // Left: "10",
                        // Height: "17",
                        // Width: "219",
                        // TabOrder: "3",
                    },),
                    caption("Write plant n&umber in front of name"),
                ),
                m("label.checkbox-inline.writeColors.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "115",
                        // Left: "10",
                        // Height: "17",
                        // Width: "101",
                        // TabOrder: "1",
                    },),
                    caption("Write &colors"),
                ),
                m("label.checkbox-inline.makeTrianglesDoubleSided.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "133",
                        // Left: "10",
                        // Height: "17",
                        // Width: "181",
                        // TabOrder: "5",
                    },),
                    caption("&Double polygons on 3D objects"),
                ),
                m("label.checkbox-inline.translatePlantsToWindowPositions.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "151",
                        // Left: "10",
                        // Height: "17",
                        // Width: "245",
                        // TabOrder: "0",
                    },),
                    caption("&Translate plants to match window positions"),
                ),
            ),
            m("div.TGroupBox.nestingGroupBox.TGroupBox",
                {
                    // Top: "246",
                    // Left: "290",
                    // Height: "100",
                    // Width: "280",
                    // TabOrder: "4",
                    // Visible: "False",
                },
                " Nest ",
                m("div.Group.Group.g00000018",
                    m("label.checkbox-inline.nestLeafAndPetiole.TCheckBox", m("input[type=checkbox]",
                        {
                            // Top: "18",
                            // Left: "17",
                            // Height: "17",
                            // Width: "122",
                            // TabOrder: "0",
                        },),
                        caption("leaves with &petioles"),
                    ),
                    m("label.checkbox-inline.nestPedicelAndFlowerFruit.TCheckBox", m("input[type=checkbox]",
                        {
                            // Top: "18",
                            // Left: "142",
                            // Height: "17",
                            // Width: "130",
                            // TabOrder: "3",
                        },),
                        caption("&flowers with pedicels"),
                    ),
                ),
                m("label.checkbox-inline.nestFloralLayers.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "36",
                        // Left: "142",
                        // Height: "17",
                        // Width: "118",
                        // TabOrder: "4",
                    },),
                    caption("pistils and sta&mens"),
                ),
                m("label.checkbox-inline.nestCompoundLeaf.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "37",
                        // Left: "17",
                        // Height: "17",
                        // Width: "119",
                        // TabOrder: "1",
                    },),
                    caption("&compound leaves"),
                ),
                m("label.checkbox-inline.nestInflorescence.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "55",
                        // Left: "17",
                        // Height: "17",
                        // Width: "97",
                        // TabOrder: "2",
                    },),
                    caption("&inflorescences"),
                ),
                m("label.checkbox-inline.commentOutUnionAtEnd.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "77",
                        // Left: "17",
                        // Height: "18",
                        // Width: "207",
                        // TabOrder: "5",
                    },),
                    caption("Comment out &union of plants at end"),
                ),
            ),
            m("div.TRadioGroup.vrmlVersionRadioGroup.TRadioGroup",
                {
                    // Top: "351",
                    // Left: "290",
                    // Height: "38",
                    // Width: "280",
                    // Columns: "2",
                    // Ctl3D: "True",
                    // ItemIndex: "1",
                    // Items.Strings: ["VRML &1.0","VRML &2.0 (VRML 97)"],
                    // ParentCtl3D: "False",
                    // TabOrder: "10",
                    // Visible: "False",
                },
                " Version ",
            ),
            m("div.threeDSWarningPanel.TPanel",
                {
                    // Top: "394",
                    // Left: "290",
                    // Height: "52",
                    // Width: "280",
                    // BevelInner: "bvRaised",
                    // BevelOuter: "bvLowered",
                    // TabOrder: "8",
                    // Visible: "False",
                },
                m("div.Label6.TLabel",
                    {
                        // Top: "4",
                        // Left: "7",
                        // Height: "42",
                        // Width: "265",
                        // Font.Charset: "DEFAULT_CHARSET",
                        // Font.Color: "clBlue",
                        // Font.Height: "-11",
                        // Font.Name: "Arial",
                        // Font.Style: "[]",
                        // ParentFont: "False",
                        // WordWrap: "True",
                    },
                    "Note: This version of the 3DS export function does not import equally well to all 3D programs. See the help system for tips on improving 3DS compatibility.",
                ),
            ),
            m("div.TGroupBox.povLimitsGroupBox.TGroupBox",
                {
                    // Top: "449",
                    // Left: "290",
                    // Height: "74",
                    // Width: "280",
                    // TabOrder: "3",
                    // Visible: "False",
                },
                " Limit small lines and 3D objects ",
                m("input.minLineLengthToWrite.TEdit",
                    {
                        // Top: "19",
                        // Left: "17",
                        // Height: "22",
                        // Width: "51",
                        // TabOrder: "0",
                    },
                ),
                m("div.Label4.TLabel",
                    {
                        // Top: "23",
                        // Left: "72",
                        // Height: "14",
                        // Width: "158",
                        // FocusControl: "minLineLengthToWrite",
                    },
                    caption("&Keep lines at least this long (mm)"),
                ),
                m("input.minTdoScaleToWrite.TEdit",
                    {
                        // Top: "45",
                        // Left: "17",
                        // Height: "22",
                        // Width: "51",
                        // TabOrder: "1",
                    },
                ),
                m("div.Label5.TLabel",
                    {
                        // Top: "49",
                        // Left: "72",
                        // Height: "14",
                        // Width: "179",
                        // FocusControl: "minTdoScaleToWrite",
                    },
                    caption("Keep &3D objects of at least this scale"),
                ),
            ),
            m("div.button",
                m("button.Close.TButton",
                    {
                        onclick: () => this.CloseClick(),
                    },
                    caption("&Save"),
                ),
                m("button.cancel.TButton.ml2",
                    {
                        onclick: () => this.cancelClick(),
                    },
                    caption("&Cancel"),
                ),
                m("button.helpButton.TSpeedButton.ml2",
                    {
                        onclick: () => this.helpButtonClick(),
                    },
                    m("img.mr1", { src: imageDir + "Generic_helpButton.png" }),
                    caption("&Help"),
                ),
            ),
        )
    }
}

