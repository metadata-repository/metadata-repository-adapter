import { NotFound } from '#modules/metadata-error/src/errors/not-found.js';

export class ModuleNotFound extends NotFound {
  constructor() {
    super('The requested module could not be found.', 'Module Not Found');
  }
}
