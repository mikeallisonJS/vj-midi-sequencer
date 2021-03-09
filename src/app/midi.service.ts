import { Injectable } from '@angular/core';
import * as JZZ from 'jzz';
import {times} from 'lodash-es';
import {StateService} from './state.service';
import {ElectronService} from "./electron.service";

@Injectable({
  providedIn: 'root'
})
export class MidiService {
  keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  octaves = ['-2', '-1', '0', '1', '2', '3', '4', '5', '6', '7', '8'];
  notesArray: string[];
  midi: typeof JZZ;
  midiIn;
  midiOut;
  midiInfo;
  constructor(private state: StateService, private electron: ElectronService) {
    this.notesArray = this.buildNoteList();
    this.reset();
  }
  getInfo() {
    this.midiInfo = this.midi.info();
  }
  buildNoteList(): string[] {
    return times(128, (i: number) =>
      this.keys[i % this.keys.length] + this.octaves[Math.floor((i + 3) / this.keys.length)]
    );
  }
  close(): void {
    this.midiOut.close();
  }
  playNote(note: number, channel: number): void {
    this.midiOut.ch(channel).note(note, 127, 100);
  }
  reset(): void {
    if (this.electron.isElectron) {
      this.midi = window.require('jzz');
      this.getInfo();
      this.midiIn = this.midi().openMidiIn(this.state.midiInPort);
      this.midiOut = this.midi().openMidiOut(this.state.midiOutPort.value);
    }
  }
  changeOutputPort(): void {
    this.midiOut.close();
    this.midiOut = this.midi().openMidiOut(this.state.midiOutPort.value);
  }
}
