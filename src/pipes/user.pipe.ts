import { ArgumentMetadata, BadRequestException, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class UserPipe implements PipeTransform {
  constructor(private schema: ZodSchema) { }

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new HttpException({
        message: 'Validation failed',
        statusCode: HttpStatus.BAD_REQUEST,
        errors: error.errors,
      }, HttpStatus.BAD_REQUEST);
    }
  }
}

