import {Vector2} from 'three';

export class Grid<Item> {

  constructor(size: Vector2) {
    this.items = new Array<Item>(size.x * size.y);
    this.size = size.clone();
  }

  public get(point: Vector2): Item {
    return this.items[this.index(point)];
  }

  public index(point: Vector2): number {
    return point.x * this.size.y + point.y;
  }

  public set(point: Vector2, item: Item) {
    this.items[this.index(point)] = item;
  }

  private items: Array<Item>;

  size: Vector2;

}
