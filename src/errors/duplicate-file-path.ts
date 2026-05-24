import { BadRequest } from '#modules/metadata-error/src/errors/bad-request.js';

export class DuplicateFilePath extends BadRequest {
  constructor(detail: string) {
    super(detail, 'Duplicate File Path');
  }
}
