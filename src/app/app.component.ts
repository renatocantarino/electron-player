import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ISong } from './model/song';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'music-player-electron';
  currentProgress$ = new BehaviorSubject(0);
  currentTime$ = new Subject();


  @ViewChild('player', { static: true }) player: ElementRef
  songs: ISong[] = []
  audio = new Audio();
  isPlaying = false;
  activeSong;
  durationTime: string;




  ngOnInit(): void {

    this.songs = this.getSongs();
    this.player.nativeElement.src = this.songs[0];
    this.player.nativeElement.load();
    this.activeSong = this.songs[0];
    this.isPlaying = false;
  }

  playSong(song): void {
    this.durationTime = undefined;
    this.audio.pause();

    this.player.nativeElement.src = song.path;
    this.player.nativeElement.load();
    this.player.nativeElement.play();
    this.activeSong = song;
    this.isPlaying = true;
  }

  onTimeUpdate() {

    // Set song duration time
    if (!this.durationTime) {
      this.setSongDuration();
    }

    // Emit converted audio currenttime in user friendly ex. 01:15
    const currentMinutes = this.generateMinutes(this.player.nativeElement.currentTime);
    const currentSeconds = this.generateSeconds(this.player.nativeElement.currentTime);
    this.currentTime$.next(this.generateTimeToDisplay(currentMinutes, currentSeconds));


    // Emit amount of song played percents
    const percents = this.generatePercentage(this.player.nativeElement.currentTime, this.player.nativeElement.duration);
    if (!isNaN(percents)) {
      this.currentProgress$.next(percents);
    }

  }
  playNextSong(): void {
    const nextSongIndex = this.songs.findIndex((song) => song.id === this.activeSong.id + 1);

    if (nextSongIndex === -1) {
      this.playSong(this.songs[0]);
    } else {
      this.playSong(this.songs[nextSongIndex]);
    }
  }

  playPreviousSong(): void {
    const prevSongIndex = this.songs.findIndex((song) => song.id === this.activeSong.id - 1);
    if (prevSongIndex === -1) {
      this.playSong(this.songs[this.songs.length - 1]);
    } else {
      this.playSong(this.songs[prevSongIndex]);
    }
  }

  setSongDuration(): void {
    const durationInMinutes = this.generateMinutes(this.player.nativeElement.duration);
    const durationInSeconds = this.generateSeconds(this.player.nativeElement.duration);

    if (!isNaN(this.player.nativeElement.duration)) {
      this.durationTime = this.generateTimeToDisplay(durationInMinutes, durationInSeconds);
    }
  }


  generateMinutes(currentTime: number): number {
    return Math.floor(currentTime / 60);
  }

  // Generate seconds from audio time
  generateSeconds(currentTime: number): number | string {
    const secsFormula = Math.floor(currentTime % 60);
    return secsFormula < 10 ? '0' + String(secsFormula) : secsFormula;
  }

  generateTimeToDisplay(currentMinutes, currentSeconds): string {
    return `${currentMinutes}:${currentSeconds}`;
  }

  onPause(): void {
    this.isPlaying = false;
    this.currentProgress$.next(0);
    this.currentTime$.next('0:00');
    this.durationTime = undefined;
  }

  // Generate percentage of current song
  generatePercentage(currentTime: number, duration: number): number {
    return Math.round((currentTime / duration) * 100);
  }

  getSongs(): ISong[] {
    return [
      {
        id: 1,
        title: 'Evanescence - Bring Me To Life',
        path: './assets/Evanescence-Bring Me To Life(with lyrics).mp3'
      },
      {
        id: 2,
        title: 'System Of A Down - Toxicity',
        path: './assets/System Of A Down - Toxicity (Official Video).mp3'
      }      
    ];
  }

}
