import { Component, OnInit, Input } from '@angular/core';
import { Season } from '../../../shared/services/data-storage.interfaces';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-season-item',
  templateUrl: './season-item.component.html',
  styleUrls: ['./season-item.component.scss']
})
export class SeasonItemComponent implements OnInit {
  @Input() season: Season;
  public readonly ASSET_BASE_URL = environment.ASSET_BASE_URL;
  public currentDate: Date;

  constructor() {}

  ngOnInit() {
    this.currentDate = new Date();
  }

  inDateRange(item) {
    const itemDate = new Date(item);

    return itemDate.valueOf() <= this.currentDate.valueOf();
  }

}
