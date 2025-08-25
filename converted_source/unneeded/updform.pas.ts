// unit Updform

from conversion_common import *
import uhints
import delphi_compatability


export class PdForm {
    PdForm.prototype = new TForm()
    PdForm.prototype.constructor = PdForm
    
    create(anOwner: TComponent): void {
        TForm.prototype.create.call(this, anOwner)
        uhints.makeAllFormComponentsHaveHints(this)
    }
    
}

