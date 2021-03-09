import { Component, OnInit } from '@angular/core';
import {MidiService} from "../midi.service";
import {times} from 'lodash-es'

@Component({
  selector: 'app-effects',
  templateUrl: './effects.component.html',
  styleUrls: ['./effects.component.scss']
})
export class EffectsComponent implements OnInit {
  effectStates: boolean[];
  constructor(public midi: MidiService) {
    this.effectStates = [];
    times(10, (i: number) => {
      this.effectStates[i] = false;
    });
  }

  ngOnInit(): void {
  }
  toggle(index: number): void {
    this.effectStates[index] = !this.effectStates[index];
    this.midi.playNote(index, 10);
  }
}
