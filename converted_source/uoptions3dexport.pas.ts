// unit uoptions3dexport

from conversion_common import *
import uplant
import umain
import udomain
import udxfclr
import usupport
import updform
import u3dexport
import uturtle
import delphi_compatability

// const
const kTransferLoad = 1
const kTransferSave = 2



export class TGeneric3DOptionsForm {
    drawWhichPlantsGroupBox: TGroupBox = new TGroupBox()
    useSelectedPlants: TRadioButton = new TRadioButton()
    useVisiblePlants: TRadioButton = new TRadioButton()
    useAllPlants: TRadioButton = new TRadioButton()
    otherGroupBox: TGroupBox = new TGroupBox()
    translatePlantsToWindowPositions: TCheckBox = new TCheckBox()
    dxfColorsGroupBox: TGroupBox = new TGroupBox()
    colorDXFFromRGB: TRadioButton = new TRadioButton()
    colorDXFFromOneColor: TRadioButton = new TRadioButton()
    wholePlantColor: TPanel = new TPanel()
    colorDXFFromPlantPartType: TRadioButton = new TRadioButton()
    colorsByPlantPart: TListBox = new TListBox()
    setPlantPartColor: TButton = new TButton()
    povLimitsGroupBox: TGroupBox = new TGroupBox()
    Label4: TLabel = new TLabel()
    Label5: TLabel = new TLabel()
    minLineLengthToWrite: TEdit = new TEdit()
    minTdoScaleToWrite: TEdit = new TEdit()
    nestingGroupBox: TGroupBox = new TGroupBox()
    nestLeafAndPetiole: TCheckBox = new TCheckBox()
    nestCompoundLeaf: TCheckBox = new TCheckBox()
    nestInflorescence: TCheckBox = new TCheckBox()
    nestPedicelAndFlowerFruit: TCheckBox = new TCheckBox()
    nestFloralLayers: TCheckBox = new TCheckBox()
    commentOutUnionAtEnd: TCheckBox = new TCheckBox()
    layeringOption: TRadioGroup = new TRadioGroup()
    writeColors: TCheckBox = new TCheckBox()
    Close: TButton = new TButton()
    cancel: TButton = new TButton()
    helpButton: TSpeedButton = new TSpeedButton()
    threeDSWarningPanel: TPanel = new TPanel()
    Label6: TLabel = new TLabel()
    plantNameAndCylinderSidesPanel: TPanel = new TPanel()
    Label2: TLabel = new TLabel()
    Label3: TLabel = new TLabel()
    stemCylinderFacesLabel: TLabel = new TLabel()
    sidesLabel: TLabel = new TLabel()
    lengthOfShortName: TSpinEdit = new TSpinEdit()
    stemCylinderFaces: TSpinEdit = new TSpinEdit()
    dxfWriteColors: TCheckBox = new TCheckBox()
    reorientGroupBox: TGroupBox = new TGroupBox()
    xRotationBeforeDraw: TSpinEdit = new TSpinEdit()
    writePlantNumberInFrontOfName: TCheckBox = new TCheckBox()
    vrmlVersionRadioGroup: TRadioGroup = new TRadioGroup()
    Label10: TLabel = new TLabel()
    Label1: TLabel = new TLabel()
    overallScalingFactor_pct: TSpinEdit = new TSpinEdit()
    Label9: TLabel = new TLabel()
    Label7: TLabel = new TLabel()
    estimationStringGrid: TStringGrid = new TStringGrid()
    pressPlantsPanel: TPanel = new TPanel()
    pressPlants: TCheckBox = new TCheckBox()
    directionToPressPlants: TComboBox = new TComboBox()
    Label8: TLabel = new TLabel()
    makeTrianglesDoubleSided: TCheckBox = new TCheckBox()
    outputType: short = 0
    transferDirection: short = 0
    options: FileExport3DOptionsStructure = new FileExport3DOptionsStructure()
    optionsChanged: boolean = false
    totalPlants: long = 0
    totalParts: long = 0
    totalPoints: long = 0
    totalTriangles: long = 0
    totalMaterials: long = 0
    TGeneric3DOptionsForm.prototype = new PdForm()
    TGeneric3DOptionsForm.prototype.constructor = TGeneric3DOptionsForm
    
