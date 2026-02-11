import { CustomErrorInterface } from "../../types/constructor/constructor-types.js";
export class CustomError extends Error {
  public statusCode: number | string;
  constructor({ message = "Error", statusCode }: CustomErrorInterface) {
    (super(message),
      (this.statusCode = statusCode),
      (this.name = "CustomError"));
  }
}
