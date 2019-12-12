import { ModuleWithProviders, NgModule } from '@angular/core';
import { SeasonListComponent } from './season-list/season-list.component';
import { SharedModule } from '../shared/shared.module';
import { SeasonRoutingModule } from './season-routing.module';
import { SeasonItemComponent } from './season-list/season-item/season-item.component';
import { SeasonService } from './season.service';

@NgModule({
  declarations: [
    SeasonListComponent,
    SeasonItemComponent,
  ],
  imports: [
    SharedModule,
    SeasonRoutingModule,
  ],
  providers: [
    SeasonService,
  ],
})
export class SeasonModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SeasonModule,
      providers: [SeasonService]
    };
  }
}
