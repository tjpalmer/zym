import {Mode, Stage} from './';

export class EditMode implements Mode {

  constructor(stage: Stage) {
    this.stage = stage;
  }

  stage: Stage;

}
