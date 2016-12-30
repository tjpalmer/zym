import {Dialog, Game, formatTime, load} from '../';

export class Report implements Dialog {

  constructor(game: Game, message: string) {
    let content = this.content = load(require('./report.html'));
    this.field('endMessage').innerText = message;
    // TODO Format time better.
    this.field('endTime').innerText = formatTime(game.stage.time);
  }

  content: HTMLElement;

  field(name: string) {
    return this.content.querySelector(`.${name}`) as HTMLElement;
  }

}

declare function require(path: string): any;
