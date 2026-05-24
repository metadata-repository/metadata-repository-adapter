import { BadRequest } from '#modules/metadata-error/src/errors/bad-request.js';

export class InvalidSemver extends BadRequest {
  constructor() {
    super('The version must be a valid semver string.', 'Invalid Semver');
  }
}
