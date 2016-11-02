import {Vector2} from 'three';

export class Grid<Item> {

  constructor(size: Vector2, items?: Array<Item>) {
    this.items = items || new Array<Item>(size.x * size.y);
    this.size = size.clone();
  }

  copy() {
    return new Grid(this.size, this.items.slice());
  }

  get(point: Vector2): Item {
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
