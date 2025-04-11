import { Component } from '@angular/core';
import {canPlaceOnTop, DeckService, rankIndex} from '../../services/deck.service';
import { Card } from '../../models/card.model';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import {CdkDropList, CdkDragDrop} from '@angular/cdk/drag-drop';
import {Router} from '@angular/router';

@Component({
  selector: 'app-game-board',
  imports: [
    CommonModule,
    CardComponent,
    CdkDropList,
    CdkDropList,
  ],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent {
  tableau: Card[][] = [];
  stockPile: Card[] = [];
  wastePile: Card[] = [];
  connectedDropLists: string[] = [];
  history: {
    tableau: Card[][];
    stockPile: Card[];
    wastePile: Card[];
    foundations: { suit: string, pile: Card[] }[];
  }[] = [];

  foundations: { suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'; pile: Card[] }[] = [
    { suit: 'hearts', pile: [] },
    { suit: 'diamonds', pile: [] },
    { suit: 'clubs', pile: [] },
    { suit: 'spades', pile: [] }
  ];

  constructor(private deckService: DeckService, private router: Router) {
    const fullDeck = this.deckService.createShuffledDeck();
    this.dealTableau(fullDeck);
    this.connectedDropLists = Array.from({ length: 7 }, (_, i) => `col-${i}`);
    this.connectedDropLists.push('waste');
    this.connectedDropLists.push('foundation-hearts', 'foundation-diamonds', 'foundation-clubs', 'foundation-spades');

  }

  private dealTableau(deck: Card[]) {
    this.tableau = [];
    let deckIndex = 0;

    for (let i = 0; i < 7; i++) {
      const tableauPile: Card[] = [];
      for (let j = 0; j <= i; j++) {
        const card = deck[deckIndex++];
        card.faceUp = j === i;
        tableauPile.push(card);
      }
      this.tableau.push(tableauPile);
    }

    this.stockPile = deck.slice(deckIndex);
  }

  drawFromStock(): void {
    this.saveState();
    if (this.stockPile.length > 0) {
      const card = this.stockPile.shift()!;
      card.faceUp = true;
      this.wastePile.unshift(card);
    } else {
      this.stockPile = this.wastePile.map(card => ({ ...card, faceUp: false }));
      this.wastePile = [];
    }
  }

  onCardDrop(event: CdkDragDrop<Card[]>, targetColumnIndex: number): void {
    this.saveState();
    const prevContainer = event.previousContainer;
    const currContainer = event.container;

    if (prevContainer === currContainer) return;

    const sourceColumn = prevContainer.data;
    const targetColumn = currContainer.data;

    const rawData = event.item.data;
    const draggedStack: Card[] = Array.isArray(rawData) ? rawData : [rawData];
    const draggedCard = draggedStack[0];

    if (!draggedCard) {
      console.log('Invalid drag data:', rawData);
      return;
    }

    const targetTopCard = targetColumn[targetColumn.length - 1];

    if (!targetTopCard && draggedCard.rank !== 'K') return;
    if (targetTopCard && !canPlaceOnTop(draggedCard, targetTopCard)) return;

    let movedStack: Card[];

    if (this.foundations.some(f => f.pile === sourceColumn)) {
      movedStack = [sourceColumn.pop()!];
    }
    else if (this.wastePile === sourceColumn) {
      movedStack = [this.wastePile.shift()!];
    }
    else {
      const startIndex = sourceColumn.findIndex(c => c.id === draggedCard.id);
      if (startIndex === -1) return;
      movedStack = sourceColumn.splice(startIndex);
    }

    targetColumn.push(...movedStack);

    const newTopCard = sourceColumn[sourceColumn.length - 1];
    if (newTopCard && !newTopCard.faceUp) {
      newTopCard.faceUp = true;
    }
  }

  checkWinCondition(): void {
    const allComplete = this.foundations.every(f => f.pile.length === 13);
    if (allComplete) {
      setTimeout(() => {
        alert('You Win!'); // Melusky, I hope you can test this function for me. I can never get to it because I AM BAD AT THE GAME
        this.router.navigate(['/']);
      }, 1000);
    }
  }

  onFoundationDrop(event: CdkDragDrop<Card[]>, targetSuit: string): void {
    this.saveState();
    if (event.previousContainer === event.container) return;

    const rawData = event.item.data;
    const draggedCard = Array.isArray(rawData) ? rawData[0] : rawData;

    if (draggedCard.suit !== targetSuit) return;

    const sourcePile = event.previousContainer.data;
    const foundation = this.foundations.find(f => f.suit === targetSuit)!;
    const foundationPile = foundation.pile;

    const expectedIndex = rankIndex(draggedCard.rank);
    if (foundationPile.length !== expectedIndex) return;


    if (this.foundations.some(f => f.pile === sourcePile)) {
      sourcePile.pop();
    } else if (this.wastePile === sourcePile) {
      this.wastePile.shift();
    } else {
      const index = sourcePile.findIndex(c => c.id === draggedCard.id);
      if (index === -1) return;
      sourcePile.splice(index, 1);
    }

    foundationPile.push(draggedCard);
    this.checkWinCondition();

    // Flip top if it was from tableau
    const newTop = sourcePile[sourcePile.length - 1];
    if (newTop && !newTop.faceUp) {
      newTop.faceUp = true;
    }
  }


  handleAutoMove(card: Card): void {
    this.saveState();

    const sourceColumn = this.tableau.find(col => col.includes(card));
    const isFromWaste = this.wastePile.includes(card);

    const foundation = this.foundations.find(f => f.suit === card.suit)!;
    const expectedIndex = rankIndex(card.rank);

    if (foundation.pile.length !== expectedIndex) return;

    if (sourceColumn) {
      sourceColumn.splice(sourceColumn.indexOf(card), 1);
      const newTop = sourceColumn[sourceColumn.length - 1];
      if (newTop && !newTop.faceUp) newTop.faceUp = true;
    } else if (isFromWaste) {
      this.wastePile.shift();
    } else {
      return;
    }

    foundation.pile.push(card);
    this.checkWinCondition();
  }

  getDraggableStack(column: Card[], cardIndex: number): Card[] {
    return column.slice(cardIndex);
  }

  quitGame(): void {
    if (confirm('Are you sure you want to quit?\nYour progress will NOT be saved.')) {
      this.router.navigate(['/'])
    }
  }

  saveState(): void {
    this.history.push({
      tableau: this.tableau.map(col =>
        col.map(card => ({ ...card }))
      ),
      stockPile: this.stockPile.map(card => ({ ...card })),
      wastePile: this.wastePile.map(card => ({ ...card })),
      foundations: this.foundations.map(f => ({
        suit: f.suit as 'hearts' | 'diamonds' | 'clubs' | 'spades',
        pile: f.pile.map(card => ({ ...card }))
      }))
    });


    if (this.history.length > 10) {
      this.history.shift();
    }
  }

  undo(): void {
    if (this.history.length === 0) {
      alert('No more moves to undo!');
      return;
    }

    const prev = this.history.pop()!;
    this.tableau = prev.tableau.map(col => [...col]);
    this.stockPile = [...prev.stockPile];
    this.wastePile = [...prev.wastePile];
    this.foundations = prev.foundations.map(f => ({
      suit: f.suit as 'hearts' | 'diamonds' | 'clubs' | 'spades',
      pile: [...f.pile]
    }));
  }
}
