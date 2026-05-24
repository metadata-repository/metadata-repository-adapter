import { InternalServerError } from '#modules/metadata-error/src/errors/internal-server-error.js';

export class InvalidRepositoryConfig extends InternalServerError {
  constructor() {
    super(
      'The configuration for the metadata repository is invalid.',
      'Invalid Repository Config'
    );
  }
}
