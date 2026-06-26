import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm',
  imports: [],
  templateUrl: './confirm.html',
  styleUrl: './confirm.scss',
})

export class Confirm {

  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmBtn: string = 'btn-danger';
  @Output() onClose = new EventEmitter<any>();

  constructor() {}

  confirmation(value: boolean) {
    this.onClose.emit(value);
  }
  
}