    //$R *.DFM
    FormActivate(Sender: TObject): void {
        // outputType must be set before this is called
        this.transferDirection = kTransferLoad
        if (this.outputType === u3dexport.kDXF) {
            this.fillPlantPartColors()
        }
        this.transferFields()
        this.updatePredictedSizeDisplay()
    }
    
    CloseClick(Sender: TObject): void {
        if ((this.useSelectedPlants.Checked) && (umain.MainForm.selectedPlants.Count <= 0)) {
            // do not let them complete action if no plants are selected
            MessageDialog("You chose \"selected\" for \"Draw which plants\", but no plants are selected." + chr(13) + "You should make another choice, or click Cancel and select some plants.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
            return
        }
        if (this.outputType === u3dexport.kLWO) {
            if ((this.totalPoints > u3dexport.kMax3DPoints) || (this.totalTriangles > u3dexport.kMax3DFaces)) {
                // do not let them complete action if too many points are selected - only for LWO which holds ALL
                // points and faces until the end of the file
                MessageDialog("You have selected too many points or triangles for this file format." + chr(13) + "A maximum of 65,536 points or triangles can be exported to one LWO file." + chr(13) + chr(13) + "You should make another choice of plants, or click Cancel and select fewer plants," + chr(13) + "or export to another format.", mtWarning, {mbOK, }, 0)
                return
            }
        }
        switch (this.outputType) {
            case u3dexport.kOBJ:
                if ((this.totalPlants * (u3dexport.kExportPartLast + 1) > u3dexport.kMaxStoredMaterials)) {
                    if (MessageDialog("You have selected too many materials for this file format." + chr(13) + "The number of distinct colors will be bounded at " + IntToStr(u3dexport.kMaxStoredMaterials) + "." + chr(13) + "Some plants may refer to non-existent colors." + chr(13) + chr(13) + "To proceed anyway, click OK.", mtWarning, {mbOK, mbCancel, }, 0) === delphi_compatability.IDCANCEL) {
                        // warn them if the colors list will be truncated
                        // limit of 1000 materials
                        return
                    }
                }
                break
            case u3dexport.kLWO:
                if ((this.totalPlants * (u3dexport.kExportPartLast + 1) > u3dexport.kMaxStoredMaterials)) {
                    if (MessageDialog("You have selected too many materials for this file format." + chr(13) + "The number of distinct colors will be bounded at " + IntToStr(u3dexport.kMaxStoredMaterials) + "." + chr(13) + "Some plants may refer to non-existent colors." + chr(13) + chr(13) + "To proceed anyway, click OK.", mtWarning, {mbOK, mbCancel, }, 0) === delphi_compatability.IDCANCEL) {
                        // warn them if the colors list will be truncated
                        // limit of 1000 materials
                        return
                    }
                }
                break
        this.transferDirection = kTransferSave
        this.transferFields()
        this.ModalResult = mrOK
    }
    
    cancelClick(Sender: TObject): void {
        this.ModalResult = mrCancel
    }
    
    rearrangeItemsForOutputType(): void {
        this.ClientHeight = this.otherGroupBox.Top + this.otherGroupBox.Height + 4
        this.ClientWidth = this.Close.Left + this.Close.Width + 4
        switch (this.outputType) {
            case u3dexport.kDXF:
                this.Caption = "Save DXF File"
                this.writeColors.Visible = false
                this.makeTrianglesDoubleSided.Top = this.writeColors.Top
                this.translatePlantsToWindowPositions.Top = this.makeTrianglesDoubleSided.Top + this.makeTrianglesDoubleSided.Height + 4
                this.otherGroupBox.Height = this.translatePlantsToWindowPositions.Top + this.translatePlantsToWindowPositions.Height + 6
                this.dxfColorsGroupBox.SetBounds(4, this.otherGroupBox.Top + this.otherGroupBox.Height + 4, this.dxfColorsGroupBox.Width, this.dxfColorsGroupBox.Height)
                this.dxfColorsGroupBox.Visible = true
                this.ClientHeight = this.dxfColorsGroupBox.Top + this.dxfColorsGroupBox.Height + 4
                break
            case u3dexport.kPOV:
                this.Caption = "Save POV Include (INC) File"
                this.plantNameAndCylinderSidesPanel.Visible = false
                this.writePlantNumberInFrontOfName.Visible = false
                this.pressPlantsPanel.Top = 16
                this.writeColors.Top = this.pressPlantsPanel.Top + this.pressPlantsPanel.Height
                this.makeTrianglesDoubleSided.Top = this.writeColors.Top + this.writeColors.Height + 4
                this.translatePlantsToWindowPositions.Top = this.makeTrianglesDoubleSided.Top + this.makeTrianglesDoubleSided.Height + 4
                this.otherGroupBox.Height = this.translatePlantsToWindowPositions.Top + this.translatePlantsToWindowPositions.Height + 6
                this.reorientGroupBox.SetBounds(4, this.drawWhichPlantsGroupBox.Top + this.drawWhichPlantsGroupBox.Height + 4, this.reorientGroupBox.Width, this.reorientGroupBox.Height)
                this.otherGroupBox.SetBounds(4, this.reorientGroupBox.Top + this.reorientGroupBox.Height + 4, this.otherGroupBox.Width, this.otherGroupBox.Height)
                this.povLimitsGroupBox.SetBounds(4, this.otherGroupBox.Top + this.otherGroupBox.Height + 4, this.povLimitsGroupBox.Width, this.povLimitsGroupBox.Height)
                this.povLimitsGroupBox.Visible = true
                this.nestingGroupBox.SetBounds(4, this.povLimitsGroupBox.Top + this.povLimitsGroupBox.Height + 4, this.nestingGroupBox.Width, this.nestingGroupBox.Height)
                this.nestingGroupBox.Visible = true
                this.ClientHeight = this.nestingGroupBox.Top + this.nestingGroupBox.Height + 4
                this.layeringOption.Visible = false
                break
            case u3dexport.k3DS:
                this.Caption = "Save 3DS File"
                this.threeDSWarningPanel.SetBounds(4, this.otherGroupBox.Top + this.otherGroupBox.Height + 4, this.threeDSWarningPanel.Width, this.threeDSWarningPanel.Height)
                this.threeDSWarningPanel.Visible = true
                this.ClientHeight = this.threeDSWarningPanel.Top + this.threeDSWarningPanel.Height + 4
                break
            case u3dexport.kOBJ:
                this.Caption = "Save WaveFront OBJ File (ASCII)"
                break
            case u3dexport.kVRML:
                this.Caption = "Save VRML File"
                this.layeringOption.Visible = false
                this.reorientGroupBox.SetBounds(4, this.drawWhichPlantsGroupBox.Top + this.drawWhichPlantsGroupBox.Height + 4, this.reorientGroupBox.Width, this.reorientGroupBox.Height)
                this.otherGroupBox.SetBounds(4, this.reorientGroupBox.Top + this.reorientGroupBox.Height + 4, this.otherGroupBox.Width, this.otherGroupBox.Height)
                this.vrmlVersionRadioGroup.SetBounds(4, this.otherGroupBox.Top + this.otherGroupBox.Height + 4, this.vrmlVersionRadioGroup.Width, this.vrmlVersionRadioGroup.Height)
                this.vrmlVersionRadioGroup.Visible = true
                this.nestingGroupBox.SetBounds(4, this.vrmlVersionRadioGroup.Top + this.vrmlVersionRadioGroup.Height + 4, this.nestingGroupBox.Width, this.nestingGroupBox.Height)
                this.commentOutUnionAtEnd.Visible = false
                this.nestingGroupBox.Height = this.nestInflorescence.Top + this.nestInflorescence.Height + 6
                this.nestingGroupBox.Visible = true
                this.ClientHeight = this.nestingGroupBox.Top + this.nestingGroupBox.Height + 4
                break
            case u3dexport.kLWO:
                this.Caption = "Save Lightwave LWO File"
                break
    }
    
    transferFields(): void {
        let oldExportType: short
        
        if (this.transferDirection === kTransferLoad) {
            switch (this.options.exportType) {
                case udomain.kIncludeSelectedPlants:
                    // options that work for all types
                    this.useSelectedPlants.Checked = true
                    break
                case udomain.kIncludeVisiblePlants:
                    this.useVisiblePlants.Checked = true
                    break
                case udomain.kIncludeAllPlants:
                    this.useAllPlants.Checked = true
                    break
        } else {
            oldExportType = this.options.exportType
            if (this.useSelectedPlants.Checked) {
                this.options.exportType = udomain.kIncludeSelectedPlants
            } else if (this.useVisiblePlants.Checked) {
                this.options.exportType = udomain.kIncludeVisiblePlants
            } else if (this.useAllPlants.Checked) {
                this.options.exportType = udomain.kIncludeAllPlants
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
            case u3dexport.kDXF:
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
            case u3dexport.kPOV:
                this.options.pov_minLineLengthToWrite = this.transferSingleEditBox(this.minLineLengthToWrite, this.options.pov_minLineLengthToWrite)
                this.options.pov_minTdoScaleToWrite = this.transferSingleEditBox(this.minTdoScaleToWrite, this.options.pov_minTdoScaleToWrite)
                this.options.pov_commentOutUnionAtEnd = this.transferCheckBox(this.commentOutUnionAtEnd, this.options.pov_commentOutUnionAtEnd)
                this.options.nest_Inflorescence = this.transferCheckBox(this.nestInflorescence, this.options.nest_Inflorescence)
                this.options.nest_LeafAndPetiole = this.transferCheckBox(this.nestLeafAndPetiole, this.options.nest_LeafAndPetiole)
                this.options.nest_CompoundLeaf = this.transferCheckBox(this.nestCompoundLeaf, this.options.nest_CompoundLeaf)
                this.options.nest_PedicelAndFlowerFruit = this.transferCheckBox(this.nestPedicelAndFlowerFruit, this.options.nest_PedicelAndFlowerFruit)
                this.options.nest_FloralLayers = this.transferCheckBox(this.nestFloralLayers, this.options.nest_FloralLayers)
                break
            case u3dexport.k3DS:
                // nothing special
                break
            case u3dexport.kOBJ:
                // nothing special
                break
            case u3dexport.kVRML:
                this.options.nest_Inflorescence = this.transferCheckBox(this.nestInflorescence, this.options.nest_Inflorescence)
                this.options.nest_LeafAndPetiole = this.transferCheckBox(this.nestLeafAndPetiole, this.options.nest_LeafAndPetiole)
                this.options.nest_CompoundLeaf = this.transferCheckBox(this.nestCompoundLeaf, this.options.nest_CompoundLeaf)
                this.options.nest_PedicelAndFlowerFruit = this.transferCheckBox(this.nestPedicelAndFlowerFruit, this.options.nest_PedicelAndFlowerFruit)
                this.options.nest_FloralLayers = this.transferCheckBox(this.nestFloralLayers, this.options.nest_FloralLayers)
                this.options.vrml_version = this.transferRadioGroup(this.vrmlVersionRadioGroup, this.options.vrml_version)
                break
            case u3dexport.kLWO:
                break
    }
    
    updatePredictedSizeDisplay(): void {
        let i: long
        let plant: PdPlant
        let plantsString: string
        let estimatedBytes: long
        
        this.totalPlants = 0
        this.totalPoints = 0
        this.totalTriangles = 0
        this.totalParts = 0
        this.totalMaterials = 0
        if (udomain.domain.plantManager.plants.Count > 0) {
            for (i = 0; i <= udomain.domain.plantManager.plants.Count - 1; i++) {
                plant = uplant.PdPlant(udomain.domain.plantManager.plants.Items[i])
                if (plant === null) {
                    continue
                }
                if ((this.useSelectedPlants.Checked) && (!umain.MainForm.isSelected(plant))) {
                    continue
                }
                if ((this.useVisiblePlants.Checked) && (plant.hidden)) {
                    continue
                }
                plant.countPlantPartsFor3DOutput(this.outputType, StrToIntDef(this.stemCylinderFaces.Text, 20))
                this.totalPoints = this.totalPoints + plant.total3DExportPoints
                this.totalTriangles = this.totalTriangles + plant.total3DExportTriangles
                this.totalParts = this.totalParts + plant.totalPlantParts
                this.totalMaterials = this.totalMaterials + plant.total3DExportMaterials
                this.totalPlants += 1
            }
        }
        estimatedBytes = this.estimateBytes(udomain.domain.plantManager.plants.Count, this.totalParts, this.totalPoints, this.totalTriangles)
        // in MB
        this.options.fileSize = 1.0 * estimatedBytes / (1024 * 1024)
        this.estimationStringGrid.Cells[0, 0] = " plants"
        this.estimationStringGrid.Cells[0, 1] = " " + IntToStr(this.totalPlants)
        this.estimationStringGrid.ColWidths[0] = 36
        this.estimationStringGrid.Cells[1, 0] = " parts"
        this.estimationStringGrid.Cells[1, 1] = " " + IntToStr(this.totalParts)
        this.estimationStringGrid.ColWidths[1] = 36
        this.estimationStringGrid.Cells[2, 0] = " points"
        this.estimationStringGrid.Cells[2, 1] = " " + IntToStr(this.totalPoints)
        this.estimationStringGrid.ColWidths[2] = 44
        this.estimationStringGrid.Cells[3, 0] = " polygons"
        this.estimationStringGrid.Cells[3, 1] = " " + IntToStr(this.totalTriangles)
        // polygons is the longest word
        this.estimationStringGrid.ColWidths[3] = 50
        this.estimationStringGrid.Cells[4, 0] = " colors"
        this.estimationStringGrid.Cells[4, 1] = " " + IntToStr(this.totalMaterials)
        this.estimationStringGrid.Cells[5, 0] = " size"
        this.estimationStringGrid.ColWidths[5] = 64
        if (this.options.fileSize > 1.0) {
            this.estimationStringGrid.Cells[5, 1] = " " + FloatToStrF(this.options.fileSize, UNRESOLVED.ffFixed, 7, 2) + " MB"
        } else {
            this.estimationStringGrid.Cells[5, 1] = " " + IntToStr(intround(this.options.fileSize * 1024)) + " K"
        }
        this.translatePlantsToWindowPositions.Visible = (this.totalPlants > 1)
    }
    
    estimateBytes(numPlants: long, numParts: long, numPoints: long, numTriangles: long): long {
        let result = 0
        switch (this.outputType) {
            case u3dexport.kDXF:
                result = numPoints * 250
                break
            case u3dexport.kPOV:
                result = numPlants * 25 + numParts * 25 + numTriangles * 150
                break
            case u3dexport.k3DS:
                result = numPlants * 48 + numParts * 48 + numPoints * 24 + numTriangles * 24
                break
            case u3dexport.kOBJ:
                result = numPlants * 100 + numParts * 100 + numPoints * 50 + numTriangles * 50
                break
            case u3dexport.kVRML:
                result = numPlants * 100 + numParts * 100 + numPoints * 80 + numTriangles * 80
                break
            case u3dexport.kLWO:
                result = numPlants * 600 + numParts * 100 + numPoints * 20 + numTriangles * 20
                break
            default:
                throw new GeneralException.create("Problem: Invalid 3d export type for size estimation.")
                break
        return result
    }
    
    fillPlantPartColors(): void {
        let i: short
        let firstPlant: PdPlant
        
        this.colorsByPlantPart.Clear()
        if ((udomain.domain === null) || (udomain.domain.plantManager === null) || (udomain.domain.plantManager.plants.Count < 0)) {
            // use first plant to get DXF part type names - there must be at least one plant to bring up this form
            return
        }
        firstPlant = uplant.PdPlant(udomain.domain.plantManager.plants[0])
        if (firstPlant === null) {
            return
        }
        for (i = 0; i <= u3dexport.kExportPartLast; i++) {
            this.colorsByPlantPart.Items.Add(u3dexport.longNameForDXFPartType(i))
        }
    }
    
    colorsByPlantPartDrawItem(Control: TWinControl, index: int, Rect: TRect, State: TOwnerDrawState): void {
        let selected: boolean
        let colorRect: TRect
        let remainderRect: TRect
        let cText: char[] /* 255 + 1 */
        
        if (delphi_compatability.Application.terminated) {
            return
        }
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
        UNRESOLVED.strPCopy(cText, this.colorsByPlantPart.Items[index])
        // margin for text 
        remainderRect.Left = remainderRect.Left + 5
        UNRESOLVED.winprocs.drawText(this.colorsByPlantPart.Canvas.Handle, cText, len(cText), remainderRect, delphi_compatability.DT_LEFT)
    }
    
    wholePlantColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let colorForm: TChooseDXFColorForm
        let response: int
        
        colorForm = udxfclr.TChooseDXFColorForm().create(this)
        if (colorForm === null) {
            throw new GeneralException.create("Problem: Could not create color window.")
        }
        try {
            colorForm.colorIndex = this.options.dxf_wholePlantColorIndex
            response = colorForm.ShowModal()
            if (response === mrOK) {
                this.options.dxf_wholePlantColorIndex = colorForm.colorIndex
                this.wholePlantColor.Color = u3dexport.dxfColors[this.options.dxf_wholePlantColorIndex]
                this.wholePlantColor.Invalidate()
                this.optionsChanged = true
            }
        } finally {
            colorForm.free
            colorForm = null
        }
    }
    
    setPlantPartColorClick(Sender: TObject): void {
        let colorForm: TChooseDXFColorForm
        let response: int
        let firstColorIndex: TColorRef
        let i: short
        
        firstColorIndex = -1
        if (this.colorsByPlantPart.Items.Count > 0) {
            for (i = 0; i <= this.colorsByPlantPart.Items.Count - 1; i++) {
                if (this.colorsByPlantPart.Selected[i]) {
                    if (firstColorIndex === -1) {
                        firstColorIndex = this.options.dxf_plantPartColorIndexes[i]
                    }
                }
            }
        }
        if (firstColorIndex < 0) {
            return
        }
        colorForm = udxfclr.TChooseDXFColorForm().create(this)
        if (colorForm === null) {
            throw new GeneralException.create("Problem: Could not create color window.")
        }
        try {
            colorForm.colorIndex = firstColorIndex
            response = colorForm.ShowModal()
            if (response === mrOK) {
                if (this.colorsByPlantPart.Items.Count > 0) {
                    for (i = 0; i <= this.colorsByPlantPart.Items.Count - 1; i++) {
                        if (this.colorsByPlantPart.Selected[i]) {
                            this.options.dxf_plantPartColorIndexes[i] = colorForm.colorIndex
                        }
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
    
    colorsByPlantPartDblClick(Sender: TObject): void {
        this.setPlantPartColorClick(this)
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
        raise "method transferColor had assigned to var parameter value not added to return -- fixup manually"
        if (this.transferDirection === kTransferLoad) {
            colorPanel.Color = value
        } else if (this.transferDirection === kTransferSave) {
            if (value !== colorPanel.Color) {
                this.optionsChanged = true
            }
            value = colorPanel.Color
        }
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
            editBox.Text = usupport.valueString(value)
        } else if (this.transferDirection === kTransferSave) {
            try {
                newValue = StrToFloat(editBox.Text)
            } catch (Exception e) {
                newValue = value
            }
            if (newValue !== value) {
                this.optionsChanged = true
            }
            value = newValue
        }
        return value
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Exporting_3D_models_in_general")
    }
    
    FormKeyPress(Sender: TObject, Key: char): void {
        Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
        return Key
    }
    
    useSelectedPlantsClick(Sender: TObject): void {
        this.updatePredictedSizeDisplay()
    }
    
    useVisiblePlantsClick(Sender: TObject): void {
        this.updatePredictedSizeDisplay()
    }
    
    useAllPlantsClick(Sender: TObject): void {
        this.updatePredictedSizeDisplay()
    }
    
    stemCylinderFacesChange(Sender: TObject): void {
        let value: int
        
        value = StrToIntDef(this.stemCylinderFaces.Text, 5)
        if (value < udomain.kMinOutputCylinderFaces) {
            value = udomain.kMinOutputCylinderFaces
        }
        if (value > udomain.kMaxOutputCylinderFaces) {
            value = udomain.kMaxOutputCylinderFaces
        }
        this.stemCylinderFaces.Text = IntToStr(value)
        this.updatePredictedSizeDisplay()
    }
    
    dxfWriteColorsClick(Sender: TObject): void {
        this.colorDXFFromRGB.Visible = this.dxfWriteColors.Checked
        this.colorDXFFromOneColor.Visible = this.dxfWriteColors.Checked
        this.wholePlantColor.Visible = this.dxfWriteColors.Checked
        this.colorDXFFromPlantPartType.Visible = this.dxfWriteColors.Checked
        this.colorsByPlantPart.Visible = this.dxfWriteColors.Checked
        this.setPlantPartColor.Visible = this.dxfWriteColors.Checked
    }
    
}

