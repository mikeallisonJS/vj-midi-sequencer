import { Component } from '@angular/core';
import { AppConfig } from '../environments/environment';
import {ElectronService} from "./electron.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {SettingsComponent} from "./settings/settings.component";
import {StateService} from "./state.service";
import {MidiService} from "./midi.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private electronService: ElectronService, private modalService: NgbModal, private state: StateService, private midi: MidiService) {
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }
  openSettings(): void {
    const modalRef = this.modalService.open(SettingsComponent);
    modalRef.componentInstance.name = 'World';
  }
  panic() {
    this.midi.reset();
    this.midi.playNote(0, 15);
    this.state.playing = false;
  }
}
