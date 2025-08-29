// unit uoptions3dexport

import * as m from "mithril"
import { caption, ffFixed, float, FloatToStrF, HelpJump, imageDir, int, intround, IntToStr, long, MessageDialog, mtConfirmation, short, StrToFloat, StrToFloatRange, StrToIntDef, StrToIntRange, StrToIntRangeDef, TColorRef } from "./common"
import { domain, kIncludeAllPlants, kIncludeSelectedPlants, kIncludeVisiblePlants, kMaxOutputCylinderFaces, kMinOutputCylinderFaces } from "./PdDomain"
import { dxfColors, ExportFormats, ExportPart, FileExport3DOptionsStructure, kColorDXFFromOneColor, kColorDXFFromPlantPartType, kColorDXFFromRGB, kMax3DFaces, kMax3DPoints, kMaxStoredMaterials, longNameForDXFPartType } from "./U3dexport"
import { chr } from "./usupport"
import { MainForm } from "./FormHolder"
import { convertColorNumberToCSS } from "./KfDrawingSurface"

const kTransferLoad = 1
const kTransferSave = 2

const colorsByPlantPartNames = ["Meristems", "Internodes", "Leaves", "First leaves", "Flowers (F)", "Flowers (M)", "Inflor. (F)", "Inflor. (M)", "Fruit", "Root top"]

type PlantPartWrapper = {
    name: string
    selected: boolean
}

export class TGeneric3DOptionsForm {
    // drawWhichPlantsGroupBox: TGroupBox = new TGroupBox()
    useSelectedPlants: boolean = true
    useVisiblePlants: boolean = false
    useAllPlants: boolean = false
    // otherGroupBox: TGroupBox = new TGroupBox()
    // translatePlantsToWindowPositions: TCheckBox = new TCheckBox()
    // colorDXFFromRGB: TRadioButton = new TRadioButton()
    // colorDXFFromOneColor: TRadioButton = new TRadioButton()
    // wholePlantColor: TPanel = new TPanel()
    // colorDXFFromPlantPartType: TRadioButton = new TRadioButton()
    colorsByPlantPart: PlantPartWrapper[] = []
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
    directionToPressPlants_Selected = "x"
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
            const oldExportType = this.options.exportType
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
        
        // options for specific types
        // do after general one to override
        switch (this.outputType) {
            case ExportFormats.kDXF:
                this.options.writeColors = this.transferCheckBox(this.dxfWriteColors, this.options.writeColors)
                if (this.transferDirection === kTransferLoad) {
                    this.dxfWriteColorsClick(this)
                }
                this.options.dxf_whereToGetColors = this.transferRadioButton(this.colorDXFFromRGB, this.options.dxf_whereToGetColors, kColorDXFFromRGB)
                this.options.dxf_whereToGetColors = this.transferRadioButton(this.colorDXFFromOneColor, this.options.dxf_whereToGetColors, kColorDXFFromOneColor)
                this.options.dxf_whereToGetColors = this.transferRadioButton(this.colorDXFFromPlantPartType, this.options.dxf_whereToGetColors, kColorDXFFromPlantPartType)
                this.wholePlantColor.Color = u3dexport.dxfColors[this.options.dxf_wholePlantColorIndex]
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
                // nothing yet
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
        this.colorsByPlantPart.length = 0
        if ((domain === null) || (domain.plantManager === null) || (domain.plantManager.plants.length < 0)) {
            // use first plant to get DXF part type names - there must be at least one plant to bring up this form
            return
        }
        const firstPlant = domain.plantManager.plants[0]
        if (firstPlant === null) {
            return
        }
        for (let i = 0; i <= ExportPart.kExportPartLast; i++) {
            this.colorsByPlantPart.push({name: longNameForDXFPartType(i), selected: false})
        }
    }
    
    colorsByPlantPartView() {
        // TODO PDF: Fix next part added for testing
        for (let i = 0; i < this.options.dxf_plantPartColorIndexes.length; i++) {
            this.options.dxf_plantPartColorIndexes[i] = i % dxfColors.length
        }

        return m("div",
            this.colorsByPlantPart.map((wrapper, index) => m("div",
                m("input[type=checkbox].mr1", {
                    checked: wrapper.selected,
                    onchange: (event: any) => wrapper.selected = event.target.checked
                }),
                m("div.dib.mr1", { style: { 
                    width: "1rem", 
                    height: "1rem", 
                    backgroundColor: convertColorNumberToCSS(dxfColors[this.options.dxf_plantPartColorIndexes[index]])
                }}), 
                wrapper.name)
            )
        )
    }
    
