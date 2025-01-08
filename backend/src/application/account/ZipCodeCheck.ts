export type ZipCodeCheck = {
  zipCode: string;
  countryCode: string;
};

export type ZipCodeCheckResponse = {
  valid: boolean;
  zipCode: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  service?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};
