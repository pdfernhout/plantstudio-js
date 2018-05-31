// PdRandom from unit Urandom

import { PdStreamableObject, PdClassAndVersionInformationRecord, PdFiler } from "./temporary"
import { long, short, byte, float, int, intround } from "./common"
import { max, min } from "./umath"
import { ClassId } from "./uclasses"

export class PdRandom extends PdStreamableObject {
    // long type is a 32-bit signed Integer -2147483648 to 2147483647
    seed: long = 0
    
    constructor() {
        super()
        this.seed = this.randomSeedFromTime()
    }
    
    setSeed(aSeed: long): void {
        this.seed = aSeed
    }
    
    setSeedFromSmallint(aSeed: short): void {
        // same as setSeed but making conversion here from smallint to longint
        this.seed = aSeed
    }
    
    randomSeedFromTime(): long {
        var date = new Date();
        let Year: byte = date.getFullYear() % 100
        let Month: byte = date.getMonth()
        let Day: byte = date.getDate()
        let Hour: byte = date.getHours()
        let Min: byte = date.getMinutes()
        let Sec: byte = date.getSeconds()
        let MSec: byte = date.getMilliseconds()
        
        // was (Hour * 24 * 60 * 60 * 100) + 
        const result = 1 * Hour * 24 * 60 * 60 + 1 * Min * 60 * 60 * 100 + 1 * Sec * 100 + 1 * MSec
        return result
    }
    
    randomSmallintSeedFromTime(): short {
        // short is 2 bytes -32,768 to 32,767
        var date = new Date();
        let Sec: byte = date.getSeconds()
        let MSec: byte = date.getMilliseconds()
        
        let result = 1 * Sec * 100 + 1 * MSec
        // so things too close in time are not too similar, modify it randomly 
        result = intround(result * this.zeroToOne())
        return result
    }
    
    initialize(aLong: long): void {
        this.seed = aLong
    }
    
    randomNormalWithStdDev(mean: float, stdDev: float): float {
        let randomNumber: float = 0.0
        for (let i = 1; i <= 12; i++) {
            randomNumber = randomNumber + this.zeroToOne()
        }
        const result = (randomNumber - 6.0) * stdDev + mean
        return result
    }
    
    randomNormal(mean: float): float {
        // return normal random number based on mean (and std dev of half mean)
        let randomNumber: float = 0.0
        for (let i = 1; i <= 12; i++) {
            randomNumber = randomNumber + this.zeroToOne()
        }
        const result = (randomNumber - 6.0) * (mean / 2.0) + mean
        return result
    }
    
    randomNormalBoundedZeroToOne(mean: float): float {
        //return normal random number based on mean (and std dev of half mean)
        const result = max(0.0, (min(1.0, (this.randomNormal(mean)))))
        return result
    }
    
    randomNormalPercent(mean: float): float {
        // return normal random number based on mean (and std dev of half mean) bounded at 0 and 100
        const result = max(0, (min(100, intround(this.randomNormal(mean / 100.0) * 100.0))))
        return result
    }
    
    randomPercent(): float {
        const k: float = intround(this.seed / 127773)
        this.seed = intround((16807 * (this.seed - (k * 127773))) - (k * 2846))
        if ((this.seed < 0.0)) {
            this.seed = this.seed + 2147483647
        }
        const result = intround(max(0, (min(100, (this.seed * 0.0000000004656612875 * 100.0)))))
        return result
    }
    
    zeroToOne(): float {
        const k: float = intround(this.seed / 127773)
        this.seed = intround((16807 * (this.seed - (k * 127773))) - (k * 2846))
        if ((this.seed < 0.0)) {
            this.seed = this.seed + 2147483647
        }
        const result: float = (max(0.0, (min(1.0, (this.seed * 0.0000000004656612875))))) * 1.0
        return result
    }
    
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.KPdRandom
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        this.seed = filer.streamLongint(this.seed)
    }
    
}