    wholePlantColorMouseUp(): void {
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
        let firstColorIndex: TColorRef = -1

        for (let i = 0; i < this.colorsByPlantPart.length; i++) {
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
            const response = colorForm.ShowModal()
            if (response === mrOK) {
                for (let i = 0; i < this.colorsByPlantPart.length; i++) {
                    if (this.colorsByPlantPart.Selected[i]) {
                        this.options.dxf_plantPartColorIndexes[i] = colorForm.colorIndex
                    }
                }
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
    
    helpButtonClick(): void {
        // HelpJump("Exporting_3D_models_in_general")
        HelpJump("Exporting_to_DXF")
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
    
    dxfWriteColorsClick(event: any): void {
        this.options.writeColors = event.target.checked
    }

    oninit(vnode: any) {
        this.close = vnode.attrs.close
        this.outputType = vnode.attrs.outputType,
        this.options = JSON.parse(JSON.stringify(vnode.attrs.options))
        this.fillPlantPartColors()
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
            this.outputType === ExportFormats.kDXF && m("div.TGroupBox.dxfColorsGroupBox.TGroupBox",
                "Colors",
                m("br"),
                m("label.checkbox-inline.dxfWriteColors.TCheckBox.ml2", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.writeColors,
                        onchange: (event: any) => this.dxfWriteColorsClick(event)
                    }),
                    caption("Write &colors"),
                ),
                m("br"),
                this.options.writeColors && m("div.dxfWriteColorsPanel",
                    m("label.ml2",
                        m("input[type=radio].mr1.colorDXFFromRGB.TRadioButton",
                            {
                                onclick: () => this.options.dxf_whereToGetColors = kColorDXFFromRGB,
                                checked: this.options.dxf_whereToGetColors === kColorDXFFromRGB
                            },
                        ),
                        caption("use front-face &RGB colors"),
                    ),
                    m("br"),
                    m("div.Group.Group.g00000056.ml2",
                        m("label",
                            m("input[type=radio].mr1.colorDXFFromOneColor.TRadioButton",
                                {
                                    onclick: () => this.options.dxf_whereToGetColors = kColorDXFFromOneColor,
                                    checked: this.options.dxf_whereToGetColors === kColorDXFFromOneColor
                                }
                            ),
                            caption("use this o&ne color for all plant parts"),
                        ),
                        m("div.wholePlantColor.dib.TPanel.ml2",
                            {
                                onclick: () => this.wholePlantColorMouseUp(),
                                style: {
                                    width: "16px",
                                    height: "14px",
                                    backgroundColor: convertColorNumberToCSS(dxfColors[this.options.dxf_wholePlantColorIndex])
                                }
                            },
                        ),
                        m("button.setPlantPartColor.TButton.ml1",
                            {
                                onclick: () => this.setPlantPartColorClick(),
                            },
                            caption("&Set..."),
                        ),
                    ),
                    m("label.ml2",
                        m("input[type=radio].mr1.colorDXFFromPlantPartType.TRadioButton",
                            {
                                onclick: () => this.options.dxf_whereToGetColors = kColorDXFFromPlantPartType,
                                checked: this.options.dxf_whereToGetColors === kColorDXFFromPlantPartType
                            },
                        ),
                        caption("use colors &based on type of part"),
                    ),
                    m("div.TListBox.colorsByPlantPart.TListBox.ml4",
                        {
                            // OnDblClick: "colorsByPlantPartDblClick",
                        },
                        this.colorsByPlantPartView()
                    ),
                )
            ),
            m("div.TGroupBox.reorientGroupBox.TGroupBox",
                "Reorient",
                m("br"),
                m("label.Group.Group.g00000019.ml2",
                    m("span.Label1.TLabel",
                        "Rotate by",
                    ),
                    m("input[type=number].mw3.TSpinEdit.xRotationBeforeDraw.ml1.mr1",
                        {
                            value: IntToStr(this.options.xRotationBeforeDraw),
                            onchange: (event: any) => this.options.xRotationBeforeDraw = StrToIntRange(event.target.value, -180, 180),
                            step: 5,
                            min: "-180",
                            max: "180"
                        },
                    ),
                    m("span.Label10.TLabel",
                        "degrees (-180 to 180)",
                    ),
                ),
                m("br"),
                m("label.Group.Group.g00000045.ml2",
                    m("span.Label7.TLabel",
                        "Scale by",
                    ),
                    m("input[type=number].mw3.TSpinEdit.overallScalingFactor_pct.ml1.mr1",
                        {
                            value: IntToStr(this.options.overallScalingFactor_pct),
                            onchange: (event: any) => this.options.overallScalingFactor_pct = StrToIntRange(event.target.value, 1, 10000),
                            step: 5,
                            min: "1",
                            max: "10000"
                        },
                    ),
                    m("span.Label9.TLabel",
                        "percent (1-10,000)",
                    ),
                ),
            ),
            m("div.TGroupBox.otherGroupBox.TGroupBox",
                "Other options",
                m("div.plantNameAndCylinderSidesPanel.TPanel.ml2",
                    m("label.Group.Group.g00000007",
                        m("span.Label2.TLabel",
                            caption("Limit plant &name to"),
                        ),
                        m("input[type=number].mw3.TSpinEdit.lengthOfShortName.ml1.mr1",
                            {
                                onchange: (event: any) => this.options.lengthOfShortName = StrToIntRange(event.target.value, 1, 60),
                                value: IntToStr(this.options.lengthOfShortName),
                                step: 1,
                                min: "1",
                                max: "60"
                            },
                        ),
                        m("span.Label3.TLabel",
                            "characters (1-60)",
                        ),
                    ),
                    m("br"),
                    m("label.Group.Group.g00000035",
                        m("span.stemCylinderFacesLabel.TLabel",
                            caption("Draw stems as c&ylinders with"),
                        ),
                        m("input[type=number].mw3.TSpinEdit.stemCylinderFaces.ml1.mr1",
                            {
                                value: IntToStr(this.options.stemCylinderFaces),
                                onchange: (event: any) => this.options.stemCylinderFaces = StrToIntRangeDef(event.target.value, kMinOutputCylinderFaces, kMaxOutputCylinderFaces, 5),
                                step: 1,
                                min: "" + kMinOutputCylinderFaces,
                                max: "" + kMaxOutputCylinderFaces
                            },
                        ),
                        m("span.sidesLabel.TLabel",
                            "sides (" + kMinOutputCylinderFaces + "-" + kMaxOutputCylinderFaces + ")",
                        ),
                    ),
                ),
                m("div.pressPlantsPanel.TPanel",
                    m("label.checkbox-inline.pressPlants.TCheckBox", m("input[type=checkbox].mr1",
                        {
                            checked: this.options.pressPlants,
                            onchange: (event: any) => this.options.pressPlants = event.target.checked
                        }),
                        caption("\"Pr&ess\" plants in"),
                    ),
                    m("label.Label8.TLabel",
                        m("select.directionToPressPlants.TComboBox.ml1.mr1",
                            {
                                onchange: (event: any) => this.directionToPressPlants_Selected = event.target.value,
                            },
                            ["x","y","z"].map(xyz => m("option", {
                                value: xyz,
                                selected: xyz === this.directionToPressPlants_Selected ? "selected" : "",
                            }, xyz))
                        ),
                        "dimension",
                    ),
                ),
                m("label.checkbox-inline.writePlantNumberInFrontOfName.TCheckBox", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.writePlantNumberInFrontOfName,
                        onchange: (event: any) => this.options.writePlantNumberInFrontOfName = event.target.checked
                    }),
                    caption("Write plant n&umber in front of name"),
                ),
                m("br"),
                m("label.checkbox-inline.writeColors.TCheckBox", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.writeColors,
                        onchange: (event: any) => this.options.writeColors = event.target.checked
                    },),
                    caption("Write &colors"),
                ),
                m("br"),
                m("label.checkbox-inline.makeTrianglesDoubleSided.TCheckBox", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.makeTrianglesDoubleSided,
                        onchange: (event: any) => this.options.makeTrianglesDoubleSided = event.target.any
                    }),
                    caption("&Double polygons on 3D objects"),
                ),
                m("br"),
                m("label.checkbox-inline.translatePlantsToWindowPositions.TCheckBox", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.translatePlantsToWindowPositions,
                        onchange: (event: any) => this.options.translatePlantsToWindowPositions = event.target.checked
                    }),
                    caption("&Translate plants to match window positions"),
                ),
            ),
            (this.outputType === ExportFormats.kPOV || this.outputType === ExportFormats.kVRML) && m("div.TGroupBox.nestingGroupBox.TGroupBox",
                "Nest",
                m("div.Group.Group.g00000018.ml2",
                    m("label.checkbox-inline.nestLeafAndPetiole.TCheckBox", m("input[type=checkbox].mr1",
                        {
                            checked: this.options.nest_LeafAndPetiole,
                            onchange: (event: any) => this.options.nest_LeafAndPetiole = event.target.checked
                        }),
                        caption("leaves with &petioles"),
                    ),
                    m("br"),
                    m("label.checkbox-inline.nestPedicelAndFlowerFruit.TCheckBox", m("input[type=checkbox].mr1",
                        {
                            checked: this.options.nest_PedicelAndFlowerFruit,
                            onchange: (event: any) => this.options.nest_PedicelAndFlowerFruit = event.target.checked
                        }),
                        caption("&flowers with pedicels"),
                    ),
                ),
                m("label.checkbox-inline.nestFloralLayers.TCheckBox.ml2", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.nest_FloralLayers,
                        onchange: (event: any) => this.options.nest_FloralLayers = event.target.checked
                    }),
                    caption("pistils and sta&mens"),
                ),
                m("br"),
                m("label.checkbox-inline.nestCompoundLeaf.TCheckBox.ml2", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.nest_CompoundLeaf,
                        onchange: (event: any) => this.options.nest_CompoundLeaf = event.target.checked
                    }),
                    caption("&compound leaves"),
                ),
                m("br"),
                m("label.checkbox-inline.nestInflorescence.TCheckBox.ml2", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.nest_Inflorescence,
                        onchange: (event: any) => this.options.nest_Inflorescence = event.target.checked
                    }),
                    caption("&inflorescences"),
                ),
                m("br"),
                m("label.checkbox-inline.commentOutUnionAtEnd.TCheckBox", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.pov_commentOutUnionAtEnd,
                        onchange: (event: any) => this.options.pov_commentOutUnionAtEnd = event.target.checked
                    }),
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
                "Version",
            ),
            this.outputType === ExportFormats.k3DS && m("div.threeDSWarningPanel.TPanel",
                m("div.Label6.TLabel",
                    "Note: This version of the 3DS export function does not import equally well to all 3D programs. See the help system for tips on improving 3DS compatibility.",
                ),
            ),
            this.outputType === ExportFormats.kPOV && m("div.TGroupBox.povLimitsGroupBox.TGroupBox",
                "Limit small lines and 3D objects",
                m("br"),
                m("label.Label4.TLabel.ml2",
                    caption("&Keep lines at least this long (0-100 mm)"),
                    m("br"),
                    m("input.minLineLengthToWrite.TEdit.ml2.mw3",
                        {
                            value: IntToStr(this.options.pov_minLineLengthToWrite),
                            onchange: (event: any) => this.options.pov_minLineLengthToWrite = StrToIntRange(event.target.value, 0, 1000),
                            step: 1,
                            min: "0",
                            max: "100",
                        },
                    ),
                ),
                m("br"),
                m("label.Label5.TLabel.ml2",
                    caption("Keep &3D objects of at least this scale (0-100)"),
                    m("br"),
                    m("input.minTdoScaleToWrite.TEdit.ml2.mw3",
                        {
                            value: IntToStr(this.options.pov_minTdoScaleToWrite),
                            onchange: (event: any) => this.options.pov_minTdoScaleToWrite = StrToFloatRange(event.target.value, 0, 100),
                            step: 1,
                            min: "0",
                            max: "100",
                        },
                    ),
                ),
            ),
            m("div.button.mt2",
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

