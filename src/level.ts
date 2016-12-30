import {Game, Grid, Id, Part, PartType, createId} from './';
import {Hero, None, Parts, Treasure} from './parts';
import {Vector2} from 'three';

export class World {

  constructor() {
    this.id = createId();
    this.levels.push(new Level());
  }

  decode(encoded: EncodedWorld) {
    this.id = encoded.id;
    this.levels = encoded.levels.map(levelId => {
      let levelString = window.localStorage[`zym.objects.${levelId}`];
      if (levelString) {
        return new Level().decode(JSON.parse(levelString));
      }
    }).filter(level => level) as Array<Level>;
    if (!this.levels.length) {
      // Always keep one level.
      this.levels.push(new Level());
    }
    this.name = encoded.name;
    return this;
  }

  encode(): EncodedWorld {
    // This presumes that all individual levels have already been saved.
    return {
      id: this.id,
      levels: this.levels.map(level => level.id),
      name: this.name,
      type: 'World',
    }
  }

  id: Id;

  levels = new Array<Level>();

  name = 'World';

  save() {
    window.localStorage[`zym.objects.${this.id}`] =
      JSON.stringify(this.encode());
  }

}

export class Level {

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
    // Id. Might be missing for old saved levels.
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

  disabled = false;

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
    return {
      id: this.id, name: this.name, tiles: rows.join('\n'), type: 'Level'
    };
  }

  equals(other: Level): boolean {
    for (let i = 0; i < this.tiles.items.length; ++i) {
      if (this.tiles.items[i] != other.tiles.items[i]) {
        return false;
      }
    }
    return true;
  }

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
      stage.ending = false;
      stage.time = 0;
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
    theme.buildDone(game);
  }

}

export interface EncodedLevel {

  id: Id;

  name: string;

  tiles: string;

  type: 'Level';

}

export interface EncodedWorld {

  id: Id;

  levels: Array<Id>;

  name: string;

  type: 'World';

}
