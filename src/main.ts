import {Control, Stage, Toolbox} from './';
import {Theme} from './gold';
import './index.css';
import 'font-awesome';

window.onload = main;

// There's probably a better place for this declaration.
declare function require(name: string): any;

function main() {
  let theme = new Theme();
  let stage = new Stage();
  new Control(stage);
  new Toolbox(document.body, stage);
  // Fill in even empty/none parts before the first drawing, so uv and such get
  // in there.
  stage.level.updateScene(stage.scene);
  theme.handle(stage);
}
