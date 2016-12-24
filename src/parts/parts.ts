import {Bar, Brick, Enemy, Hero, Ladder, None, Steel, Treasure} from './';
import {Part, PartType} from '../';
import {Vector2} from 'three';

export class Parts {

  static inventory: Array<PartType> = [
    Bar,
    Brick,
    Enemy,
    Ladder,
    Hero,
    None,
    Steel,
    Treasure,
  ];

  // TODO Assert no duplicate chars!

  static charParts = new Map(Parts.inventory.map(
    part => [part.char, part] as [string, PartType]
  ));

}

let nonEnders = [Hero, None, Treasure];

Parts.inventory.filter(part => nonEnders.indexOf(part) < 0).forEach(part => {
  // Auto-pick chars in the extended latin range, for convenience.
  // They won't look pretty.
  // 1D4D0-1D4E9 caps, 1D4EA-1D503 lower, others, for pretty?
  let char = part.char.codePointAt(0) + 0x80;
  if (char == 0xAD) {
    // Because 0xAD isn't visible, and they're nice to see, at least.
    char = 0xFF;
  }
  // Creat the class.
  class Ender extends part {
    static get base() {
      return part;
    }
    static char = String.fromCodePoint(char);
    // TODO `make` that attends to edit or play mode for ender or base?
    // TODO Or just reference game dynamically in parts?
    static ender = true;
  }
  // Add it to things.
  Parts.inventory.push(Ender);
  Parts.charParts.set(Ender.char, Ender);
  // TODO Comment out log.
  console.log(
    part.char, Ender.char, Ender.ender, Object.getPrototypeOf(Ender).name
  );
});
