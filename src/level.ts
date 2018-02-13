import {
  Game, GenericPartType, Grid, Id, Part, PartType, PlayMode, Ref, createId,
} from './index';
import {Hero, None, Parts, Treasure} from './parts/index';
import {Vector2} from 'three';

export interface ItemMeta {

  // Totally okay to leave off for included items.
  excluded?: boolean;

  id: Id;

  name: string;

  type: string;

}

export interface NumberedItem extends ItemMeta {

  number?: number;

}

export interface ListRaw<Item> extends ItemMeta {

  items: Array<Ref<Item>>;

}

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  max: Point;
  min: Point;
}

export function copyPoint(point: Point): Point;
export function copyPoint(point?: Point): Point | undefined;
export function copyPoint(point?: Point): Point | undefined {
  if (point) {
    return {x: point.x, y: point.y};
  }
}

export function copyRect(rect: Rectangle): Rectangle;
export function copyRect(rect?: Rectangle): Rectangle | undefined;
export function copyRect(rect?: Rectangle): Rectangle | undefined {
  if (rect) {
    return {max: copyPoint(rect.max), min: copyPoint(rect.min)};
  }
}

export interface LevelRaw extends NumberedItem {

  bounds?: Rectangle;

  tiles: string;

}

export type TowerRaw = ListRaw<LevelRaw>;

export type ZoneRaw = ListRaw<TowerRaw>;

export class Raw {

  private constructor() {}

  static encodeMeta(item: ItemMeta) {
    let meta: ItemMeta = {
      id: item.id,
      name: item.name,
      type: item.type,
    };
    if (item.excluded) {
      meta.excluded = true;
    }
    return meta;
  }

  static load<Item extends ItemMeta>(ref: Ref<Item>) {
    let text = window.localStorage[`zym.objects.${ref}`];
    if (text) {
      // TODO Sanitize names?
      return JSON.parse(text) as Item;
    }
    // else undefined
  }

  static remove(id: string) {
    window.localStorage.removeItem(`zym.objects.${id}`);
  }

  static save(raw: ItemMeta) {
    // console.log(`Save ${raw.type} ${raw.name} (${raw.id})`);
    window.localStorage[`zym.objects.${raw.id}`] = JSON.stringify(raw);
  }

}

export abstract class Encodable<RawItem extends ItemMeta> implements ItemMeta {

  // Implied: abstract decode(raw: undefined): never;
  abstract decode(raw: RawItem): this;

  abstract encode(): RawItem;

  excluded: boolean;

  id: Id;

  load(id: Id): this {
    this.decode(Raw.load(id) as RawItem);
    return this;
  }

  name: string;

  save() {
    Raw.save(this.encode());
  }

  type: string;

}

export abstract class ItemList<Item extends ItemMeta>
    extends Encodable<ListRaw<Item>> {

  static numberItems(items: Array<NumberedItem>) {
    let number = 1;
    for (let item of items) {
      if (item.excluded) {
        item.number = undefined;
      } else {
        item.number = number;
        ++number;
      }
    }
  }

  decode(encoded: ListRaw<Item>) {
    this.id = encoded.id;
    this.items = encoded.items.
      map(id => Raw.load<Item>(id)).
      filter(item => item) as Array<Item>;
    this.name = encoded.name;
    return this;
  }

  encode(): ListRaw<Item> {
    // This presumes that all individual levels have already been saved under
    // their own ids.
    return {
      items: this.items.map(item => item.id),
      ...Raw.encodeMeta(this),
    }
  }

  encodeExpanded(): ItemMeta & {items: Array<Item>} {
    // Intended for full export.
    return {
      items: this.items,
      ...Raw.encodeMeta(this),
    }
  }

  excluded = false;

  id = createId();

  items = new Array<Item>();

  name = this.type;

  numberItems() {
    ItemList.numberItems(this.items);
  }

  abstract get type(): string;

}

export class Zone extends ItemList<TowerRaw> {

  get type() {
    return 'Zone';
  }

}

export class Tower extends ItemList<LevelRaw> {

  get type() {
    return 'Tower';
  }

}

export class Level extends Encodable<LevelRaw> implements NumberedItem {

  static tileCount = new Vector2(40, 20);

  static tileSize = new Vector2(8, 10);

  static pixelCount = Level.tileCount.clone().multiply(Level.tileSize);

  constructor({id, tiles}: {id?: Id, tiles?: Grid<PartType>} = {}) {
    super();
    this.id = id || createId();
    if (tiles) {
      this.tiles = tiles;
    } else {
      this.tiles = new Grid<PartType>(Level.tileCount);
      this.tiles.items.fill(None);
    }
  }

  bounds?: Rectangle = undefined;

  copy() {
    // TODO Include disabled?
    let level = new Level({id: this.id, tiles: this.tiles.copy()});
    level.bounds = copyRect(this.bounds);
    return level;
  }

  copyFrom(level: Level) {
    // TODO Include disabled?
    this.bounds = copyRect(level.bounds);
    this.name = level.name;
    this.tiles = level.tiles.copy();
  }

