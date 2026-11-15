import * as o from "ospec"
import { TFileStream } from "../source/common"
import { replaceCommasWithPeriods, replacePunctuationWithUnderscores } from "../source/usupport"

o.spec("export stream", () => {
    o("patches a header and resumes at the logical end without allocating a gap", () => {
        const stream = new TFileStream("test.bin", TFileStream.fmCreate)
        stream.WriteBuffer([0, 0, 10, 20], 4)
        stream.Seek(0, TFileStream.soFromBeginning)
        stream.WriteBuffer([4, 0], 2)
        o(stream.Size).equals(4)
        stream.Seek(0, TFileStream.soFromEnd)
        o(stream.Position).equals(4)
        stream.WriteBuffer(30, 1)
        o(Array.from(stream.contents.slice(0, stream.Size))).deepEquals([4, 0, 10, 20, 30])
        stream.Seek(-2, TFileStream.soFromCurrent)
        o(stream.ReadBytes(2)).deepEquals([20, 30])
    })

    o("grows beyond the former one-million-byte limit and retains prior bytes", () => {
        const stream = new TFileStream("large.bin", TFileStream.fmCreate)
        const bytes = new Array(1000001).fill(42)
        bytes[0] = 17
        stream.WriteBuffer(bytes, bytes.length)
        stream.WriteBuffer(255, 1)
        o(stream.Size).equals(1000002)
        o(stream.contents[0]).equals(17)
        o(stream.contents[1000000]).equals(42)
        o(stream.contents[1000001]).equals(255)
    })

    o("retains the first and last characters in export identifiers and decimal strings", () => {
        o(replacePunctuationWithUnderscores("A leaf-2!")).equals("A_leaf_2_")
        o(replacePunctuationWithUnderscores("")).equals("")
        o(replaceCommasWithPeriods("1,25")).equals("1.25")
        o(replaceCommasWithPeriods("7")).equals("7")
    })
})
