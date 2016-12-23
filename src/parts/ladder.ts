import {Part} from '../';

export class Ladder extends Part {

  static char = 'H';

  climbable = true;

  surface = true;

}

// TODO Explicit like this, or keep current automatic enders?
// export class EnderLadder extends Ladder {
//   static char = '\u{1D4D7}';
//   static ender = true;
// }
// console.log(EnderLadder, Object.getPrototypeOf(EnderLadder).name);
