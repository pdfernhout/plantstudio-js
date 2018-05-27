// unit uunits
//Copyright (c) 1997 Paul D. Fernhout and Cynthia F. Kurtz All rights reserved
//http://www.gardenwithinsight.com. See the license file for details on redistribution.
//=====================================================================================
//uunits: Functions for conversion of units in whole system. There are 32 unit sets,
//and each unit set contains units that are inter-convertible. For example, the
//temperature unit set contains degrees C and degrees F. The unit set must be saved
//and given during any conversion so the function knows which code to use to convert
//the units. Numbers cannot be converted between unit sets. The file also contains
//information for displaying the units (the string to show, etc).

from conversion_common import *
import umath
import usupport
import delphi_compatability

// const
const kRangeOK = 0
const kRangeTooLow = 1
const kRangeTooHigh = 2
const kRangeBounds = 3
const kRangeMustBeInteger = 4
const kDefaultFloatMin = -100000000000.0
const kDefaultFloatMax = 100000000000.0
const kMaxUnitStringLength = 12


// const
const kDimensionless = 1
const kLength = 2
const kObsoleteLength = 3
const kAngle = 4
const kTemperature = 5
const kMass = 6
const kObsoleteMass = 7
const kArea = 8
const kMassOverArea = 9
const kRadiation = 10
const kVolume = 11
const kDepthOfWater = 12
const kVelocity = 13
const kPressure = 14
const kDensity = 15
const kNonChangingUnitHundredsOfMolesPKilogram = 16
const kNonChangingUnitKilogramsPHectarePMegaJoulePSquareMeter = 17
const kNonChangingUnitKiloPascalPDegreeC = 18
const kNonChangingUnitMegaJoulePKilogram = 19
const kNonChangingUnitKilogramPKilogram = 20
const kNonChangingUnitMetersPMeter = 21
const kNonChangingUnitYears = 22
const kNonChangingUnitDays = 23
const kNonChangingUnitHours = 24
const kNonChangingUnitPartsPMillion = 25
const kNonChangingUnitFraction = 26
const kNonChangingUnitPercent = 27
const kNonChangingUnitGramsPMetricTon = 28
const kNonChangingUnitCubicMetersPSecond = 29
const kNonChangingUnitBoolean = 30
const kConcentration = 31
const kLastUnitSet = 32


// var
let maxUnitStringLengths: int[] /* kLastUnitSet + 1 */


// const
const kLengthFirstUnit = 1
const kLengthMicrons = 1
const kLengthMillimeters = 2
const kLengthCentimeters = 3
const kLengthMeters = 4
const kLengthKilometers = 5
const kLengthInches = 6
const kLengthFeet = 7
const kLengthYards = 8
const kLengthMiles = 9
const kLengthLastUnit = 10


// const
const kAngleFirstUnit = 1
const kAngleRadians = 1
const kAngleDegrees = 2
const kAngleLastUnit = 3


// const
const kTemperatureFirstUnit = 1
const kTemperatureDegreesC = 1
const kTemperatureDegreesF = 2
const kTemperatureLastUnit = 3


// const
const kMassFirstUnit = 1
const kMassMilligrams = 1
const kMassGrams = 2
const kMassKilograms = 3
const kMassMetricTons = 4
const kMassOunces = 5
const kMassPounds = 6
const kMassEnglishTons = 7
const kMassLastUnit = 8


// const
const kAreaFirstUnit = 1
const kAreaHectares = 1
const kAreaSquareMeters = 2
const kAreaSquareKilometers = 3
const kAreaSquareFeet = 4
const kAreaSquareYards = 5
const kAreaAcres = 6
const kAreaSquareMiles = 7
const kAreaLastUnit = 8


// const
const kMassOverAreaFirstUnit = 1
const kMassOverAreaKilogramsPHectare = 1
const kMassOverAreaMetricTonsPHectare = 2
const kMassOverAreaKilogramsPSquareMeter = 3
const kMassOverAreaGramsPSquareMeter = 4
const kMassOverAreaGramsPSquareCentimeter = 5
const kMassOverAreaPoundsPAcre = 6
const kMassOverAreaEnglishTonsPAcre = 7
const kMassOverAreaPoundsPSquareYard = 8
const kMassOverAreaPoundsPSquareFoot = 9
const kMassOverAreaOuncesPSquareFoot = 10
const kMassOverAreaLastUnit = 11


// const
const kRadiationFirstUnit = 1
const kRadiationMegaJoulesPSquareMeter = 1
const kRadiationKilowattHoursPSquareMeter = 2
const kRadiationCaloriesPerSquareMeter = 3
const kRadiationLangleys = 4
const kRadiationMegaJoulesPSquareFoot = 5
const kRadiationKilowattHoursPSquareFoot = 6
const kRadiationCaloriesPerSquareFoot = 7
const kRadiationLastUnit = 8


// const
const kVolumeFirstUnit = 1
const kVolumeMilliliters = 1
const kVolumeLiters = 2
const kVolumeCubicMeters = 3
const kVolumeQuarts = 4
const kVolumeGallons = 5
const kVolumeOunces = 6
const kVolumeLastUnit = 7


// const
const kDepthOfWaterFirstUnit = 1
const kDepthOfWaterMillimeters = 1
const kDepthOfWaterInches = 2
const kDepthOfWaterLastUnit = 3


// const
const kVelocityFirstUnit = 1
const kVelocityMetersPSecond = 1
const kVelocityMillimetersPHour = 2
const kVelocityMilesPHour = 3
const kVelocityFeetPSecond = 4
const kVelocityInchesPHour = 5
const kVelocityLastUnit = 6


// const
const kPressureFirstUnit = 1
const kPressurePascals = 1
const kPressureKilopascals = 2
const kPressureMegapascals = 3
const kPressureKilogramsPSquareCentimeter = 4
const kPressureAtmospheres = 5
const kPressureBars = 6
const kPressurePoundsPSquareInch = 7
const kPressureLastUnit = 8


// const
const kDensityFirstUnit = 1
const kDensityGramsPCubicCentimeter = 1
const kDensityKilogramsPCubicMeter = 2
const kDensityMetricTonsPCubicMeter = 3
const kDensityPoundsPCubicFoot = 4
const kDensityPoundsPAcreFoot = 5
const kDensityLastUnit = 6


// const
const kConcentrationFirstUnit = 1
const kConcentrationGramsPMetricTon = 1
const kConcentrationGramsPKilogram = 2
const kConcentrationMilligramsPMetricTon = 3
const kConcentrationPoundsPEnglishTon = 4
const kConcentrationOuncesPEnglishTon = 5
const kConcentrationLastUnit = 6


// var
let m_to_microns: float
let microns_to_m: float
let m_to_mm: float
let mm_to_m: float
let m_to_cm: float
let cm_to_m: float
let cm_to_mm: float
let mm_to_cm: float
let km_to_m: float
let m_to_km: float
let in_to_cm: float
let cm_to_in: float
let ft_to_in: float
let in_to_ft: float
let yd_to_ft: float
let ft_to_yd: float
let mi_to_ft: float
let ft_to_mi: float
let t_to_kg: float
let kg_to_t: float
let kg_to_g: float
let g_to_kg: float
let g_to_mg: float
let mg_to_g: float
let oz_to_g: float
let g_to_oz: float
let lb_to_oz: float
let oz_to_lb: float
let T_to_lb: float
let lb_to_T: float
let ha_to_m2: float
let m2_to_ha: float
let km2_to_m2: float
let m2_to_km2: float
let m2_to_cm2: float
let cm2_to_m2: float
let m2_to_ft2: float
let ft2_to_m2: float
let in2_to_cm2: float
let cm2_to_in2: float
let yd2_to_ft2: float
let ft2_to_yd2: float
let ac_to_ft2: float
let ft2_to_ac: float
let mi2_to_ac: float
let ac_to_mi2: float
let kWh_to_MJ: float
let MJ_to_kWh: float
let MJ_to_joule: float
let joule_to_MJ: float
let cal_to_joule: float
let joule_to_cal: float
let MJPm2_to_langleys: float
let langleys_to_MJPm2: float
let l_to_ml: float
let ml_to_l: float
let m3_to_l: float
let l_to_m3: float
let qt_to_l: float
let l_to_qt: float
let gal_to_qt: float
let qt_to_gal: float
let qt_to_floz: float
let floz_to_qt: float
let m3_to_ft3: float
let ft3_to_m3: float
let acft_to_ft3: float
let ft3_to_acft: float
let kPa_to_pa: float
let pa_to_kPa: float
let MPa_to_kPa: float
let kPa_to_MPa: float
let psi_to_pa: float
let pa_to_psi: float
let atm_to_pa: float
let pa_to_atm: float
let bars_to_pa: float
let pa_to_bars: float
let hr_to_min: float
let min_to_hr: float
let min_to_sec: float
let sec_to_min: float
let rad_to_deg: float
let deg_to_rad: float
let frn_to_pct: float
let pct_to_frn: float


