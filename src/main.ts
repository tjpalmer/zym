import {Game} from './';
import {GoldTheme} from './gold';
import './index.css';
import 'font-awesome';

window.onload = main;

// There's probably a better place for this declaration.
declare function require(name: string): any;

function main() {
  let theme = new GoldTheme();
  let game = new Game(window.document.body);
  game.theme = theme;
  // Fill in even empty/none parts before the first drawing, so uv and such get
  // in there.
  game.level.updateStage(game);
  theme.handle(game);
  // Now kick off the display.
  game.render();
}
