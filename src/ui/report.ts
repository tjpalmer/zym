import {Dialog, Game, PlayMode, formatTime, load} from '../index';

export class Report extends Dialog {

  constructor(game: Game, message: string) {
    super(game);
    let content = this.content = load(require('./report.html'));
    // Hide extras.
    for (let row of content.querySelectorAll('.timeRow')) {
      (row as HTMLElement).style.display = 'none';
    }
    // Now format.
    // TODO Juicier animation of this and such.
    this.field('endMessage').innerText = message;
    // TODO Simplify out this show thing? We used to have more variance.
    this.show('scoreTimeRow');
    this.field('scoreTime').innerText = formatTime(game.stage.time);
  }

  content: HTMLElement;

  field(name: string) {
    return this.content.querySelector(`.${name}`) as HTMLElement;
  }

  onKey(event: KeyboardEvent, down: boolean) {
    if (down && event.key == 'Enter') {
      this.game.hideDialog();
    }
  }

  show(name: string, display = 'table-row') {
    this.field(name).style.display = display;
  }

}

declare function require(path: string): any;
