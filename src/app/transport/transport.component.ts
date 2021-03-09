import { Component, OnInit } from '@angular/core';
import {StateService} from '../state.service';
import {TransportService} from "../transport.service";

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit {
  constructor(public state: StateService, public transport: TransportService) {

  }

  ngOnInit(): void {

  }



}
