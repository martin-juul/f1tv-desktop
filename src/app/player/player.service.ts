import { Injectable } from '@angular/core';
import { DataStorageService } from '../shared/services/data-storage.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {

  constructor(private dataStorageService: DataStorageService) {
  }

  public async getPlaylist(uri: string): Promise<{ playlist: string }> {
    return this.dataStorageService.getStream(uri);
  }

  public getDefaultAudio() {
    return localStorage.getItem('default_lang');
  }

  public setDefaultAudio(lang: string) {
    localStorage.setItem('default_lang', lang);
  }
}
