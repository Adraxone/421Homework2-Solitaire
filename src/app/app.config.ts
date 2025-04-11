import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {provideRouter} from '@angular/router';
import {GameBoardComponent} from './components/game-board/game-board.component';
import {HomeComponent} from './components/home/home.component';
import {RulesComponent} from './components/rules/rules.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter([
      { path: '', component: HomeComponent },
      { path: 'play', component: GameBoardComponent },
      { path: 'rules', component: RulesComponent },
    ])
  ]
};
