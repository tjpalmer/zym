import {Art} from './gold';
import {Control, Stage, Toolbox} from './';
import './index.css';
import 'font-awesome';

window.onload = main;

// There's probably a better place for this declaration.
declare function require(name: string): any;

function main() {
  let art = new Art();
  let stage = new Stage();
  new Control(stage);
  new Toolbox(document.body, stage);
  art.handle(stage);
}
