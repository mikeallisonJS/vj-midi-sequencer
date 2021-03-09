import { Injectable } from '@angular/core';
import {StateService} from "./state.service";
import {MidiService} from "./midi.service";

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  noteInterval;
  barInterval;
  currentBar;
  constructor(private state: StateService, private midi: MidiService) {
    this.currentBar = 0;
  }
  playToggle() {
    this.reset();
    this.state.playing = !this.state.playing;
    if (this.state.playing) {
      this.nextNote();
    }
  }
  nextNote() : void {
    if (this.state.activeScene >= this.state.maxNote.value) {
      if (!this.state.repeat) {
        return;
      }
      this.state.activeScene = this.state.minNote.value;
    } else {
      this.state.activeScene++;
    }
    this.midi.playNote(this.state.activeScene, 0);
    if (this.state.playing)
      this.scheduleNextNote();
  }
  scheduleNextNote(): void {
    this.reset();
    const singleBar = (60000 / this.state.bpm.value) * 4;
    const ms = singleBar * this.state.bars.value;
    this.barInterval = setInterval(() => this.currentBar++);
    this.noteInterval = setInterval(() =>this.nextNote(), ms);
  }
  restart(): void {
    this.state.playing = true;
    this.scheduleNextNote();
  }
  reset(): void {
    this.currentBar = 0;
    clearInterval(this.noteInterval);
    clearInterval(this.barInterval);
  }
}
