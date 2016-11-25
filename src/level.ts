import {Grid, Part, PartType, Game} from './';
import {None, Parts} from './parts';
import {Vector2} from 'three';

export class Level {

  static tileCount = new Vector2(40, 20);

  static tileSize = new Vector2(8, 10);

  static pixelCount = Level.tileCount.clone().multiply(Level.tileSize);

  constructor({tiles}: {tiles?: Grid<PartType>} = {}) {
    if (tiles) {
      this.tiles = tiles;
    } else {
      this.tiles = new Grid<PartType>(Level.tileCount);
      this.tiles.items.fill(None);
    }
  }

  copy() {
    return new Level({tiles: this.tiles.copy()});
  }

  decode(encoded: EncodedLevel) {
    let point = new Vector2();
    let rows = encoded.tiles.split('\n').slice(0, Level.tileCount.y);
    rows.forEach((row, i) => {
      i = Level.tileCount.y - i - 1;
      for (let j = 0; j < Math.min(row.length, Level.tileCount.x); ++j) {
        let type = Parts.charParts.get(row.charAt(j));
        this.tiles.set(point.set(j, i), type || None);
      }
    });
  }

  encode() {
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
    return {tiles: rows.join('\n')};
  }

  equals(other: Level): boolean {
    for (let i = 0; i < this.tiles.items.length; ++i) {
      if (this.tiles.items[i] != other.tiles.items[i]) {
        return false;
      }
    }
    return true;
  }

  load(text: string) {
    if (text) {
      this.decode(JSON.parse(text));
    } else {
      this.tiles.items.fill(None);
    }
  }

  tiles: Grid<PartType>;

  // For use from the editor.
  updateStage(game: Game, reset = false) {
    let stage = game.stage;
    let theme = game.theme;
    for (let j = 0, k = 0; j < Level.tileCount.x; ++j) {
      for (let i = 0; i < Level.tileCount.y; ++i, ++k) {
        let tile = this.tiles.items[k];
        let oldPart = stage.parts[k];
        // If it's the same type as what we already had, presume it's already in
        // the right place.
        if (reset || !(oldPart instanceof tile)) {
          // Needs to be a new part.
          let part = new tile(game);
          theme.buildArt(part);
          part.point.set(j, i).multiply(Level.tileSize);
          stage.parts[k] = part;
          if (oldPart) {
            stage.removed(oldPart);
          }
          stage.added(part);
        }
      }
    }
    theme.buildDone(game);
  }

}

export interface EncodedLevel {

  tiles: string;

}
