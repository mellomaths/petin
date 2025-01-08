export interface Migration {
  createSchema(): Promise<void>;
  create(): Promise<void>;
  createAccountTable(): Promise<void>;
  createAccountPreferencesTable(): Promise<void>;
  createProfileTable(): Promise<void>;
  createAddressTable(): Promise<void>;
  createPetTable(): Promise<void>;
  createReportTable(): Promise<void>;
  drop(): Promise<void>;
  close(): Promise<void>;
}
