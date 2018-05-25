// unit Uexcept

from conversion_common import *
import delphi_compatability

function FailNil(anObject: TObject): void {
    if (anObject === null) {
        throw new GeneralException.create("Problem: Not enough memory to carry out that operation.")
    }
}

function FailNilPtr(aPointer: Pointer): void {
    if (aPointer === null) {
        throw new GeneralException.create("Problem: Not enough memory to carry out that operation.")
    }
}

function FailNilPChar(aPointer: "UNFINISHED_FIX_THIS_PCHAR_INIT"): void {
    if (aPointer === null) {
        throw new GeneralException.create("Problem: Not enough memory to carry out that operation.")
    }
}


