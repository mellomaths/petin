export type DocumentNumberCheck = {
  documentNumber: string;
  documentNumberType: string;
  countryCode: string;
};

export type DocumentNumberCheckResponse = {
  valid: boolean;
};
