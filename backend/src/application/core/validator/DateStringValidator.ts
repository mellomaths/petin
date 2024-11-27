import { isDate, isDateString } from "class-validator";

export class DateStringValidator {
  static isValid(date: string) {
    return isDateString(date) && isDate(new Date(date));
  }

  static isValidPast(date: string) {
    return new Date(date) < new Date();
  }

  static isValidAdult(date: string) {
    return new Date().getFullYear() - new Date(date).getFullYear() >= 18;
  }
}
