// unit Urandom

from conversion_common import *
import uclasses
import umath
import ufiler
import delphi_compatability


export class PdRandom {
    seed: long = 0
    PdRandom.prototype = new PdStreamableObject()
    PdRandom.prototype.constructor = PdRandom
    
    createFromTime(): void {
        this.create()
        this.seed = this.randomSeedFromTime()
    }
    
    setSeed(aSeed: long): void {
        this.seed = aSeed
    }
    
    setSeedFromSmallint(aSeed: short): void {
        //same as setSeed but making conversion here from smallint to longint
        this.seed = aSeed
    }
    
    randomSeedFromTime(): long {
        let result = 0
        let Present: TDateTime
        let Year: byte
        let Month: byte
        let Day: byte
        let Hour: byte
        let Min: byte
        let Sec: byte
        let MSec: byte
        let longintVar: long
        
        Present = UNRESOLVED.Now
        UNRESOLVED.DecodeDate(Present, Year, Month, Day)
        UNRESOLVED.DecodeTime(Present, Hour, Min, Sec, MSec)
        // was (Hour * 24 * 60 * 60 * 100) + 
        longintVar = 1
        result = longintVar * Hour * 24 * 60 * 60 + longintVar * Min * 60 * 60 * 100 + longintVar * Sec * 100 + longintVar * MSec
        return result
    }
    
    randomSmallintSeedFromTime(): short {
        let result = 0
        let Present: TDateTime
        let Year: byte
        let Month: byte
        let Day: byte
        let Hour: byte
        let Min: byte
        let Sec: byte
        let MSec: byte
        let smallintVar: short
        
        Present = UNRESOLVED.Now
        UNRESOLVED.DecodeDate(Present, Year, Month, Day)
        UNRESOLVED.DecodeTime(Present, Hour, Min, Sec, MSec)
        smallintVar = 1
        result = smallintVar * Sec * 100 + smallintVar * MSec
        // so things too close in time are not too similar, modify it randomly 
        result = intround(result * this.zeroToOne())
        return result
    }
    
    initialize(aLong: long): void {
        this.seed = aLong
    }
    
    randomNormalWithStdDev(mean: float, stdDev: float): float {
        let result = 0.0
        let randomNumber: float
        let i: int
        
        randomNumber = 0.0
        for (i = 1; i <= 12; i++) {
            randomNumber = randomNumber + this.zeroToOne()
        }
        result = (randomNumber - 6.0) * stdDev + mean
        return result
    }
    
    randomNormal(mean: float): float {
        let result = 0.0
        let randomNumber: float
        let i: int
        
        //return normal random number based on mean (and std dev of half mean)
        randomNumber = 0.0
        for (i = 1; i <= 12; i++) {
            randomNumber = randomNumber + this.zeroToOne()
        }
        result = (randomNumber - 6.0) * (mean / 2.0) + mean
        return result
    }
    
    randomNormalBoundedZeroToOne(mean: float): float {
        let result = 0.0
        //return normal random number based on mean (and std dev of half mean)
        result = umath.max(0.0, (umath.min(1.0, (this.randomNormal(mean)))))
        return result
    }
    
    randomNormalPercent(mean: float): float {
        let result = 0.0
        //return normal random number based on mean (and std dev of half mean) bounded at 0 and 100
        result = umath.max(0, (umath.min(100, intround(this.randomNormal(mean / 100.0) * 100.0))))
        return result
    }
    
    randomPercent(): float {
        let result = 0.0
        let k: float
        
        k = intround(this.seed / 127773)
        this.seed = intround((16807 * (this.seed - (k * 127773))) - (k * 2846))
        if ((this.seed < 0.0)) {
            this.seed = this.seed + 2147483647
        }
        result = intround(umath.max(0, (umath.min(100, (this.seed * 0.0000000004656612875 * 100.0)))))
        return result
    }
    
    zeroToOne(): float {
        let result = 0.0
        let k: float
        
        k = intround(this.seed / 127773)
        this.seed = intround((16807 * (this.seed - (k * 127773))) - (k * 2846))
        if ((this.seed < 0.0)) {
            this.seed = this.seed + 2147483647
        }
        result = (umath.max(0.0, (umath.min(1.0, (this.seed * 0.0000000004656612875))))) * 1.0
        return result
    }
    
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = uclasses.KPdRandom
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        this.seed = filer.streamLongint(this.seed)
    }
    
}

