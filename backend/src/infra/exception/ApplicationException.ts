export class ApplicationException extends Error {
  status: number;
  payload: any;

  constructor(status: number, payload: any, message: string) {
    super(message);
    this.status = status;
    this.payload = payload;
    this.name = "ApplicationException";
  }
}