  decode(encoded: LevelRaw) {
    this.excluded = !!encoded.excluded;
    // Id. Might be missing for old saved levels.
    // TODO Not by now, surely? Try removing checks?
    // TODO Sanitize id, name, and tiles?
    this.bounds = copyRect(encoded.bounds);
    if (encoded.id) {
      this.id = encoded.id;
    }
    if (encoded.name) {
      this.name = encoded.name;
    }
    this.number = encoded.number;
    // Tiles.
    let point = new Vector2();
    let rows = encoded.tiles.split('\n').slice(0, Level.tileCount.y);
    rows.forEach((row, i) => {
      i = Level.tileCount.y - i - 1;
      for (let j = 0; j < Math.min(row.length, Level.tileCount.x); ++j) {
        let type = Parts.charParts.get(row.charAt(j));
        this.tiles.set(point.set(j, i), type || None);
      }
    });
    return this;
  }

  encode(): LevelRaw {
    let point = new Vector2();
    let rows: Array<string> = [];
    for (let i = Level.tileCount.y - 1 ; i >= 0; --i) {
      let row: Array<string> = [];
      for (let j = 0; j < Level.tileCount.x; ++j) {
        let type = this.tiles.get(point.set(j, i))!;
        row.push(type.char || '?');
      }
      rows.push(row.join(''));
    }
    let raw = {
      tiles: rows.join('\n'),
      ...Raw.encodeMeta(this),
    } as LevelRaw;
    if (this.bounds) {
      raw.bounds = copyRect(this.bounds);
    }
    return raw;
  }

  equals(other: Level): boolean {
    for (let i = 0; i < this.tiles.items.length; ++i) {
      if (this.tiles.items[i] != other.tiles.items[i]) {
        return false;
      }
    }
    if (this.bounds || other.bounds) {
      if (!(this.bounds && other.bounds)) {
        return false;
      }
      let {max: thisMax, min: thisMin} = this.bounds!;
      let {max: thatMax, min: thatMin} = other.bounds!;
      return (
        thisMax.x == thatMax.x && thisMax.y == thatMax.y &&
        thisMin.x == thatMin.x && thisMin.y == thatMin.y
      );
    }
    return true;
  }

  excluded = false;

  id: Id;

  load(id: Id) {
    try {
      super.load(id);
    } catch (e) {
      // TODO Is this catch really a good idea?
      this.tiles.items.fill(None);
    }
    // For convenience.
    return this;
  }

  name = 'Level';

  // Starting from 1, undefined for excluded levels.
  // Lazily applied.
  number?: number;

  get tileBounds() {
    let {max, min} = this.tileBoundsCache;
    // Required mess if I allow undefined bounds.
    if (this.bounds) {
      let {max: boundsMax, min: boundsMin} = this.bounds;
      max.set(boundsMax.x, boundsMax.y);
      min.set(boundsMin.x, boundsMin.y);
    } else {
      max.set(Level.tileCount.x, Level.tileCount.y);
      min.set(0, 0);
    }
    return this.tileBoundsCache;
  }

  tileBoundsCache = {max: new Vector2(), min: new Vector2()};

  tiles: Grid<PartType>;

  // For use from the editor.
  updateStage(game: Game, reset = false) {
    let {max, min} = this.tileBounds;
    let play = game.mode instanceof PlayMode;
    let stage = game.stage;
    let theme = game.theme;
    game.mode.updateView();
    if (reset) {
      // Had some phantoms on a level. Clear the grid helps?
      stage.clearGrid();
      stage.ended = false;
      stage.ending = false;
      stage.energyOn = true;
      stage.time = 0;
      stage.particles.clear();
    }
    stage.hero = undefined;
    stage.treasureCount = 0;
    if (play) {
      stage.tileBounds.max.copy(max);
      stage.tileBounds.min.copy(min);
    } else {
      stage.tileBounds.max.copy(Level.tileCount);
      stage.tileBounds.min.set(0, 0);
    }
    for (let j = 0, k = 0; j < Level.tileCount.x; ++j) {
      for (let i = 0; i < Level.tileCount.y; ++i, ++k) {
        let tile = this.tiles.items[k];
        // Handle enders for play mode.
        if (play && tile.ender) {
          // TODO Need a time for transition animation?
          let options = {...tile.options};
          for (let key in tile.options) {
            (options as any)[key] = (tile as any)[key];
          }
          options.ender = false;
          tile = stage.ending ? Parts.optionType(tile, options) : None;
        }
        // Build a new part if needed.
        let oldPart = stage.parts[k];
        let part: Part;
        // If it's the same type as what we already had, presume it's already in
        // the right place.
        if (reset || !oldPart || oldPart.type != tile) {
          // Needs to be a new part.
          part = tile.make(game);
          theme.buildArt(part);
          part.point.set(j, i).multiply(Level.tileSize);
          stage.parts[k] = part;
          if (oldPart) {
            stage.removed(oldPart);
          }
          stage.added(part);
        } else {
          part = oldPart;
        }
        if (play) {
          part.cropped = j < min.x || i < min.y || j >= max.x || i >= max.y;
        }
        if (part instanceof Hero) {
          stage.hero = part;
        } else if (part instanceof Treasure && !part.cropped) {
          ++stage.treasureCount;
        }
      }
    }
    stage.update();
    if (reset) {
      stage.init();
      if (!stage.treasureCount) {
        // Already got them all!
        stage.ending = true;
        this.updateStage(game);
      }
    }
    theme.buildDone(game);
  }

  get type() {
    return 'Level';
  }

}
