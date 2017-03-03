import {Game, GenericPartType, Grid, Id, Part, PartType, createId} from './';
import {Hero, None, Parts, Treasure} from './parts';
import {Vector2} from 'three';

export interface EncodedItem<TypeString extends string> {

  id: Id;

  name: string;

  type: TypeString;

}

interface Encodable<Item> {

  // TODO Awesome TypeScript type definition for encoded item.
  decode(encoded: any): Item;

  encode(): any;

  excluded: boolean;

  id: Id;

}

export class ItemList<Item extends Encodable<Item>> {

  constructor(itemType: {new(): Item}) {
    this.id = createId();
    this.items.push(new itemType());
    this.itemType = itemType;
  }

  decode(encoded: EncodedItemList<Id>) {
    this.id = encoded.id;
    this.items = encoded.items.map(levelId => {
      let levelString = window.localStorage[`zym.objects.${levelId}`];
      if (levelString) {
        return new this.itemType().decode(JSON.parse(levelString));
      }
    }).filter(item => item) as Array<Item>;
    if (!this.items.length) {
      // Always keep one level.
      this.items.push(new this.itemType());
    }
    // TODO Sanitize names?
    this.name = encoded.name;
    return this;
  }

  encode(): EncodedItemList<Id> {
    // This presumes that all individual levels have already been saved under
    // their own ids.
    return {
      items: this.items.map(item => item.id),
      ...this.encodeMeta(),
    }
  }

  encodeExpanded(): EncodedItemList<EncodedLevel> {
    // Intended for full export.
    return {
      items: this.items.map(item => item.encode()),
      ...this.encodeMeta(),
    }
  }

  encodeMeta(): EncodedItem<'Zone'> {
    return {
      id: this.id,
      name: this.name,
      type: 'Zone',
    }
  }

  id: Id;

  items = new Array<Item>();

  itemType: {new(): Item};

  name = 'Zone';

  save() {
    window.localStorage[`zym.objects.${this.id}`] =
      JSON.stringify(this.encode());
  }

}

export class World extends ItemList<Level> {

  constructor() {
    super(Level);
  }

  numberLevels() {
    let number = 1;
    for (let item of this.items) {
      if (item.excluded) {
        item.number = undefined;
      } else {
        item.number = number;
        ++number;
      }
    }
  }

}

export class Level implements Encodable<Level> {

  static tileCount = new Vector2(40, 20);

  static tileSize = new Vector2(8, 10);

  static pixelCount = Level.tileCount.clone().multiply(Level.tileSize);

  constructor({id, tiles}: {id?: Id, tiles?: Grid<PartType>} = {}) {
    this.id = id || createId();
    if (tiles) {
      this.tiles = tiles;
    } else {
      this.tiles = new Grid<PartType>(Level.tileCount);
      this.tiles.items.fill(None);
    }
  }

  copy() {
    // TODO Include disabled?
    return new Level({id: this.id, tiles: this.tiles.copy()});
  }

  copyFrom(level: Level) {
    // TODO Include disabled?
    this.name = level.name;
    this.tiles = level.tiles.copy();
  }

  decode(encoded: EncodedLevel) {
    this.excluded = !!encoded.excluded;
    // Id. Might be missing for old saved levels.
    // TODO Not by now, surely? Try removing checks?
    // TODO Sanitize id, name, and tiles?
    if (encoded.id) {
      this.id = encoded.id;
    }
    if (encoded.name) {
      this.name = encoded.name;
    }
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

  encode(): EncodedLevel {
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
    let encoded = {
      id: this.id,
      name: this.name,
      tiles: rows.join('\n'),
      type: 'Level',
    } as EncodedLevel;
    // Actually keep this one optional.
    if (this.excluded) {
      encoded.excluded = true;
    }
    return encoded;
  }

  equals(other: Level): boolean {
    for (let i = 0; i < this.tiles.items.length; ++i) {
      if (this.tiles.items[i] != other.tiles.items[i]) {
        return false;
      }
    }
    return true;
  }

  excluded = false;

  id: Id;

  load(text: string) {
    if (text) {
      this.decode(JSON.parse(text));
    } else {
      this.tiles.items.fill(None);
    }
    // For convenience.
    return this;
  }

  name = 'Level';

  // Starting from 1, undefined for excluded levels.
  // Lazily applied.
  number?: number;

  save() {
    window.localStorage[`zym.objects.${this.id}`] =
      JSON.stringify(this.encode());
  }

  tiles: Grid<PartType>;

  // For use from the editor.
  updateStage(game: Game, reset = false) {
    let play = game.mode == game.play;
    let stage = game.stage;
    let theme = game.theme;
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
    for (let j = 0, k = 0; j < Level.tileCount.x; ++j) {
      for (let i = 0; i < Level.tileCount.y; ++i, ++k) {
        let tile = this.tiles.items[k];
        // Handle enders for play mode.
        if (play && tile.ender) {
          // TODO Need a time for transition animation?
          tile = stage.ending ? tile.base : None;
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
        if (part instanceof Hero) {
          stage.hero = part;
        } else if (part instanceof Treasure) {
          ++stage.treasureCount;
        }
      }
    }
    if (reset) {
      if (!stage.treasureCount) {
        // Already got them all!
        stage.ending = true;
        this.updateStage(game);
      }
    }
    theme.buildDone(game);
  }

}

export interface EncodedLevel extends EncodedItem<'Level'> {

  // Totally okay to leave off for included levels.
  excluded?: boolean;

  id: Id;

  name: string;

  tiles: string;

}

export interface EncodedItemList<ItemRepresentation>
    extends EncodedItem<'World' | 'Zone'> {

  items: Array<ItemRepresentation>;

}
