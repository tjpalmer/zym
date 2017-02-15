import {Dialog, Game, formatTime, load} from '../';

export class Report implements Dialog {

  constructor(game: Game, message: string) {
    let content = this.content = load(require('./report.html'));
    // Hide extras.
    for (let row of content.querySelectorAll('.timeRow')) {
      (row as HTMLElement).style.display = 'none';
    }
    // Now format.
    // TODO Juicier animation of this and such.
    this.field('endMessage').innerText = message;
    let {hero, time: stopTime} = game.stage;
    let scoreTime = stopTime;
    if (hero) {
      if (hero.startTime) {
        this.show('startTimeRow');
        this.field('startTime').innerText = formatTime(hero.startTime);
        scoreTime -= hero.startTime;
      }
    }
    if (scoreTime != stopTime) {
      this.show('stopTimeRow');
      this.field('stopTime').innerText = formatTime(stopTime);
    }
    // Always show score time.
    this.show('scoreTimeRow');
    this.field('scoreTime').innerText = formatTime(scoreTime);
  }

  content: HTMLElement;

  field(name: string) {
    return this.content.querySelector(`.${name}`) as HTMLElement;
  }

  show(name: string, display = 'table-row') {
    this.field(name).style.display = display;
  }

}

declare function require(path: string): any;