// if change any unit string to make it longer than this, update 
// unit sets  
// obsolete 
// obsolete 
//length (base unit: m) 
// note: length used to be split into small and large,
//  but these two have been combined so the user doesn't see them. 
// was inches 
// was feet 
// was yards 
// was large meters 
// was large km 
// 10 was large yards 
// 11 was large miles 
// angle (base unit: radians)
// temperature (base unit: deg C)  
// Mass (base unit: kg) (both small and large) 
// note: these two have been combined so the user doesn't see them. 
// was ounces 
// was pounds 
// was large kg 
// was large metric tons 
// 8 was large pounds 
// 9 was large english tons 
// area (base unit: m2)  
// Mass over area (base unit: kg/ha) 
// radiation (base unit: MJ/m2) 
// volume (base unit: liter) 
// depth of water (precipitation) (base unit: mm) 
// velocity (base unit: m/sec) 
// pressure (base unit: Pa)
// density (base unit: g/cm3) (also concentration) 
// concentration (base unit: g/t) 
// length 
// mass 
// area 
// energy 
// volume 
// pressure 
// other 
function setUnitConstants(): void {
    // length 
    m_to_microns = 1000000.0
    microns_to_m = 1.0 / m_to_microns
    m_to_mm = 1000.0
    mm_to_m = 1.0 / m_to_mm
    m_to_cm = 100.0
    cm_to_m = 1.0 / m_to_cm
    cm_to_mm = 10.0
    mm_to_cm = 1.0 / cm_to_mm
    km_to_m = 1000.0
    m_to_km = 1.0 / km_to_m
    in_to_cm = 2.54
    cm_to_in = 1.0 / in_to_cm
    ft_to_in = 12.0
    in_to_ft = 1.0 / ft_to_in
    yd_to_ft = 3.0
    ft_to_yd = 1.0 / yd_to_ft
    mi_to_ft = 5280.0
    ft_to_mi = 1.0 / mi_to_ft
    // mass 
    t_to_kg = 1000.0
    kg_to_t = 1.0 / t_to_kg
    kg_to_g = 1000.0
    g_to_kg = 1.0 / kg_to_g
    g_to_mg = 1000.0
    mg_to_g = 1.0 / g_to_mg
    oz_to_g = 28.35
    g_to_oz = 1.0 / oz_to_g
    lb_to_oz = 16.0
    oz_to_lb = 1.0 / lb_to_oz
    T_to_lb = 2000.0
    lb_to_T = 1.0 / T_to_lb
    // area 
    ha_to_m2 = 10000.0
    m2_to_ha = 1.0 / ha_to_m2
    km2_to_m2 = 1000000.0
    m2_to_km2 = 1.0 / km2_to_m2
    m2_to_cm2 = 10000.0
    cm2_to_m2 = 1 / m2_to_cm2
    m2_to_ft2 = 10.7639
    ft2_to_m2 = 1.0 / m2_to_ft2
    in2_to_cm2 = 6.4516
    cm2_to_in2 = 1.0 / in2_to_cm2
    yd2_to_ft2 = 9.0
    ft2_to_yd2 = 1.0 / yd2_to_ft2
    ac_to_ft2 = 43560.0
    ft2_to_ac = 1.0 / ac_to_ft2
    mi2_to_ac = 640.0
    ac_to_mi2 = 1.0 / mi2_to_ac
    // energy 
    kWh_to_MJ = 3.6
    MJ_to_kWh = 1.0 / kWh_to_MJ
    MJ_to_joule = 1000000.0
    joule_to_MJ = 1.0 / MJ_to_joule
    cal_to_joule = 4.1868
    joule_to_cal = 1.0 / cal_to_joule
    MJPm2_to_langleys = 23.8846
    langleys_to_MJPm2 = 1.0 / MJPm2_to_langleys
    // volume 
    l_to_ml = 1000.0
    ml_to_l = 1.0 / l_to_ml
    m3_to_l = 1000.0
    l_to_m3 = 1.0 / m3_to_l
    qt_to_l = 0.946
    l_to_qt = 1.0 / qt_to_l
    gal_to_qt = 4.0
    qt_to_gal = 1.0 / gal_to_qt
    qt_to_floz = 32.0
    floz_to_qt = 1.0 / qt_to_floz
    m3_to_ft3 = 35.32
    ft3_to_m3 = 1.0 / m3_to_ft3
    acft_to_ft3 = 43560.0
    ft3_to_acft = 1.0 / acft_to_ft3
    // pressure 
    kPa_to_pa = 1000.0
    pa_to_kPa = 1.0 / kPa_to_pa
    MPa_to_kPa = 1000.0
    kPa_to_MPa = 1.0 / MPa_to_kPa
    psi_to_pa = 6894.76
    pa_to_psi = 1.0 / psi_to_pa
    atm_to_pa = 101325.0
    pa_to_atm = 1.0 / atm_to_pa
    bars_to_pa = 100000
    pa_to_bars = 1.0 / bars_to_pa
    // other 
    hr_to_min = 60.0
    min_to_hr = 1.0 / hr_to_min
    min_to_sec = 60.0
    sec_to_min = 1.0 / min_to_sec
    rad_to_deg = 57.296
    deg_to_rad = 1.0 / rad_to_deg
    frn_to_pct = 100.0
    pct_to_frn = 1.0 / frn_to_pct
}

