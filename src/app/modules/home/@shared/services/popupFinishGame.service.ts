import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface winData {
  isWin: 'PC' | 'User';
  PCScored: number;
  UserScored: number

}
@Injectable()

export class PopupFinishGameServcie {
  private isFinishPopupSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isWinSubject: BehaviorSubject<winData> = new BehaviorSubject<winData>(null);
  private isRestartGame: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  set _isFinishPopup(newValue: boolean) {
    this.isFinishPopupSubject.next(newValue);
  }

  get _isFinishPopup$(): Observable<boolean> | BehaviorSubject<boolean> {
    return this.isFinishPopupSubject;
  }

  set _winStatus(newValue: winData) {
    this.isWinSubject.next(newValue);
  }

  get _winStatus$() {
    return this.isWinSubject;
  }

  set _restartGame(newValue: boolean) {
    this.isRestartGame.next(newValue);
  }

  get _restartGame$() {
    return this.isRestartGame;
  }

}