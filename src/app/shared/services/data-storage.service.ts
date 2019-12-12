import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Season } from './data-storage.interfaces';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  private readonly _baseUrl = environment.API_BASE_URL;

  constructor(private http: HttpClient) {
  }

  public getSeasons(): Observable<Season[]> {
    return this.http.get<Season[]>(`${this._baseUrl}/formula-one/seasons`);
  }

  public getStream(uri: string): Promise<{ playlist: string }> {
    return this.http.get<{ playlist: string }>(`${this._baseUrl}/formula-one/stream-by-uri`, {
      params: {uid: uri},
    }).toPromise();
  }
}
