import { Component, OnDestroy } from '@angular/core';
import { InitGameServcie } from './@shared/services/initGame.service';
import { OnInit } from '@angular/core';
import { PopupGameServcie } from './@shared/services/popupGame.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  public countBlockArray: number[];
  public isOpenPopup: boolean;

  private startGameSubscription: Subscription;
  constructor(
    private initGame: InitGameServcie,
    private popupGame: PopupGameServcie
  ) { }

  ngOnInit(): void {
    this.initGameService();
    this.streamToStartGame();
  }

  private initGameService() {
    this.countBlockArray = new Array(this.initGame.initCountBlockGame);
    console.log(this.countBlockArray);
  }

  private streamToStartGame() {
    this.startGameSubscription = this.popupGame._isOpenPopup$.subscribe((data: boolean) => {
      this.isOpenPopup = data;
    });
  }

  ngOnDestroy(): void {
    this.startGameSubscription ? this.startGameSubscription.unsubscribe() : null;
  }
}
