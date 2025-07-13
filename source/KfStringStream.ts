import { long, StrToIntDef, float, StrToFloat } from "./common"

// KfStringStream was unit Usstream

// usstream: String stream. Used by text filer (ufilertx) to parse strings,
// usually those associated with points or arrays (because there are delimiters inside
// the string in these cases). Also used by 3d object (in uturt3d) to read strings from tdo file.

/* TODO: Use or remove skipToProfileSection
function skipToProfileSection(fileStream: TextFile, section: string): boolean {
    let result = false
    let inputLine: string
    let stream: KfStringStream
    
    stream = KfStringStream.create
    //set separator to ']' so can read sections
    stream.separator = "]"
    result = false
    while (!eof(fileStream)) {
        UNRESOLVED.readln(fileStream, inputLine)
        stream.onString(inputLine)
        stream.skipSpaces()
        if (stream.nextCharacter() === "[") {
            if (stream.nextToken() === section) {
                result = true
                break
            }
        }
    }
    stream.free
    return result
}
*/

export class KfStringStream {
    source: string = ""
    remainder: string = ""
    separator: string = " "
    
    constructor(aString: string = "", separator = " ") {
        this.onStringSeparator(aString, separator)
    }
    
    onString(aString: string): void {
        this.source = aString
        this.remainder = aString
    }
    
    onStringSeparator(aString: string, aSeparator: string): void {
        this.source = aString
        this.remainder = aString
        this.separator = aSeparator
    }
    
    spaceSeparator(): void {
        this.separator = " "
    }
    
    skipSpaces(): void {
        // TODO: This loop could be more efficient using indexOf or regex
        while (this.remainder.substring(0, 1) === " ") {
            this.remainder = this.remainder.substring(1)
        }
    }
    
    nextToken(): string {
        let result = ""

        this.skipSpaces()
        const location: long = this.remainder.indexOf(this.separator)
        if (location !== -1) {
            result = this.remainder.substring(0, location)
            this.remainder = this.remainder.substring(location + this.separator.length)
        } else {
            result = this.remainder
            this.remainder = ""
        }
        return result
    }
    
    nextInteger(): long {
        let result = 0
        let token: string
        
        token = this.nextToken()
        result = StrToIntDef(token, 0)
        return result
    }
    
    parseFloat(): float {
        let result = 0.0
        const token: string = this.nextToken()
        try {
            result = StrToFloat(token)
            // TODO: Should parseFloat return 0 is NaN?
        } catch (e) {
            result = 0.0
        }
        return result
    }
    
    nextCharacter(): string {
        const result: string = this.remainder[0]
        this.remainder = this.remainder.substring(1)
        return result
    }
    
    // return true if next few characters match string
    match(aString: string): boolean {
        return this.remainder.indexOf(aString) === 0
    }
    
    skipWhiteSpace(): void {
        // skips spaces or tabs
        while ((this.remainder[0] === " ") || (this.remainder[0] === "\t")) {
            this.remainder = this.remainder.substring(1)
        }
    }
    
    empty(): boolean {
        return (this.remainder === "")
    }
    
}

