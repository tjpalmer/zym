import {Vector2} from 'three';

export class Grid<Item> {

  constructor(size: Vector2, items?: Array<Item>) {
    this.items = items || new Array<Item>(size.x * size.y);
    this.size = size.clone();
  }

  copy() {
    return new Grid(this.size, this.items.slice());
  }

  get(point: Vector2): Item | undefined {
    return this.items[this.index(point)];
  }

  index(point: Vector2): number {
    return point.x * this.size.y + point.y;
  }

  items: Array<Item>;

  set(point: Vector2, item: Item) {
    this.items[this.index(point)] = item;
  }

  size: Vector2;

}

export type Id = string;

export function createId(byteSize = 16): Id {
  let array = new Uint8Array(byteSize);
  window.crypto.getRandomValues(array);
  return Array.from(array).map(i => i.toString(16)).join('');
}

export function formatTime(seconds: number) {
  let sign = Math.sign(seconds) < 0 ? '-' : '';
  seconds = Math.abs(seconds);
  // Millis.
  let millis = seconds - Math.floor(seconds);
  millis = Math.floor(millis * 1000);
  // Minutes, because we shouldn't ever get to hours.
  seconds = Math.floor(seconds);
  let minutes = Math.floor(seconds / 60);
  // Seconds.
  seconds = seconds % 60;
  // All together.
  return `${sign}${minutes}:${padZero(seconds, 2)}.${padZero(millis, 3)}`;
}

export function load(html: string) {
  let div = window.document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild as HTMLElement;
}

export function padZero(integer: number, size: number) {
  let result = '' + integer;
  if (result.length < size) {
    // Sloppy overkill.
    result = `00000000000000000000000${result}`;
    result = result.slice(-size);
  }
  return result;
}
