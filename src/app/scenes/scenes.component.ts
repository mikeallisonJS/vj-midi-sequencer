import { Component, OnInit } from '@angular/core';
import {MidiService} from '../midi.service';
import {StateService} from '../state.service';

@Component({
  selector: 'app-scenes',
  templateUrl: './scenes.component.html',
  styleUrls: ['./scenes.component.scss']
})
export class ScenesComponent implements OnInit {
  constructor(public midi: MidiService, public state: StateService) {
  }

  ngOnInit(): void {
  }

  setActive(i: number): void {
    this.midi.playNote(i, 0);
    this.state.activeScene = i;
  }
}
