import { Injectable } from '@angular/core';
import { PopupFinishGameServcie } from './popupFinishGame.service';


@Injectable()

export class GameStateService {

  constructor(
    private popupFinishGame: PopupFinishGameServcie
  ) { }

  public checkWhoseWin(playerScore: number, computerScore: number) {
    if (playerScore >= 10) {
      this.popupFinishGame._isWinData = { isWin: 'User', PCScored: computerScore, UserScored: playerScore };
    } else if (computerScore >= 10) {
      this.popupFinishGame._isWinData = { isWin: 'PC', PCScored: computerScore, UserScored: playerScore };
    }
  }
}
