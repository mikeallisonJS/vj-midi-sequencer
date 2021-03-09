import { Injectable } from '@angular/core';
import {FormControl} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  activeScene: number;
  bars = new FormControl(32);
  bpm = new FormControl(174);
  direction = new FormControl(0);
  loop = false;
  maxNote = new FormControl(80);
  midiInPort = new FormControl('Maschine jam - 1');
  midiOutPort = new FormControl('MIDI In');
  minNote = new FormControl(30);
  playing = false;
  repeat = true;
  constructor() {
    this.activeScene = this.minNote.value;
  }
}
