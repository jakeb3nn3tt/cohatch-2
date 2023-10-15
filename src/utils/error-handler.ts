export class KnownError {
  code: string;
  message: string;
  description: string | boolean | undefined;
  constructor(code: string, message: string, description?: string | boolean) {
    this.code = code;
    this.message = message;
    this.description = description;
  }
}