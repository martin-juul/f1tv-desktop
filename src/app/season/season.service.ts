import { Injectable } from '@angular/core';
import { Season } from '../shared/services/data-storage.interfaces';
import { BehaviorSubject } from 'rxjs';
import { DataStorageService } from '../shared/services/data-storage.service';

@Injectable({
  providedIn: 'root',
})
export class SeasonService {
  private _seasons = new BehaviorSubject<Season[]>([]);
  public readonly seasons$ = this._seasons.asObservable();

  constructor(private dataStorageService: DataStorageService) {
    this.loadData();
  }

  public loadData() {
    this.dataStorageService.getSeasons().subscribe(s => this._seasons.next(s));
  }
}
