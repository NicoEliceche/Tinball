export class HttpError extends Error {
  constructor(readonly statusCode: number, readonly code: string, message: string, readonly fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'HttpError';
  }
}
export const unauthorized = () => new HttpError(401, 'UNAUTHORIZED', 'Tu sesión no es válida o venció.');
export const forbidden = (message = 'No tenés permiso para realizar esta acción.') => new HttpError(403, 'FORBIDDEN', message);
export const notFound = (resource = 'Recurso') => new HttpError(404, 'NOT_FOUND', `${resource} no encontrado.`);
export const conflict = (message: string) => new HttpError(409, 'CONFLICT', message);

