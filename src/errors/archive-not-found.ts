import { NotFound } from '#modules/metadata-error/src/errors/not-found.js';

export class ArchiveNotFound extends NotFound {
  constructor() {
    super('The requested archive could not be found.', 'Archive Not Found');
  }
}