function Convert(unitSet: int, unitFrom: int, unitTo: int, value: float): float {
    let result = 0.0
    let base: double
    
    base = 0.0
    // default result to same value if something goes wrong 
    result = value
    if ((unitFrom === unitTo) || (value === usupport.kMaxSingle) || (value === usupport.kMinSingle)) {
        // if no conversion, exit 
        return result
    }
    if (value === usupport.kMaxSingle) {
        // special check for overflow (for bounds) to avoid exception-handling system 
        result = usupport.kMaxSingle
        return result
    }
    if (value === -usupport.kMaxSingle) {
        result = -usupport.kMaxSingle
        return result
    }
    try {
        switch (unitSet) {
            case kDimensionless:
                result = value
                break
            case kLength:
                switch (unitFrom) {
                    case kLengthMicrons:
                        //base unit: meters
                        base = value * microns_to_m
                        break
                    case kLengthMillimeters:
                        base = value * mm_to_m
                        break
                    case kLengthCentimeters:
                        base = value * cm_to_m
                        break
                    case kLengthMeters:
                        base = value
                        break
                    case kLengthKilometers:
                        base = value * km_to_m
                        break
                    case kLengthInches:
                        base = value * in_to_cm * cm_to_m
                        break
                    case kLengthFeet:
                        base = value * ft_to_in * in_to_cm * cm_to_m
                        break
                    case kLengthYards:
                        base = value * yd_to_ft * ft_to_in * in_to_cm * cm_to_m
                        break
                    case kLengthMiles:
                        base = value * mi_to_ft * ft_to_in * in_to_cm * cm_to_m
                        break
                }
                switch (unitTo) {
                    case kLengthMicrons:
                        result = base * m_to_microns
                        break
                    case kLengthMillimeters:
                        result = base * m_to_mm
                        break
                    case kLengthCentimeters:
                        result = base * m_to_cm
                        break
                    case kLengthMeters:
                        result = base
                        break
                    case kLengthKilometers:
                        result = base * m_to_km
                        break
                    case kLengthInches:
                        result = base * m_to_cm * cm_to_in
                        break
                    case kLengthFeet:
                        result = base * m_to_cm * cm_to_in * in_to_ft
                        break
                    case kLengthYards:
                        result = base * m_to_cm * cm_to_in * in_to_ft * ft_to_yd
                        break
                    case kLengthMiles:
                        result = base * m_to_cm * cm_to_in * in_to_ft * ft_to_mi
                        break
                }
                break
            case kAngle:
                switch (unitFrom) {
                    case kAngleRadians:
                        //base unit: radians
                        base = value
                        break
                    case kAngleDegrees:
                        base = value * deg_to_rad
                        break
                }
                switch (unitTo) {
                    case kAngleRadians:
                        result = base
                        break
                    case kAngleDegrees:
                        result = base * rad_to_deg
                        break
                }
                break
            case kTemperature:
                switch (unitFrom) {
                    case kTemperatureDegreesC:
                        //base unit: degrees C
                        base = value
                        break
                    case kTemperatureDegreesF:
                        base = (value - 32.0) / 1.8
                        break
                }
                switch (unitTo) {
                    case kTemperatureDegreesC:
                        result = base
                        break
                    case kTemperatureDegreesF:
                        result = base * 1.8 + 32.0
                        break
                }
                break
            case kMass:
                switch (unitFrom) {
                    case kMassMilligrams:
                        //base unit: milligrams
                        base = value * mg_to_g * g_to_kg
                        break
                    case kMassGrams:
                        base = value * g_to_kg
                        break
                    case kMassKilograms:
                        base = value
                        break
                    case kMassMetricTons:
                        base = value * t_to_kg
                        break
                    case kMassOunces:
                        base = value * oz_to_g * g_to_kg
                        break
                    case kMassPounds:
                        base = value * lb_to_oz * oz_to_g * g_to_kg
                        break
                    case kMassEnglishTons:
                        base = value * T_to_lb * lb_to_oz * oz_to_g * g_to_kg
                        break
                }
                switch (unitTo) {
                    case kMassMilligrams:
                        result = base * kg_to_g * g_to_mg
                        break
                    case kMassGrams:
                        result = base * kg_to_g
                        break
                    case kMassKilograms:
                        result = base
                        break
                    case kMassMetricTons:
                        result = base * kg_to_t
                        break
                    case kMassOunces:
                        result = base * kg_to_g * g_to_oz
                        break
                    case kMassPounds:
                        result = base * kg_to_g * g_to_oz * oz_to_lb
                        break
                    case kMassEnglishTons:
                        result = base * kg_to_g * g_to_oz * oz_to_lb * lb_to_T
                        break
                }
                break
            case kArea:
                switch (unitFrom) {
                    case kAreaSquareMeters:
                        //base unit: square meters
                        base = value
                        break
                    case kAreaHectares:
                        base = value * ha_to_m2
                        break
                    case kAreaSquareKilometers:
                        base = value * km2_to_m2
                        break
                    case kAreaSquareFeet:
                        base = value * ft2_to_m2
                        break
                    case kAreaSquareYards:
                        base = value * yd2_to_ft2 * ft2_to_m2
                        break
                    case kAreaAcres:
                        base = value * ac_to_ft2 * ft2_to_m2
                        break
                    case kAreaSquareMiles:
                        base = value * mi2_to_ac * ac_to_ft2 * ft2_to_m2
                        break
                }
                switch (unitTo) {
                    case kAreaSquareMeters:
                        result = base
                        break
                    case kAreaHectares:
                        result = base * m2_to_ha
                        break
                    case kAreaSquareKilometers:
                        result = base * m2_to_km2
                        break
                    case kAreaSquareFeet:
                        result = base * m2_to_ft2
                        break
                    case kAreaSquareYards:
                        result = base * m2_to_ft2 * ft2_to_yd2
                        break
                    case kAreaAcres:
                        result = base * m2_to_ft2 * ft2_to_ac
                        break
                    case kAreaSquareMiles:
                        result = base * m2_to_ft2 * ft2_to_ac * ac_to_mi2
                        break
                }
                break
            case kMassOverArea:
                switch (unitFrom) {
                    case kMassOverAreaKilogramsPHectare:
                        //base unit: kg/ha
                        base = value
                        break
                    case kMassOverAreaMetricTonsPHectare:
                        base = value * t_to_kg
                        break
                    case kMassOverAreaKilogramsPSquareMeter:
                        base = value / (m2_to_ha)
                        break
                    case kMassOverAreaGramsPSquareMeter:
                        base = value * g_to_kg / (m2_to_ha)
                        break
                    case kMassOverAreaGramsPSquareCentimeter:
                        base = value * g_to_kg / (cm2_to_m2 * m2_to_ha)
                        break
                    case kMassOverAreaPoundsPAcre:
                        base = value * (lb_to_oz * oz_to_g * g_to_kg) / (ac_to_ft2 * ft2_to_m2 * m2_to_ha)
                        break
                    case kMassOverAreaEnglishTonsPAcre:
                        base = value * (T_to_lb * lb_to_oz * oz_to_g * g_to_kg) / (ac_to_ft2 * ft2_to_m2 * m2_to_ha)
                        break
                    case kMassOverAreaPoundsPSquareYard:
                        base = value * (lb_to_oz * oz_to_g * g_to_kg) / (yd2_to_ft2 * ft2_to_m2 * m2_to_ha)
                        break
                    case kMassOverAreaPoundsPSquareFoot:
                        base = value * (lb_to_oz * oz_to_g * g_to_kg) / (ft2_to_m2 * m2_to_ha)
                        break
                    case kMassOverAreaOuncesPSquareFoot:
                        base = value * (oz_to_g * g_to_kg) / (ft2_to_m2 * m2_to_ha)
                        break
                }
                switch (unitTo) {
                    case kMassOverAreaKilogramsPHectare:
                        result = base
                        break
                    case kMassOverAreaMetricTonsPHectare:
                        result = base * kg_to_t
                        break
                    case kMassOverAreaKilogramsPSquareMeter:
                        result = base / (ha_to_m2)
                        break
                    case kMassOverAreaGramsPSquareMeter:
                        result = base * kg_to_g / (ha_to_m2)
                        break
                    case kMassOverAreaGramsPSquareCentimeter:
                        result = base * kg_to_g / (ha_to_m2 * m2_to_cm2)
                        break
                    case kMassOverAreaPoundsPAcre:
                        result = base * (kg_to_g * g_to_oz * oz_to_lb) / (ha_to_m2 * m2_to_ft2 * ft2_to_ac)
                        break
                    case kMassOverAreaEnglishTonsPAcre:
                        result = base * (kg_to_g * g_to_oz * oz_to_lb * lb_to_T) / (ha_to_m2 * m2_to_ft2 * ft2_to_ac)
                        break
                    case kMassOverAreaPoundsPSquareYard:
                        result = base * (kg_to_g * g_to_oz * oz_to_lb) / (ha_to_m2 * m2_to_ft2 * ft2_to_yd2)
                        break
                    case kMassOverAreaPoundsPSquareFoot:
                        result = base * (kg_to_g * g_to_oz * oz_to_lb) / (ha_to_m2 * m2_to_ft2)
                        break
                    case kMassOverAreaOuncesPSquareFoot:
                        result = base * (kg_to_g * g_to_oz) / (ha_to_m2 * m2_to_ft2)
                        break
                }
                break
            case kRadiation:
                switch (unitFrom) {
                    case kRadiationMegaJoulesPSquareMeter:
                        //base unit: MJ/m2
                        base = value
                        break
                    case kRadiationKilowattHoursPSquareMeter:
                        base = value * kWh_to_MJ
                        break
                    case kRadiationCaloriesPerSquareMeter:
                        base = value * cal_to_joule * joule_to_MJ
                        break
                    case kRadiationLangleys:
                        base = value * langleys_to_MJPm2
                        break
                    case kRadiationMegaJoulesPSquareFoot:
                        base = value / (ft2_to_m2)
                        break
                    case kRadiationKilowattHoursPSquareFoot:
                        base = value * kWh_to_MJ / (ft2_to_m2)
                        break
                    case kRadiationCaloriesPerSquareFoot:
                        base = value * cal_to_joule * joule_to_MJ / (ft2_to_m2)
                        break
                }
                switch (unitTo) {
                    case kRadiationMegaJoulesPSquareMeter:
                        result = base
                        break
                    case kRadiationKilowattHoursPSquareMeter:
                        result = base * MJ_to_kWh
                        break
                    case kRadiationCaloriesPerSquareMeter:
                        result = base * MJ_to_joule * joule_to_cal
                        break
                    case kRadiationLangleys:
                        result = base * MJPm2_to_langleys
                        break
                    case kRadiationMegaJoulesPSquareFoot:
                        result = base / (m2_to_ft2)
                        break
                    case kRadiationKilowattHoursPSquareFoot:
                        result = base * MJ_to_kWh / (m2_to_ft2)
                        break
                    case kRadiationCaloriesPerSquareFoot:
                        result = base * MJ_to_joule * joule_to_cal / (m2_to_ft2)
                        break
                }
                break
            case kVolume:
                switch (unitFrom) {
                    case kVolumeLiters:
                        //base unit: liters
                        base = value
                        break
                    case kVolumeMilliliters:
                        base = value * ml_to_l
                        break
                    case kVolumeCubicMeters:
                        base = value * m3_to_l
                        break
                    case kVolumeQuarts:
                        base = value * qt_to_l
                        break
                    case kVolumeGallons:
                        base = value * gal_to_qt * qt_to_l
                        break
                    case kVolumeOunces:
                        base = value * floz_to_qt * qt_to_l
                        break
                }
                switch (unitTo) {
                    case kVolumeLiters:
                        result = base
                        break
                    case kVolumeMilliliters:
                        result = base * l_to_ml
                        break
                    case kVolumeCubicMeters:
                        result = base * l_to_m3
                        break
                    case kVolumeQuarts:
                        result = base * l_to_qt
                        break
                    case kVolumeGallons:
                        result = base * l_to_qt * qt_to_gal
                        break
                    case kVolumeOunces:
                        result = base * l_to_qt * qt_to_floz
                        break
                }
                break
            case kDepthOfWater:
                switch (unitFrom) {
                    case kDepthOfWaterMillimeters:
                        //base unit: mm
                        base = value
                        break
                    case kDepthOfWaterInches:
                        base = value * in_to_cm * cm_to_mm
                        break
                }
                switch (unitTo) {
                    case kDepthOfWaterMillimeters:
                        result = base
                        break
                    case kDepthOfWaterInches:
                        result = base * mm_to_cm * cm_to_in
                        break
                }
                break
            case kVelocity:
                switch (unitFrom) {
                    case kVelocityMetersPSecond:
                        //base unit: m/sec
                        base = value
                        break
                    case kVelocityMillimetersPHour:
                        base = value * mm_to_m / (hr_to_min * min_to_sec)
                        break
                    case kVelocityMilesPHour:
                        base = value * (mi_to_ft * ft_to_in * in_to_cm * cm_to_m) / (hr_to_min * min_to_sec)
                        break
                    case kVelocityFeetPSecond:
                        base = value * ft_to_in * in_to_cm * cm_to_m
                        break
                    case kVelocityInchesPHour:
                        base = value * (in_to_cm * cm_to_m) / (hr_to_min * min_to_sec)
                        break
                }
                switch (unitTo) {
                    case kVelocityMetersPSecond:
                        result = base
                        break
                    case kVelocityMillimetersPHour:
                        result = base * m_to_mm / (sec_to_min * min_to_hr)
                        break
                    case kVelocityMilesPHour:
                        result = base * (m_to_cm * cm_to_in * in_to_ft * ft_to_mi) / (sec_to_min * min_to_hr)
                        break
                    case kVelocityFeetPSecond:
                        result = base * m_to_cm * cm_to_in * in_to_ft
                        break
                    case kVelocityInchesPHour:
                        result = base * (m_to_cm * cm_to_in) / (sec_to_min * min_to_hr)
                        break
                }
                break
            case kPressure:
                switch (unitFrom) {
                    case kPressurePascals:
                        //base unit: pascal
                        base = value
                        break
                    case kPressureKilopascals:
                        base = value * kPa_to_pa
                        break
                    case kPressureMegapascals:
                        base = value * MPa_to_kPa * kPa_to_pa
                        break
                    case kPressureKilogramsPSquareCentimeter:
                        base = value * (kg_to_g * g_to_oz * oz_to_lb / cm2_to_in2) * psi_to_pa
                        break
                    case kPressureAtmospheres:
                        base = value * atm_to_pa
                        break
                    case kPressureBars:
                        base = value * bars_to_pa
                        break
                    case kPressurePoundsPSquareInch:
                        base = value * psi_to_pa
                        break
                }
                switch (unitTo) {
                    case kPressurePascals:
                        result = base
                        break
                    case kPressureKilopascals:
                        result = base * pa_to_kPa
                        break
                    case kPressureMegapascals:
                        result = base * pa_to_kPa * kPa_to_MPa
                        break
                    case kPressureKilogramsPSquareCentimeter:
                        result = base * pa_to_psi * (lb_to_oz * oz_to_g * g_to_kg / in2_to_cm2)
                        break
                    case kPressureAtmospheres:
                        result = base * pa_to_atm
                        break
                    case kPressureBars:
                        result = base * pa_to_bars
                        break
                    case kPressurePoundsPSquareInch:
                        result = base * pa_to_psi
                        break
                }
                break
            case kDensity:
                switch (unitFrom) {
                    case kDensityMetricTonsPCubicMeter:
                        //base unit: t/m3
                        base = value
                        break
                    case kDensityGramsPCubicCentimeter:
                        base = value
                        break
                    case kDensityKilogramsPCubicMeter:
                        base = value * kg_to_t
                        break
                    case kDensityPoundsPCubicFoot:
                        base = value * (lb_to_oz * oz_to_g * g_to_kg * kg_to_t) / (ft3_to_m3)
                        break
                    case kDensityPoundsPAcreFoot:
                        base = value * (lb_to_oz * oz_to_g * g_to_kg * kg_to_t) / (acft_to_ft3 * ft3_to_m3)
                        break
                }
                switch (unitTo) {
                    case kDensityMetricTonsPCubicMeter:
                        result = base
                        break
                    case kDensityGramsPCubicCentimeter:
                        result = base
                        break
                    case kDensityKilogramsPCubicMeter:
                        result = base * t_to_kg
                        break
                    case kDensityPoundsPCubicFoot:
                        result = base * (t_to_kg * kg_to_g * g_to_oz * oz_to_lb) / (m3_to_ft3)
                        break
                    case kDensityPoundsPAcreFoot:
                        result = base * (t_to_kg * kg_to_g * g_to_oz * oz_to_lb) / (m3_to_ft3 * ft3_to_acft)
                        break
                }
                break
            case kConcentration:
                switch (unitFrom) {
                    case kConcentrationGramsPMetricTon:
                        //base unit: g/t
                        base = value
                        break
                    case kConcentrationGramsPKilogram:
                        base = value / (kg_to_t)
                        break
                    case kConcentrationMilligramsPMetricTon:
                        base = value * mg_to_g
                        break
                    case kConcentrationPoundsPEnglishTon:
                        base = value * (lb_to_oz * oz_to_g) / (T_to_lb * lb_to_oz * oz_to_g * g_to_kg * kg_to_t)
                        break
                    case kConcentrationOuncesPEnglishTon:
                        base = value * (oz_to_g) / (T_to_lb * lb_to_oz * oz_to_g * g_to_kg * kg_to_t)
                        break
                }
                switch (unitTo) {
                    case kConcentrationGramsPMetricTon:
                        result = base
                        break
                    case kConcentrationGramsPKilogram:
                        result = base / (t_to_kg)
                        break
                    case kConcentrationMilligramsPMetricTon:
                        result = base * g_to_mg
                        break
                    case kConcentrationPoundsPEnglishTon:
                        result = base * (g_to_oz * oz_to_lb) / (t_to_kg * kg_to_g * g_to_oz * oz_to_lb * lb_to_T)
                        break
                    case kConcentrationOuncesPEnglishTon:
                        result = base * (g_to_oz) / (t_to_kg * kg_to_g * g_to_oz * oz_to_lb * lb_to_T)
                        break
                }
                break
            default:
                //non changing unit
                result = value
                break
        }
    } catch (EOverflow e) {
        result = usupport.kMaxSingle
    } catch (EUnderflow e) {
        result = umath.kLowestFloatAboveZero
    }
    return result
}

