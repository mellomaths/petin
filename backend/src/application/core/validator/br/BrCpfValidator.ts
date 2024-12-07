export class BrCpfValidator {
  private static clean(cpf: string) {
    return cpf.replace(/\D/g, "");
  }

  private static calculateDigit(cpf: string, factor: number) {
    let total = 0;
    for (const digit of cpf) {
      if (factor > 1) total += parseInt(digit) * factor--;
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  private static extractLastDigits(cpf: string) {
    return cpf.slice(9);
  }

  static isValidCpf(cpf: string) {
    if (!cpf) return false;
    cpf = this.clean(cpf);
    if (cpf.length !== 11) return false;
    const firstDigit = this.calculateDigit(cpf, 10);
    const secondDigit = this.calculateDigit(cpf, 11);
    const digits = this.extractLastDigits(cpf);
    return digits === `${firstDigit}${secondDigit}`;
  }
}
