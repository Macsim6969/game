import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { InitGameServcie } from './@shared/services/initGame.service';
import { StartPopupComponent } from './@shared/components/start-popup/start-popup.component';
import { PopupGameServcie } from './@shared/services/popupGame.service';
import { PopupFinishGameServcie } from './@shared/services/popupFinishGame.service';
import { FinishPopupComponent } from './@shared/components/finish-popup/finish-popup.component';

const routes: Routes = [
  { path: '', component: HomeComponent }
]

@NgModule({
  declarations: [
    HomeComponent,
    StartPopupComponent,
    FinishPopupComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    HomeComponent
  ],
  providers: [
    InitGameServcie,
    PopupGameServcie,
    PopupFinishGameServcie
  ]
})
export class HomeModule { }
