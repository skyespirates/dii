export class HttpError extends Error {
  statusCode: number;
  status: string;
  constructor(statusCode: number, status: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
  }
}
