import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataStorageService } from './services/data-storage.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ElectronService } from './services/electron.service';
import { WebviewDirective } from './directives/webview.directive';

const DIRECTIVES = [
  WebviewDirective,
];

const MODULES = [
  CommonModule,
  FormsModule,
  HttpClientModule,
];

const PROVIDERS = [
  DataStorageService,
  ElectronService,
];

@NgModule({
  declarations: [
    ...DIRECTIVES,
  ],
  imports: [
    ...MODULES,
  ],
  exports: [
    ...MODULES,
    ...DIRECTIVES,
  ],
  providers: [
    ...PROVIDERS,
  ],
})
export class SharedModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [...PROVIDERS],
    };
  }
}
