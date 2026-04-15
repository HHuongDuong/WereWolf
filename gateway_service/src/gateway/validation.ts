import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export function validatePayload<T>(payload: unknown, dtoClass: new () => T) {
  const dto = plainToInstance(dtoClass, payload);
  const errors = validateSync(dto as object, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length === 0) {
    return { dto };
  }

  const messages = errors.flatMap((err) =>
    err.constraints ? Object.values(err.constraints) : ['Invalid payload'],
  );
  return { errors: messages };
}
