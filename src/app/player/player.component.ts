import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from './player.service';
import { Subscription } from 'rxjs';
import * as Hls from 'hls.js';
import { environment } from '../../environments/environment';
import { type } from 'os';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('container', {static: true}) containerRef: ElementRef<HTMLDivElement>;
  @ViewChild('video', {static: true}) videoRef: ElementRef<HTMLVideoElement>;
  @ViewChild('controls', {static: true}) controlsRef: ElementRef<HTMLDivElement>;
  @ViewChild('progress', {static: true}) progressRef: ElementRef<HTMLProgressElement>;

  public poster: string = null;
  public isPlaying = false;
  public isFullscreen = false;

  public currentTime = 0;
  public duration: number;

  public loading = true;

  // Control states
  public playPauseState = 'pause';
  public muteState = 'unmute';
  public progressState: number;

  public displayAudioOptions = false;
  public displayQualityOptions = false;

  public currentTrack: AudioTrack;
  public currentQuality: Hls.Level;

  public audioTracks: AudioTrack[] = [];
  public qualityLevels: Hls.Level[] = [];

  private _videoElement: HTMLVideoElement;

  private _subscription: Subscription;
  private _hls: Hls;
  private _uri: string;

  private _mouseOnPlayer = false;
  private _mouseMoveTimer = setTimeout(this.hideControls, 1000);

  constructor(private playerService: PlayerService,
              private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private cdr: ChangeDetectorRef) {
  }

  public ngOnInit() {
    this._videoElement = this.videoRef.nativeElement;

    this._videoElement.controls = false;

    this._subscription = this.route.queryParams.subscribe(async (params) => {
      const uri = params['uri'];
      const image = params['image'];

      if (uri) {
        this._uri = uri;

        this.playerService.getPlaylist(uri)
          .then((res) => this.setupPlayer(res.playlist))
          .catch(console.error);
      }

      if (image) {
        this.poster = environment.ASSET_BASE_URL + '/' + image;
      }
    });
  }

  public videoOnLoadedMetadata() {
    this.cdr.detach();

    this.duration = this._videoElement.duration;
    this.audioTracks = this._hls.audioTracks;
    this.qualityLevels = this._hls.levels;

    const audioIndex = this.getAudioIndex();
    this.setAudioTrack(this.audioTracks[audioIndex], false);

    this.currentQuality = this._hls.levels[this._hls.levels.length - 1];

    this.cdr.reattach();

    this.togglePlayPause();
  }

  private getAudioIndex() {
    let audioIndex = this.getAudioTrackByName('English');
    const defaultAudio = this.playerService.getDefaultAudio();
    if (defaultAudio) {
      const idx = this.getAudioTrackByName(defaultAudio);

      if (idx) {
        audioIndex = idx;
      }
    }
    return audioIndex;
  }

  public getAudioTrackByName(name: string) {
    // @ts-ignore
    return this._hls.audioTracks.findIndex(x => x.name === name);
  }

  public ngAfterViewInit(): void {
    this._hls = new Hls();
    this._hls.attachMedia(this._videoElement);
  }

  // Container
  public onMouseMove() {
    if (this._mouseOnPlayer) {
      this.displayControls();
    }

    clearTimeout(this._mouseMoveTimer);
    this._mouseMoveTimer = setTimeout(this.hideControls, 1000);
  }

  public onLoadStart() {
    this.loading = true;
  }

  public onCanPlay() {
    this.loading = false;
  }

  // Controls animations
  public onMouseOver() {
    this.controlsRef.nativeElement.classList.add('display-control');
  }

  public onMouseEnter() {
    this._mouseOnPlayer = true;
  }

  public onMouseOut() {
    this.hideControls();
  }

  public getQualityLevels() {
    return this.qualityLevels.slice().sort(((a, b) => {
      return b.height - a.height;
    }));
  }

  // Controls

  public togglePlayPause() {
    if (!this._videoElement) {
      return;
    }

    if (this._videoElement.paused || this._videoElement.ended) {
      this._videoElement.play()
        .then(() => {
          this.isPlaying = true;
          this.playPauseState = 'play';
        })
        .catch((e) => console.error('[Player]: error while trying to pause', e));
    } else {
      this._videoElement.pause();
      this.isPlaying = false;
      this.playPauseState = 'pause';
    }
  }

  public toggleMute() {
    const isMuted = this._videoElement.muted;
    if (isMuted) {
      this.muteState = 'mute';
    } else {
      this.muteState = 'unmuted';
    }

    this._videoElement.muted = !isMuted;
  }

  public toggleFullScreen() {
    if (!this.isFullscreen) {
      // @ts-ignore
      this.containerRef.nativeElement.webkitRequestFullScreen();
      this.isFullscreen = true;
    } else {
      // @ts-ignore
      document.webkitCancelFullScreen();
      this.isFullscreen = false;
    }
  }

  public toggleAudioOptions() {
    this.displayAudioOptions = !this.displayAudioOptions;
  }

  public toggleQualityOptions() {
    this.displayQualityOptions = !this.displayQualityOptions;
  }

  public scrubProgress(e: MouseEvent) {
    const progress = this.progressRef.nativeElement;
    const container = this.containerRef.nativeElement;
    // @ts-ignore
    const pos = (e.pageX - (progress.offsetLeft + progress.offsetParent.offsetLeft + container.offsetLeft)) / progress.offsetWidth;

    this._videoElement.currentTime = pos * this.duration;
  }

  public setAudioTrack(track: AudioTrack, toggle = true) {
    const idx = this._hls.audioTracks.findIndex(a => a === track);
    // @ts-ignore
    this.playerService.setDefaultAudio(track.name);

    this._hls.audioTrack = idx;
    this.currentTrack = track;

    if (toggle) {
      this.toggleAudioOptions();
    }

    console.log('[Player]: switched audio track!', track);
  }

  public setVideoQuality(level: Hls.Level, toggle = true) {
    const idx = this._hls.levels.findIndex(l => l === level);
    this.currentQuality = level;
    this._hls.nextLevel = idx;

    if (toggle) {
      this.toggleQualityOptions();
    }

    console.log('[Player]: switched level!', this._hls);
  }

  public goBack() {
    if (!this.location.isCurrentPathEqualTo(this.location.path(true))) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/')
        .then((this.ngOnDestroy))
        .catch(console.error);
    }
  }

  public getTimeKey() {
    return `f1_time#${this._uri}`;
  }

  private setupPlayer(playlist: string) {
    this._hls.loadSource(playlist);
    this._hls.currentLevel = -1;

    setTimeout(async () => {
      // @ts-ignore
      let savedProgress: any = localStorage.getItem(this.getTimeKey());

      if (savedProgress) {
        savedProgress = JSON.parse(savedProgress) as { currentTime: number };
        this._videoElement.currentTime = savedProgress.currentTime;
      }

      //this.togglePlayPause();
    }, 1200);
  }

  public keyUpHandler(event: KeyboardEvent) {
    console.log(event);

    switch (event.code) {
      case 'MediaPlayPause':
      case 'Space':
        this.togglePlayPause();
        break;
      case 'KeyF':
        this.toggleFullScreen();

        break;
      default:
        if (environment.production === false) {
          console.log(`[KeyCode]: ${event.code}`);
          break;
        }
    }

    event.preventDefault();
  }

  public getHumanTime(time: number) {
    if (!time) {
      return '';
    }

    const timeString = time.toString();

    let seconds: string | number = parseInt(timeString, 10); // don't forget the second param
    let hours: string | number = Math.floor(seconds / 3600);
    let minutes: string | number = Math.floor((seconds - (hours * 3600)) / 60);
    seconds = seconds - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
  }

  public timeUpdateHandler() {
    localStorage.setItem(this.getTimeKey(), JSON.stringify({currentTime: this._videoElement.currentTime}));

    if (!this.duration) {
      this.duration = this._videoElement.duration;
    }

    this.currentTime = this._videoElement.currentTime;
    this.progressState = Math.floor((this.currentTime & this.duration) * 100);
  }

  private hideControls() {
    if (!this.videoRef) {
      return;
    }

    if (!this._videoElement.paused) {
      this.controlsRef.nativeElement.classList.remove('display-control');
    }
  }

  private displayControls() {
    this.controlsRef.nativeElement.classList.add('display-control');
  }

  public ngOnDestroy(): void {
    if (this._subscription !== undefined) {
      this._subscription.unsubscribe();
    }

    this._hls.destroy();
  }

}
