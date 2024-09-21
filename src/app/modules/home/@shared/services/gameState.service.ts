import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { PopupFinishGameServcie } from './popupFinishGame.service';


@Injectable()

export class GameStateService {
  private occupiedBlocks: Set<number> = new Set<number>();

  constructor(
    private popupFinishGame: PopupFinishGameServcie
  ) { }

  public checkWhoseWin(playerScore: number, computerScore: number) {
    if (playerScore >= 10) {
      this.popupFinishGame._winStatus = { isWin: 'User', PCScored: computerScore, UserScored: playerScore };
    } else if (computerScore >= 10) {
      this.popupFinishGame._winStatus = { isWin: 'PC', PCScored: computerScore, UserScored: playerScore };
    }
  }

  public getAvailableIndices(allArray: ElementRef[]): number[] {
    return allArray
      .map((_, index) => index)
      .filter(index => !this.occupiedBlocks.has(index));
  }

  public resetBlocks(allArray: ElementRef[], renderer: Renderer2): void {
    allArray.forEach(block => {
      renderer.removeClass(block.nativeElement, 'random-class');
      renderer.removeClass(block.nativeElement, 'red');
      renderer.removeClass(block.nativeElement, 'green');
    });
    this.occupiedBlocks.clear();
  }
}
