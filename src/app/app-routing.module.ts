import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {path: '', loadChildren: './season/season.module#SeasonModule'},
  {path: 'player', loadChildren: './player/player.module#PlayerModule'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, enableTracing: false})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
