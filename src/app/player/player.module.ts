import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PlayerRoutingModule } from './player-routing.module';

import { PlayerComponent } from './player.component';


@NgModule({
  declarations: [
    PlayerComponent,
  ],
  imports: [
    SharedModule,
    PlayerRoutingModule,
  ],
})
export class PlayerModule {
}
