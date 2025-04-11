import { Injectable } from '@angular/core';
import { Card, Suit, Rank } from '../models/card.model';

export const RANK_ORDER: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function isRed(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function rankIndex(rank: Rank): number {
  return RANK_ORDER.indexOf(rank);
}

export function canPlaceOnTop(moving: Card, target: Card): boolean {
  const movingIndex = RANK_ORDER.indexOf(moving.rank);
  const targetIndex = RANK_ORDER.indexOf(target.rank);

  const isOneLower = movingIndex + 1 === targetIndex;
  const isOppositeColor = isRed(moving.suit) !== isRed(target.suit);

  return isOneLower && isOppositeColor;
}

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  private suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  private ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  constructor() { }

  createShuffledDeck(): Card[] {
    const deck: Card[] = [];

    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        deck.push({
          suit,
          rank,
          faceUp: false,
          id: `${suit}-${rank}-${Math.random()}`
        });
      }
    }

    return this.shuffle(deck);
  }

  private shuffle(cards: Card[]): Card[] {
    const shuffled = [...cards];

    for(let i = shuffled.length -1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }
}
