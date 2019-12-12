import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ElectronService } from './shared/services/electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(private electron: ElectronService,
              private router: Router,
              private translate: TranslateService) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.subscription = this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        if (this.electron.isElectron()) {
          // prevent memory from blowing up
          this.electron.webFrame.clearCache();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
