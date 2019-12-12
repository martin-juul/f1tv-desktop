import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeasonService } from '../season/season.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  public seasons: number[];
  private subscriptions: Subscription[] = [];

  constructor(private seasonService: SeasonService) {
  }

  ngOnInit() {
    this.subscriptions.push(this.seasonService.seasons$.subscribe(s => {
      this.seasons = s.map(x => x.year);
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