function LoadUnitsInSetIntoComboBox(units: TComboBox, unitSet: int): void {
    let unitEnum: int
    let unitString: string
    
    unitEnum = GetNextUnitEnumInUnitSet(unitSet, 0)
    if (unitEnum !== 0) {
        unitString = UnitStringForEnum(unitSet, unitEnum)
        units.Items.Add(unitString)
        unitEnum = GetNextUnitEnumInUnitSet(unitSet, unitEnum)
        unitString = UnitStringForEnum(unitSet, unitEnum)
        units.Items.Add(unitString)
        while (unitEnum !== 1) {
            unitEnum = GetNextUnitEnumInUnitSet(unitSet, unitEnum)
            if (unitEnum !== 1) {
                unitString = UnitStringForEnum(unitSet, unitEnum)
                units.Items.Add(unitString)
            }
        }
    } else {
        units.Enabled = false
    }
}

// if any unit set string in this function becomes longer than 12 chars, update constant at top of file 
function UnitStringForEnum(unitSetEnum: int, unitEnum: int): string {
    let result = ""
    let problem: boolean
    
    problem = false
    result = "(no unit)"
    switch (unitSetEnum) {
        case kDimensionless:
            result = "(no unit)"
            break
        case kLength:
            switch (unitEnum) {
                case kLengthMicrons:
                    result = "microns"
                    break
                case kLengthMillimeters:
                    result = "mm"
                    break
                case kLengthCentimeters:
                    result = "cm"
                    break
                case kLengthMeters:
                    result = "m"
                    break
                case kLengthKilometers:
                    result = "km"
                    break
                case kLengthInches:
                    result = "in"
                    break
                case kLengthFeet:
                    result = "ft"
                    break
                case kLengthYards:
                    result = "yd"
                    break
                case kLengthMiles:
                    result = "mi"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kAngle:
            switch (unitEnum) {
                case kAngleRadians:
                    result = "radians"
                    break
                case kAngleDegrees:
                    result = "degrees"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kTemperature:
            switch (unitEnum) {
                case kTemperatureDegreesC:
                    result = "degrees C"
                    break
                case kTemperatureDegreesF:
                    result = "degrees F"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kMass:
            switch (unitEnum) {
                case kMassMilligrams:
                    result = "mg"
                    break
                case kMassGrams:
                    result = "g"
                    break
                case kMassKilograms:
                    result = "kg"
                    break
                case kMassMetricTons:
                    result = "t"
                    break
                case kMassOunces:
                    result = "oz"
                    break
                case kMassPounds:
                    result = "lb"
                    break
                case kMassEnglishTons:
                    result = "T"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kArea:
            switch (unitEnum) {
                case kAreaHectares:
                    result = "ha"
                    break
                case kAreaSquareMeters:
                    // superscript 2 is chr(178); superscript 3 is chr(179) 
                    result = "m2"
                    break
                case kAreaSquareKilometers:
                    result = "km2"
                    break
                case kAreaSquareFeet:
                    result = "ft2"
                    break
                case kAreaSquareYards:
                    result = "yd2"
                    break
                case kAreaAcres:
                    result = "ac"
                    break
                case kAreaSquareMiles:
                    result = "mi2"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kMassOverArea:
            switch (unitEnum) {
                case kMassOverAreaKilogramsPHectare:
                    result = "kg/ha"
                    break
                case kMassOverAreaMetricTonsPHectare:
                    result = "t/ha"
                    break
                case kMassOverAreaKilogramsPSquareMeter:
                    result = "kg/m2"
                    break
                case kMassOverAreaGramsPSquareMeter:
                    result = "g/m2"
                    break
                case kMassOverAreaGramsPSquareCentimeter:
                    result = "g/cm2"
                    break
                case kMassOverAreaPoundsPAcre:
                    result = "lb/ac"
                    break
                case kMassOverAreaEnglishTonsPAcre:
                    result = "T/ac"
                    break
                case kMassOverAreaPoundsPSquareYard:
                    result = "lb/yd2"
                    break
                case kMassOverAreaPoundsPSquareFoot:
                    result = "lb/ft2"
                    break
                case kMassOverAreaOuncesPSquareFoot:
                    result = "oz/ft2"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kRadiation:
            switch (unitEnum) {
                case kRadiationMegaJoulesPSquareMeter:
                    result = "MJ/m2"
                    break
                case kRadiationKilowattHoursPSquareMeter:
                    result = "kWh/m2"
                    break
                case kRadiationCaloriesPerSquareMeter:
                    result = "cal/m2"
                    break
                case kRadiationLangleys:
                    result = "langleys"
                    break
                case kRadiationMegaJoulesPSquareFoot:
                    result = "MJ/ft2"
                    break
                case kRadiationKilowattHoursPSquareFoot:
                    result = "kWh/ft2"
                    break
                case kRadiationCaloriesPerSquareFoot:
                    result = "cal/ft2"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kVolume:
            switch (unitEnum) {
                case kVolumeMilliliters:
                    result = "ml"
                    break
                case kVolumeLiters:
                    result = "liters"
                    break
                case kVolumeCubicMeters:
                    result = "m3"
                    break
                case kVolumeQuarts:
                    result = "qt"
                    break
                case kVolumeGallons:
                    result = "gal"
                    break
                case kVolumeOunces:
                    result = "oz"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kDepthOfWater:
            switch (unitEnum) {
                case kDepthOfWaterMillimeters:
                    result = "mm (liquid)"
                    break
                case kDepthOfWaterInches:
                    result = "in (liquid)"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kVelocity:
            switch (unitEnum) {
                case kVelocityMetersPSecond:
                    result = "m/sec"
                    break
                case kVelocityMillimetersPHour:
                    result = "mm/hr"
                    break
                case kVelocityMilesPHour:
                    result = "mi/hr"
                    break
                case kVelocityFeetPSecond:
                    result = "ft/sec"
                    break
                case kVelocityInchesPHour:
                    result = "in/hr"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kPressure:
            switch (unitEnum) {
                case kPressurePascals:
                    result = "Pa"
                    break
                case kPressureKilopascals:
                    result = "kPa"
                    break
                case kPressureMegapascals:
                    result = "MPa"
                    break
                case kPressureKilogramsPSquareCentimeter:
                    result = "kg/cm2"
                    break
                case kPressureAtmospheres:
                    result = "atm"
                    break
                case kPressureBars:
                    result = "bars"
                    break
                case kPressurePoundsPSquareInch:
                    result = "lb/in2"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kDensity:
            switch (unitEnum) {
                case kDensityGramsPCubicCentimeter:
                    result = "g/cm3"
                    break
                case kDensityKilogramsPCubicMeter:
                    result = "kg/m3"
                    break
                case kDensityMetricTonsPCubicMeter:
                    result = "t/m3"
                    break
                case kDensityPoundsPCubicFoot:
                    result = "lb/ft3"
                    break
                case kDensityPoundsPAcreFoot:
                    result = "lb/ac ft"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kConcentration:
            switch (unitEnum) {
                case kConcentrationGramsPMetricTon:
                    result = "g/t"
                    break
                case kConcentrationGramsPKilogram:
                    result = "g/kg"
                    break
                case kConcentrationMilligramsPMetricTon:
                    result = "mg/t"
                    break
                case kConcentrationPoundsPEnglishTon:
                    result = "lb/T"
                    break
                case kConcentrationOuncesPEnglishTon:
                    result = "oz/T"
                    break
                default:
                    problem = true
                    break
            }
            break
        case kNonChangingUnitHundredsOfMolesPKilogram:
            result = "cmol/kg"
            break
        case kNonChangingUnitKilogramsPHectarePMegaJoulePSquareMeter:
            result = "kg/ha/MJ/m2"
            break
        case kNonChangingUnitKiloPascalPDegreeC:
            result = "kPa/deg C"
            break
        case kNonChangingUnitMegaJoulePKilogram:
            result = "MJ/kg"
            break
        case kNonChangingUnitKilogramPKilogram:
            result = "kg/kg"
            break
        case kNonChangingUnitMetersPMeter:
            result = "m/m"
            break
        case kNonChangingUnitYears:
            result = "years"
            break
        case kNonChangingUnitDays:
            result = "days"
            break
        case kNonChangingUnitHours:
            result = "hours"
            break
        case kNonChangingUnitPartsPMillion:
            result = "ppm"
            break
        case kNonChangingUnitFraction:
            result = "fraction"
            break
        case kNonChangingUnitPercent:
            result = "%"
            break
        case kNonChangingUnitGramsPMetricTon:
            result = "g/t"
            break
        case kNonChangingUnitCubicMetersPSecond:
            result = "m3/sec"
            break
        case kNonChangingUnitBoolean:
            result = "True/False"
            break
        default:
            result = "(no unit)"
            //  raise Exception.create('Unsupported unit set: ' + intToStr(unitSetEnum));  
            break
    }
    if (problem) {
        //  raise Exception.create('Unsupported unit ' + intToStr(unitEnum)
        //      + ' for unit set ' + intToStr(unitSetEnum)); 
        // PDF PORT -- added null statement
        null
    }
    return result
}

function calcMaxUnitStringLengthForSet(unitSet: int, unitStart: int, unitEnd: int): int {
    let result = 0
    let unitString: string
    let i: int
    
    result = 0
    for (i = unitStart; i <= unitEnd; i++) {
        unitString = UnitStringForEnum(unitSet, i)
        if (len(unitString) > result) {
            result = len(unitString)
        }
    }
    return result
}

function setUpMaxUnitStringLengthsArray(): void {
    maxUnitStringLengths[kDimensionless] = len(UnitStringForEnum(kDimensionless, 0))
    maxUnitStringLengths[kLength] = calcMaxUnitStringLengthForSet(kLength, kLengthFirstUnit, kLengthLastUnit - 1)
    maxUnitStringLengths[kObsoleteLength] = calcMaxUnitStringLengthForSet(kLength, kLengthFirstUnit, kLengthLastUnit - 1)
    maxUnitStringLengths[kAngle] = calcMaxUnitStringLengthForSet(kAngle, kAngleFirstUnit, kAngleLastUnit - 1)
    maxUnitStringLengths[kTemperature] = calcMaxUnitStringLengthForSet(kTemperature, kTemperatureFirstUnit, kTemperatureLastUnit - 1)
    maxUnitStringLengths[kMass] = calcMaxUnitStringLengthForSet(kMass, kMassFirstUnit, kMassLastUnit - 1)
    maxUnitStringLengths[kObsoleteMass] = calcMaxUnitStringLengthForSet(kMass, kMassFirstUnit, kMassLastUnit - 1)
    maxUnitStringLengths[kArea] = calcMaxUnitStringLengthForSet(kArea, kAreaFirstUnit, kAreaLastUnit - 1)
    maxUnitStringLengths[kMassOverArea] = calcMaxUnitStringLengthForSet(kMassOverArea, kMassOverAreaFirstUnit, kMassOverAreaLastUnit - 1)
    maxUnitStringLengths[kRadiation] = calcMaxUnitStringLengthForSet(kRadiation, kRadiationFirstUnit, kRadiationLastUnit - 1)
    maxUnitStringLengths[kVolume] = calcMaxUnitStringLengthForSet(kVolume, kVolumeFirstUnit, kVolumeLastUnit - 1)
    maxUnitStringLengths[kDepthOfWater] = calcMaxUnitStringLengthForSet(kDepthOfWater, kDepthOfWaterFirstUnit, kDepthOfWaterLastUnit - 1)
    maxUnitStringLengths[kVelocity] = calcMaxUnitStringLengthForSet(kVelocity, kVelocityFirstUnit, kVelocityLastUnit - 1)
    maxUnitStringLengths[kPressure] = calcMaxUnitStringLengthForSet(kPressure, kPressureFirstUnit, kPressureLastUnit - 1)
    maxUnitStringLengths[kDensity] = calcMaxUnitStringLengthForSet(kDensity, kDensityFirstUnit, kDensityLastUnit - 1)
    maxUnitStringLengths[kConcentration] = calcMaxUnitStringLengthForSet(kConcentration, kConcentrationFirstUnit, kConcentrationLastUnit - 1)
    maxUnitStringLengths[kNonChangingUnitHundredsOfMolesPKilogram] = len(UnitStringForEnum(kNonChangingUnitHundredsOfMolesPKilogram, 0))
    maxUnitStringLengths[kNonChangingUnitKilogramsPHectarePMegaJoulePSquareMeter] = len(UnitStringForEnum(kNonChangingUnitKilogramsPHectarePMegaJoulePSquareMeter, 0))
    maxUnitStringLengths[kNonChangingUnitKiloPascalPDegreeC] = len(UnitStringForEnum(kNonChangingUnitKiloPascalPDegreeC, 0))
    maxUnitStringLengths[kNonChangingUnitMegaJoulePKilogram] = len(UnitStringForEnum(kNonChangingUnitMegaJoulePKilogram, 0))
    maxUnitStringLengths[kNonChangingUnitKilogramPKilogram] = len(UnitStringForEnum(kNonChangingUnitKilogramPKilogram, 0))
    maxUnitStringLengths[kNonChangingUnitMetersPMeter] = len(UnitStringForEnum(kNonChangingUnitMetersPMeter, 0))
    maxUnitStringLengths[kNonChangingUnitYears] = len(UnitStringForEnum(kNonChangingUnitYears, 0))
    maxUnitStringLengths[kNonChangingUnitDays] = len(UnitStringForEnum(kNonChangingUnitDays, 0))
    maxUnitStringLengths[kNonChangingUnitHours] = len(UnitStringForEnum(kNonChangingUnitHours, 0))
    maxUnitStringLengths[kNonChangingUnitPartsPMillion] = len(UnitStringForEnum(kNonChangingUnitPartsPMillion, 0))
    maxUnitStringLengths[kNonChangingUnitFraction] = len(UnitStringForEnum(kNonChangingUnitFraction, 0))
    maxUnitStringLengths[kNonChangingUnitPercent] = len(UnitStringForEnum(kNonChangingUnitPercent, 0))
    maxUnitStringLengths[kNonChangingUnitGramsPMetricTon] = len(UnitStringForEnum(kNonChangingUnitGramsPMetricTon, 0))
    maxUnitStringLengths[kNonChangingUnitCubicMetersPSecond] = len(UnitStringForEnum(kNonChangingUnitCubicMetersPSecond, 0))
    maxUnitStringLengths[kNonChangingUnitBoolean] = len(UnitStringForEnum(kNonChangingUnitBoolean, 0))
}

function maxUnitStringLengthForSet(unitSet: int): int {
    let result = 0
    result = 0
    if ((unitSet < kDimensionless) || (unitSet >= kLastUnitSet)) {
        throw new GeneralException.create("Problem: Unsupported unit set " + IntToStr(unitSet) + " in method maxUnitStringLengthForSet.")
    } else {
        result = maxUnitStringLengths[unitSet]
    }
    return result
}

function GetNextUnitEnumInUnitSet(unitSet: int, currentUnit: int): int {
    let result = 0
    switch (unitSet) {
        case kDimensionless:
            result = 0
            break
        case kLength:
            if ((currentUnit === kLengthMiles)) {
                result = kLengthMicrons
            } else {
                result = currentUnit + 1
            }
            break
        case kAngle:
            if ((currentUnit === kAngleRadians)) {
                result = kAngleDegrees
            } else {
                result = kAngleRadians
            }
            break
        case kTemperature:
            if ((currentUnit === kTemperatureDegreesC)) {
                result = kTemperatureDegreesF
            } else {
                result = kTemperatureDegreesC
            }
            break
        case kMass:
            if ((currentUnit === kMassEnglishTons)) {
                result = kMassMilligrams
            } else {
                result = currentUnit + 1
            }
            break
        case kArea:
            if ((currentUnit === kAreaSquareMiles)) {
                result = kAreaHectares
            } else {
                result = currentUnit + 1
            }
            break
        case kMassOverArea:
            if ((currentUnit === kMassOverAreaOuncesPSquareFoot)) {
                result = kMassOverAreaKilogramsPHectare
            } else {
                result = currentUnit + 1
            }
            break
        case kRadiation:
            if ((currentUnit === kRadiationCaloriesPerSquareFoot)) {
                result = kRadiationMegaJoulesPSquareMeter
            } else {
                result = currentUnit + 1
            }
            break
        case kVolume:
            if ((currentUnit === kVolumeOunces)) {
                result = kVolumeMilliliters
            } else {
                result = currentUnit + 1
            }
            break
        case kDepthOfWater:
            if ((currentUnit === kDepthOfWaterInches)) {
                result = kDepthOfWaterMillimeters
            } else {
                result = kDepthOfWaterInches
            }
            break
        case kVelocity:
            if ((currentUnit === kVelocityInchesPHour)) {
                result = kVelocityMetersPSecond
            } else {
                result = currentUnit + 1
            }
            break
        case kPressure:
            if ((currentUnit === kPressurePoundsPSquareInch)) {
                result = kPressurePascals
            } else {
                result = currentUnit + 1
            }
            break
        case kDensity:
            if ((currentUnit === kDensityPoundsPAcreFoot)) {
                result = kDensityGramsPCubicCentimeter
            } else {
                result = currentUnit + 1
            }
            break
        case kConcentration:
            if ((currentUnit === kConcentrationOuncesPEnglishTon)) {
                result = kConcentrationGramsPMetricTon
            } else {
                result = currentUnit + 1
            }
            break
        default:
            // non-changing unit set 
            result = currentUnit
            break
    }
    return result
}

function GetPreviousUnitEnumInUnitSet(unitSet: int, currentUnit: int): int {
    let result = 0
    switch (unitSet) {
        case kDimensionless:
            result = 0
            break
        case kLength:
            if ((currentUnit === kLengthMicrons)) {
                result = kLengthMiles
            } else {
                result = currentUnit - 1
            }
            break
        case kAngle:
            if ((currentUnit === kAngleRadians)) {
                // same as next 
                result = kAngleDegrees
            } else {
                result = kAngleRadians
            }
            break
        case kTemperature:
            if ((currentUnit === kTemperatureDegreesC)) {
                // same as next 
                result = kTemperatureDegreesF
            } else {
                result = kTemperatureDegreesC
            }
            break
        case kMass:
            if ((currentUnit === kMassMilligrams)) {
                result = kMassEnglishTons
            } else {
                result = currentUnit - 1
            }
            break
        case kArea:
            if ((currentUnit === kAreaHectares)) {
                result = kAreaSquareMiles
            } else {
                result = currentUnit - 1
            }
            break
        case kMassOverArea:
            if ((currentUnit === kMassOverAreaKilogramsPHectare)) {
                result = kMassOverAreaOuncesPSquareFoot
            } else {
                result = currentUnit - 1
            }
            break
        case kRadiation:
            if ((currentUnit === kRadiationMegaJoulesPSquareMeter)) {
                result = kRadiationCaloriesPerSquareFoot
            } else {
                result = currentUnit - 1
            }
            break
        case kVolume:
            if ((currentUnit === kVolumeMilliliters)) {
                result = kVolumeOunces
            } else {
                result = currentUnit - 1
            }
            break
        case kDepthOfWater:
            if ((currentUnit === kDepthOfWaterInches)) {
                // same as next 
                result = kDepthOfWaterMillimeters
            } else {
                result = kDepthOfWaterInches
            }
            break
        case kVelocity:
            if ((currentUnit === kVelocityMetersPSecond)) {
                result = kVelocityInchesPHour
            } else {
                result = currentUnit - 1
            }
            break
        case kPressure:
            if ((currentUnit === kPressurePascals)) {
                result = kPressurePoundsPSquareInch
            } else {
                result = currentUnit - 1
            }
            break
        case kDensity:
            if ((currentUnit === kDensityGramsPCubicCentimeter)) {
                result = kDensityPoundsPAcreFoot
            } else {
                result = currentUnit - 1
            }
            break
        case kConcentration:
            if ((currentUnit === kConcentrationGramsPMetricTon)) {
                result = kConcentrationOuncesPEnglishTon
            } else {
                result = currentUnit - 1
            }
            break
        default:
            // non-changing unit set 
            result = currentUnit
            break
    }
    return result
}

function GetUnitSetString(unitSet: int): string {
    let result = ""
    switch (unitSet) {
        case kDimensionless:
            result = "kDimensionless"
            break
        case kLength:
            result = "kLength"
            break
        case kObsoleteLength:
            result = "kObsoleteLength"
            break
        case kAngle:
            result = "kAngle"
            break
        case kTemperature:
            result = "kTemperature"
            break
        case kMass:
            result = "kMass"
            break
        case kObsoleteMass:
            result = "kObsoleteMass"
            break
        case kArea:
            result = "kArea"
            break
        case kMassOverArea:
            result = "kMassOverArea"
            break
        case kRadiation:
            result = "kRadiation"
            break
        case kVolume:
            result = "kVolume"
            break
        case kDepthOfWater:
            result = "kDepthOfWater"
            break
        case kVelocity:
            result = "kVelocity"
            break
        case kPressure:
            result = "kPressure"
            break
        case kDensity:
            result = "kDensity"
            break
        case kConcentration:
            result = "kConcentration"
            break
        case kNonChangingUnitHundredsOfMolesPKilogram:
            result = "kNonChangingUnitHundredsOfMolesPKilogram"
            break
        case kNonChangingUnitKilogramsPHectarePMegaJoulePSquareMeter:
            result = "kNonChangingUnitKilogramsPHectarePMegaJoulePSquareMeter"
            break
        case kNonChangingUnitKiloPascalPDegreeC:
            result = "kNonChangingUnitKiloPascalPDegreeC"
            break
        case kNonChangingUnitMegaJoulePKilogram:
            result = "kNonChangingUnitMegaJoulePKilogram"
            break
        case kNonChangingUnitKilogramPKilogram:
            result = "kNonChangingUnitKilogramPKilogram"
            break
        case kNonChangingUnitMetersPMeter:
            result = "kNonChangingUnitMetersPMeter"
            break
        case kNonChangingUnitYears:
            result = "kNonChangingUnitYears"
            break
        case kNonChangingUnitDays:
            result = "kNonChangingUnitDays"
            break
        case kNonChangingUnitHours:
            result = "kNonChangingUnitHours"
            break
        case kNonChangingUnitPartsPMillion:
            result = "kNonChangingUnitPartsPMillion"
            break
        case kNonChangingUnitFraction:
            result = "kNonChangingUnitFraction"
            break
        case kNonChangingUnitPercent:
            result = "kNonChangingUnitPercent"
            break
        case kNonChangingUnitGramsPMetricTon:
            result = "kNonChangingUnitGramsPMetricTon"
            break
        case kNonChangingUnitCubicMetersPSecond:
            result = "kNonChangingUnitCubicMetersPSecond"
            break
        case kNonChangingUnitBoolean:
            result = "kNonChangingUnitBoolean"
            break
        default:
            result = ""
            throw new GeneralException.create("Problem: Unsupported unit set " + IntToStr(unitSet) + " in method GetUnitSetString.")
            break
    }
    return result
}

function DisplayUnitSetString(unitSet: int): string {
    let result = ""
    switch (unitSet) {
        case kDimensionless:
            result = "(no unit)"
            break
        case kLength:
            result = "length (e.g., m)"
            break
        case kObsoleteLength:
            result = "length (e.g., m)"
            break
        case kAngle:
            result = "angle (degrees or radians)"
            break
        case kTemperature:
            result = "temperature (degrees C or F)"
            break
        case kMass:
            result = "mass (e.g., kg)"
            break
        case kObsoleteMass:
            result = "mass (e.g., kg)"
            break
        case kArea:
            result = "area (e.g., m2)"
            break
        case kMassOverArea:
            result = "mass over area (e.g., kg/ha)"
            break
        case kRadiation:
            result = "radiation (e.g., MJ/m2)"
            break
        case kVolume:
            result = "volume (e.g., liters)"
            break
        case kDepthOfWater:
            result = "depth of liquid (e.g., mm H20)"
            break
        case kVelocity:
            result = "velocity (e.g., mm/hr)"
            break
        case kPressure:
            result = "pressure (e.g. kPa)"
            break
        case kDensity:
            result = "density (e.g., g/cm3)"
            break
        case kConcentration:
            result = "concentration (e.g., g/t)"
            break
        case kNonChangingUnitHundredsOfMolesPKilogram:
            result = "cmol/kg"
            break
        case kNonChangingUnitKilogramsPHectarePMegaJoulePSquareMeter:
            result = "MJ/m2"
            break
        case kNonChangingUnitKiloPascalPDegreeC:
            result = "kPa/deg C"
            break
        case kNonChangingUnitMegaJoulePKilogram:
            result = "MJ/kg"
            break
        case kNonChangingUnitKilogramPKilogram:
            result = "kg/kg"
            break
        case kNonChangingUnitMetersPMeter:
            result = "m/m"
            break
        case kNonChangingUnitYears:
            result = "years"
            break
        case kNonChangingUnitDays:
            result = "days"
            break
        case kNonChangingUnitHours:
            result = "hours"
            break
        case kNonChangingUnitPartsPMillion:
            result = "ppm"
            break
        case kNonChangingUnitFraction:
            result = "fraction"
            break
        case kNonChangingUnitPercent:
            result = "percent"
            break
        case kNonChangingUnitGramsPMetricTon:
            result = "g/t"
            break
        case kNonChangingUnitCubicMetersPSecond:
            result = "m3/sec"
            break
        case kNonChangingUnitBoolean:
            result = "yes/no"
            break
        default:
            result = ""
            throw new GeneralException.create("Problem: Unsupported unit set " + IntToStr(unitSet) + " in method DisplayUnitSetString.")
            break
    }
    return result
}

function GetLastUnitEnumInUnitSet(unitSet: int): int {
    let result = 0
    switch (unitSet) {
        case kDimensionless:
            result = 2
            break
        case kLength:
            result = kLengthLastUnit
            break
        case kObsoleteLength:
            result = kLengthLastUnit
            break
        case kAngle:
            result = kAngleLastUnit
            break
        case kTemperature:
            result = kTemperatureLastUnit
            break
        case kMass:
            result = kMassLastUnit
            break
        case kObsoleteMass:
            result = kMassLastUnit
            break
        case kArea:
            result = kAreaLastUnit
            break
        case kMassOverArea:
            result = kMassOverAreaLastUnit
            break
        case kRadiation:
            result = kRadiationLastUnit
            break
        case kVolume:
            result = kVolumeLastUnit
            break
        case kDepthOfWater:
            result = kDepthOfWaterLastUnit
            break
        case kVelocity:
            result = kVelocityLastUnit
            break
        case kPressure:
            result = kPressureLastUnit
            break
        case kDensity:
            result = kDensityLastUnit
            break
        case kConcentration:
            result = kConcentrationLastUnit
            break
        default:
            result = 2
            break
    }
    return result
}

function unitIsMetric(unitSetEnum: int, unitEnum: int): boolean {
    let result = false
    result = false
    switch (unitSetEnum) {
        case kDimensionless:
            result = false
            break
        case kLength:
            switch (unitEnum) {
                case kLengthMicrons:
                    result = true
                    break
                case kLengthMillimeters:
                    result = true
                    break
                case kLengthCentimeters:
                    result = true
                    break
                case kLengthMeters:
                    result = true
                    break
                case kLengthKilometers:
                    result = true
                    break
            }
            break
        case kAngle:
            result = true
            break
        case kTemperature:
            if (unitEnum === kTemperatureDegreesC) {
                result = true
            }
            break
        case kMass:
            switch (unitEnum) {
                case kMassMilligrams:
                    result = true
                    break
                case kMassGrams:
                    result = true
                    break
                case kMassKilograms:
                    result = true
                    break
                case kMassMetricTons:
                    result = true
                    break
            }
            break
        case kArea:
            switch (unitEnum) {
                case kAreaHectares:
                    result = true
                    break
                case kAreaSquareMeters:
                    result = true
                    break
                case kAreaSquareKilometers:
                    result = true
                    break
            }
            break
        case kMassOverArea:
            switch (unitEnum) {
                case kMassOverAreaKilogramsPHectare:
                    result = true
                    break
                case kMassOverAreaMetricTonsPHectare:
                    result = true
                    break
                case kMassOverAreaKilogramsPSquareMeter:
                    result = true
                    break
                case kMassOverAreaGramsPSquareMeter:
                    result = true
                    break
                case kMassOverAreaGramsPSquareCentimeter:
                    result = true
                    break
            }
            break
        case kRadiation:
            switch (unitEnum) {
                case kRadiationMegaJoulesPSquareMeter:
                    result = true
                    break
                case kRadiationKilowattHoursPSquareMeter:
                    result = true
                    break
                case kRadiationCaloriesPerSquareMeter:
                    result = true
                    break
                case kRadiationLangleys:
                    result = true
                    break
            }
            break
        case kVolume:
            switch (unitEnum) {
                case kVolumeMilliliters:
                    result = true
                    break
                case kVolumeLiters:
                    result = true
                    break
                case kVolumeCubicMeters:
                    result = true
                    break
            }
            break
        case kDepthOfWater:
            if (unitEnum === kDepthOfWaterMillimeters) {
                result = true
            }
            break
        case kVelocity:
            switch (unitEnum) {
                case kVelocityMetersPSecond:
                    result = true
                    break
                case kVelocityMillimetersPHour:
                    result = true
                    break
            }
            break
        case kPressure:
            switch (unitEnum) {
                case kPressurePascals:
                    result = true
                    break
                case kPressureKilopascals:
                    result = true
                    break
                case kPressureMegapascals:
                    result = true
                    break
                case kPressureKilogramsPSquareCentimeter:
                    result = true
                    break
            }
            break
        case kDensity:
            switch (unitEnum) {
                case kDensityGramsPCubicCentimeter:
                    result = true
                    break
                case kDensityKilogramsPCubicMeter:
                    result = true
                    break
                case kDensityMetricTonsPCubicMeter:
                    result = true
                    break
            }
            break
        case kConcentration:
            switch (unitEnum) {
                case kConcentrationGramsPMetricTon:
                    result = true
                    break
                case kConcentrationGramsPKilogram:
                    result = true
                    break
                case kConcentrationMilligramsPMetricTon:
                    result = true
                    break
            }
            break
        case kNonChangingUnitHundredsOfMolesPKilogram:
            result = true
            break
        case kNonChangingUnitKilogramsPHectarePMegaJoulePSquareMeter:
            result = true
            break
        case kNonChangingUnitKiloPascalPDegreeC:
            result = true
            break
        case kNonChangingUnitMegaJoulePKilogram:
            result = true
            break
        case kNonChangingUnitKilogramPKilogram:
            result = true
            break
        case kNonChangingUnitMetersPMeter:
            result = true
            break
        case kNonChangingUnitGramsPMetricTon:
            result = true
            break
        case kNonChangingUnitCubicMetersPSecond:
            result = true
            break
    }
    return result
}


