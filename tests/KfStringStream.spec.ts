import * as o from "ospec"
import { KfStringStream } from "../source/KfStringStream"

o.spec("KfStringStream", () => {

    o("test", () => {
        const stream = new KfStringStream("test 1 2.0 3 done")
        let token
        token = stream.nextToken()
        o(token).equals("test")
        token = stream.nextToken()
        o(token).equals("1")
        token = stream.parseFloat()
        o(token).equals(2.0)
        token = stream.nextInteger()
        o(token).equals(3)
        const match = stream.match("do")
        o(match).equals(true)
        token = stream.nextToken()
        o(token).equals("done")
        const isEmpty = stream.empty()
        o(isEmpty).equals(true)
        token = stream.nextToken()
        o(token).equals("")
    })

})
