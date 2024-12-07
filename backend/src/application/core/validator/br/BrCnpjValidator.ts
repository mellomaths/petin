export class BrCnpjValidator {
  private static clean(cnpj: string) {
    return cnpj.replace(/\D/g, "");
  }

  private static calculateDigit(cnpj: string, factor: number) {
    let total = 0;
    let sequences = 0;
    for (const digit of cnpj) {
      if (factor > 1) total += parseInt(digit) * factor--;
      if (factor === 1 && sequences == 0) {
        factor = 9;
        sequences++;
      }
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  private static extractLastDigits(cnpj: string) {
    return cnpj.slice(12);
  }

  static isValidCnpj(cnpj: string) {
    if (!cnpj) return false;
    cnpj = this.clean(cnpj);
    if (cnpj.length !== 14) return false;

    const firstDigit = this.calculateDigit(cnpj, 5);
    const secondDigit = this.calculateDigit(cnpj, 6);
    const digits = this.extractLastDigits(cnpj);
    return digits === `${firstDigit}${secondDigit}`;
  }
}
