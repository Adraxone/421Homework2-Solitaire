import {Component, EventEmitter, Input, Output} from '@angular/core';
import { Card } from '../../models/card.model';
import { CommonModule } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card',
  imports: [
    CommonModule,
    CdkDrag,
    MatCardModule,
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card!: Card;
  @Input() stack: Card[] = [];
  @Output() doubleClicked = new EventEmitter<Card>();

  get suitSymbol(): string {
    const symbols: { [key: string]: string } = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return symbols[this.card.suit];
  }

  get suitColor(): string {
    return this.card.suit === 'hearts' || this.card.suit === 'diamonds' ? 'red' : 'black';
  }

  onDoubleClick() {
    if (this.card.faceUp) {
      this.doubleClicked.emit(this.card);
    }
  }
}
