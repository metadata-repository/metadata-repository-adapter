import { BadRequest } from '#modules/metadata-error/src/errors/bad-request.js';

export class InvalidModuleManifest extends BadRequest {
  constructor(detail: string) {
    super(detail, 'Invalid Module Manifest');
  }
}
