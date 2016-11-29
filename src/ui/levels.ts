export class Levels {

  content = load('./levels.html');

}

function load(path: string) {
  let html = require(path);
  let div = window.document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild as HTMLElement;
}

declare function require(path: string): any;
