import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable()

export class InitGameServcie {
  private _initStartCountBlockGame: number = 100;
 
  get initCountBlockGame(): number {
    return this._initStartCountBlockGame;
  }
}