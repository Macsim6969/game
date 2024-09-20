import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'game', loadChildren: () => import('./modules/home/home.module').then((m) => m.HomeModule) },
  { path: '**', redirectTo: '/game'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
