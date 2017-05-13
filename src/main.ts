import {Game} from './';
import {GoldTheme} from './gold';
import './index.css';
import 'font-awesome';

window.onload = main;

async function main() {
  let game = new Game(window.document.body);
  let theme = await GoldTheme.load(game);
  game.theme = theme;
  // Fill in even empty/none parts before the first drawing, so uv and such get
  // in there.
  game.level.updateStage(game);
  theme.handle();
  // Now kick off the display.
  game.render();
}
