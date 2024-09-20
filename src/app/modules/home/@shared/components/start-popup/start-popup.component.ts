import { Component } from '@angular/core';
import { PopupGameServcie } from '../../services/popupGame.service';

@Component({
  selector: 'app-start-popup',
  templateUrl: './start-popup.component.html',
  styleUrl: './start-popup.component.scss'
})
export class StartPopupComponent {

  constructor(
    private popupGame: PopupGameServcie
  ) { }

  public startGame() {
    this.popupGame._isOpenPopup = false;
  }

}
