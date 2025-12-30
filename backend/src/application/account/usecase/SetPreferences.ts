import { Inject } from "../../../infra/di/DependencyInjection";
import { CreateNewId } from "../../id/usecase/CreateNewId";
import { Preference, PreferenceInput } from "../Preference";
import { PreferencesValidator } from "../validator/PreferencesValidator";
import { Authenticate } from "./Authenticate";

export class SetPreferences {
  @Inject("Authenticate")
  authenticate: Authenticate;

  @Inject("PreferencesRepository")
  preferencesRepository: SetPreferencesRepository;

  @Inject("CreateNewId")
  createNewId: CreateNewId;

  async execute(token: string, preferences: PreferenceInput[]): Promise<void> {
    PreferencesValidator.validate(preferences);
    const account = await this.authenticate.execute(token);
    const accountId = account.id!;
    await this.preferencesRepository.deleteAll(accountId);
    await this.preferencesRepository.save(
      await Promise.all(
        preferences.map(
          async (p) =>
            ({
              id: await this.createNewId.execute(),
              accountId,
              key: p.key,
              value: p.value,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Preference)
        )
      )
    );
  }
}

export interface SetPreferencesRepository {
  deleteAll(accountId: string): Promise<void>;
  save(preferences: Preference[]): Promise<void>;
}
