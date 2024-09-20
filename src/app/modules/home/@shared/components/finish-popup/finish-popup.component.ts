import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { PopupFinishGameServcie, winData } from '../../services/popupFinishGame.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-finish-popup',
  templateUrl: './finish-popup.component.html',
  styleUrl: './finish-popup.component.scss'
})
export class FinishPopupComponent implements OnInit, OnDestroy {
  public winData: string;
  public playerScored: number;
  public PCScored: number;

  private winDataSubscription: Subscription;

  constructor(
    private popupFinishGame: PopupFinishGameServcie
  ) { }

  ngOnInit(): void {
    this.initPopupFinishService();
  }

  private initPopupFinishService() {
    this.winDataSubscription = this.popupFinishGame._isWinData$.subscribe((data: winData) => {
      this.winData = data.isWin;
      this.playerScored = data.UserScored;
      this.PCScored = data.PCScored;
    });
  }

  public restartGame() {
    this.popupFinishGame._isFinishPopup = false;
    this.popupFinishGame._restartGame = true;
  }

  ngOnDestroy(): void {
    this.winDataSubscription ? this.winDataSubscription.unsubscribe() : null;
  }

}
