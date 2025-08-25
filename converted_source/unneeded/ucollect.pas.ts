// unit Ucollect

from conversion_common import *
import ufiler
import delphi_compatability

export type TForEachProc = (each: TObject, data: TObject) => void
export type TFirstLastFunc = (each: TObject, data: TObject) => boolean
function addToListIfAbsent(list: TList, item: TObject): void {
    if (item === null) {
        return
    }
    if (list.IndexOf(item) < 0) {
        list.Add(item)
    }
}


export class TListCollection {
    TListCollection.prototype = new TList()
    TListCollection.prototype.constructor = TListCollection
    
    //note this should be virtual in TList but it isn't
    clear(): void {
        let i: int
        let temp: TObject
        
        if (this.Count > 0) {
            for (i = 0; i <= this.Count - 1; i++) {
                temp = this.Items[i]
                this.Items[i] = null
                temp.free
            }
        }
        TList.prototype.clear.call(this)
    }
    
    clearPointersWithoutDeletingObjects(): void {
        let i: int
        
        if (this.Count > 0) {
            for (i = 0; i <= this.Count - 1; i++) {
                this.Items[i] = null
            }
        }
        TList.prototype.clear.call(this)
    }
    
    Destroy(): void {
        //pdf - clear will be called twice since inherited destroy also clears - but minor problem
        this.clear()
        TList.prototype.Destroy.call(this)
    }
    
    ForEach(proc: TForEachProc, data: TObject): void {
        let i: int
        
        if (this.Count > 0) {
            for (i = 0; i <= this.Count - 1; i++) {
                proc(this.Items[i], data)
            }
        }
    }
    
    FirstThat(testFunc: TFirstLastFunc, data: TObject): TObject {
        let result = new TObject()
        let i: int
        
        result = null
        if (this.Count > 0) {
            for (i = 0; i <= this.Count - 1; i++) {
                if (testFunc(this.Items[i], data)) {
                    result = this.Items[i]
                    break
                }
            }
        }
        return result
    }
    
    LastThat(testFunc: TFirstLastFunc, data: TObject): TObject {
        let result = new TObject()
        let i: int
        
        result = null
        if (this.Count > 0) {
            for (i = this.Count - 1; i >= 0; i--) {
                if (testFunc(this.Items[i], data)) {
                    result = this.Items[i]
                    break
                }
            }
        }
        return result
    }
    
    streamUsingFiler(filer: PdFiler, classForCreating: PdStreamableObjectClass): void {
        let countOnStream: long
        let i: long
        let streamableObject: PdStreamableObject
        
        if (filer.isReading()) {
            this.clear()
            countOnStream = filer.streamLongint(countOnStream)
            if (countOnStream > 0) {
                this.SetCapacity(countOnStream)
                for (i = 0; i <= countOnStream - 1; i++) {
                    streamableObject = classForCreating.create
                    streamableObject.streamUsingFiler(filer)
                    this.Add(streamableObject)
                }
            }
            //filer is writing or counting
        } else {
            countOnStream = this.Count
            countOnStream = filer.streamLongint(countOnStream)
            if (countOnStream > 0) {
                for (i = 0; i <= countOnStream - 1; i++) {
                    streamableObject = ufiler.PdStreamableObject(this.Items[i])
                    streamableObject.streamUsingFiler(filer)
                }
            }
        }
    }
    
}

// functions for global clipboard transfer, not using
//    procedure copyToClipboard(classForCreating: PdStreamableObjectClass; format: word);
//    procedure getFromClipboard(classForCreating: PdStreamableObjectClass; format: word);
//
//procedure TListCollection.copyToClipboard(classForCreating: PdStreamableObjectClass; format: word);
//  var
//    memoryStream: TMemoryStream;
//    filer: PdFiler;
//    handleToBuffer: THandle;
//    pointerToBuffer: Pointer;
//  begin
//  memoryStream := TMemoryStream.create;
//  filer := PdFiler.createWithStream(memoryStream);
//  try
//    filer.setToWritingMode;
//    self.streamUsingFiler(filer, classForCreating);
//    handleToBuffer := GlobalAlloc(GMEM_MOVEABLE, memoryStream.size);
//    try
//      pointerToBuffer := GlobalLock(handleToBuffer);
//      try
//        System.Move(memoryStream.memory^, pointerToBuffer^, memoryStream.size);
//        Clipboard.setAsHandle(format, handleToBuffer);
//      finally
//        GlobalUnlock(handleToBuffer);
//      end;
//    except
//      GlobalFree(handleToBuffer);
//      raise;
//    end;
//  finally
//    memoryStream.free;
//    filer.free;
//  end;
//end;
//
//procedure TListCollection.getFromClipboard(classForCreating: PdStreamableObjectClass; format: word);
//  var
//    memoryStream : TMemoryStream;
//    filer: PdFiler;
//    handleToBuffer: THandle;
//    pointerToBuffer: Pointer;
//  begin
//  handleToBuffer := Clipboard.GetAsHandle(format);
//  if handleToBuffer <> 0 then begin
//    pointerToBuffer := GlobalLock(handleToBuffer);
//    if pointerToBuffer <> nil then begin
//      try
//        memoryStream := TMemoryStream.Create;
//        try
//          memoryStream.writeBuffer(pointerToBuffer^, GlobalSize(handleToBuffer));
//          memoryStream.position := 0;
//          filer := PdFiler.createWithStream(memoryStream);
//          filer.setToReadingMode;
//          self.streamUsingFiler(filer, classForCreating);
//        finally
//          memoryStream.free;
//          filer.free;
//        end;
//      finally
//        GlobalUnlock(handleToBuffer);
//      end;
//    end;
//  end;
//end;
//
