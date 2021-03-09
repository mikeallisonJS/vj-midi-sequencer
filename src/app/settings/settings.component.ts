import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {MidiService} from "../midi.service";
import {StateService} from "../state.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private midi: MidiService, public state: StateService) { }

  ngOnInit(): void {
  }

  save(): void {
    if(this.state.midiOutPort.dirty)
      this.midi.changeOutputPort();
    this.activeModal.close();
  }

}
