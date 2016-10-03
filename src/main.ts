import {Control, Stage, Toolbox} from './';
import './index.css';

window.onload = main;

// There's probably a better place for this declaration.
declare function require(name: string): any;

function main() {
  let stage = new Stage();
  new Control(stage);
  new Toolbox(document.body, stage);
}
