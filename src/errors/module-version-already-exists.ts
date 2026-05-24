import { Conflict } from '#modules/metadata-error/src/errors/conflict.js';

export class ModuleVersionAlreadyExists extends Conflict {
  constructor() {
    super(
      'A module with the same name and version already exists in the repository.',
      'Module Version Already Exists'
    );
  }
}
