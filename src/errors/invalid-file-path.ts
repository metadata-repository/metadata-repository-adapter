import { BadRequest } from '#modules/metadata-error/src/errors/bad-request.js';

export class InvalidFilePath extends BadRequest {
  constructor(detail: string) {
    super(detail, 'Invalid File Path');
  }
}
