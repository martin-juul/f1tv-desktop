import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeasonService } from '../season.service';
import { Season } from '../../shared/services/data-storage.interfaces';
import { ActivatedRoute } from '@angular/router';
import { sortByDateDesc } from '../../shared/array.utils';

@Component({
  selector: 'app-season-list',
  templateUrl: './season-list.component.html',
  styleUrls: ['./season-list.component.scss'],
})
export class SeasonListComponent implements OnInit, OnDestroy {
  public season: number | null;
  public seasons: Season[] = [];
  private data: Season[] = [];
  private _subscriptions: Subscription[] = [];

  constructor(private seasonService: SeasonService,
              private route: ActivatedRoute) {
  }

  public ngOnInit() {
    const seasonSub = this.seasonService.seasons$
      .subscribe(seasons => {
        seasons = seasons.map(s => {
          s.raceWeekends = s.raceWeekends.sort(sortByDateDesc('startDate'));

          s.raceWeekends = s.raceWeekends.map(r => {
            // remove null sessions
            s.raceWeekends = s.raceWeekends.map(w => {
              w.sessions = w.sessions.filter(x => x);

              return w;
            });

            r.sessions = r.sessions.sort(sortByDateDesc('startTime'));

            return r;
          });

          return s;
        });

        this.data.push(...seasons);

        this.route.queryParamMap.subscribe((r) => {
          if (r.has('season')) {
            this.season = Number(r.get('season'));

            this.seasons = this.data.filter(x => x.year === this.season);
          } else {
            this.seasons = this.data.slice();
          }
        });
      });

    this._subscriptions.push(seasonSub);
  }

  public ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
  }
}
