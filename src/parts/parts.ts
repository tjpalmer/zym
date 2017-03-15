import {
  Bar, BiggieLeft, BiggieRight, Bonus, Brick, Enemy, Energy, EnergyOff, GunLeft,
  GunRight, Hero, Ladder, LatchLeft, LatchRight, LauncherCenter, LauncherDown,
  LauncherLeft, LauncherRight, LauncherUp, None, Steel, Treasure,
} from './';
import {Part, PartType} from '../';
import {Vector2} from 'three';

export class Parts {

  static inventory: Array<PartType> = [
    Bar,
    BiggieLeft,
    BiggieRight,
    Bonus,
    Brick,
    Enemy,
    Energy,
    EnergyOff,
    GunLeft,
    GunRight,
    Hero,
    Ladder,
    LatchLeft,
    LatchRight,
    LauncherCenter,
    LauncherDown,
    LauncherLeft,
    LauncherRight,
    LauncherUp,
    None,
    Steel,
    Treasure,
  ];

  static charParts = new Map(Parts.inventory.map(
    part => [part.char, part] as [string, PartType]
  ));

}

// Just to check for non-duplicates.
let chars: {[char: string]: string} = {};
Parts.inventory.forEach(({char}) => {
  if (chars[char]) {
    throw new Error(`Duplicate ${char}`);
  }
  chars[char] = char;
});

let nonEnders = [Hero, None, Treasure];

Parts.inventory.filter(part => nonEnders.indexOf(part) < 0).forEach(part => {
  // Auto-pick chars in the extended latin range, for convenience.
  // They won't look pretty.
  // 1D4D0-1D4E9 caps, 1D4EA-1D503 lower, others, for pretty?
  let char = part.char.codePointAt(0)! + 0x80;
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
  // console.log(
  //   part.char, Ender.char, Ender.ender, Object.getPrototypeOf(Ender).name
  // );
});
