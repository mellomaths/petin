export type Preference = {
  id: string;
  accountId: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type PreferenceInput = {
  key: string;
  value: string;
};
