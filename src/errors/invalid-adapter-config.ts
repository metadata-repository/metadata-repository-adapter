import { InternalServerError } from '#modules/metadata-error/src/errors/internal-server-error.js';

export class InvalidAdapterConfig extends InternalServerError {
  constructor() {
    super(
      'The configuration for the metadata repository adapter is invalid.',
      'Invalid Adapter Config'
    );
  }
}
