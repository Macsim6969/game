import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";


@Injectable()

export class PopupGameServcie {
  private isOpenPopupSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  set _isOpenPopup(newValue: boolean) {
    this.isOpenPopupSubject.next(newValue);
  }

  get _isOpenPopup$(): Observable<boolean> | BehaviorSubject<boolean> {
    return this.isOpenPopupSubject;
  }
}