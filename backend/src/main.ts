import { Authenticate } from "./application/account/usecase/Authenticate";
import { CreateProfile } from "./application/account/usecase/CreateProfile";
import { GetProfile } from "./application/account/usecase/GetProfile";
import { Login } from "./application/account/usecase/Login";
import { SetPreferences } from "./application/account/usecase/SetPreferences";
import { Signup } from "./application/account/usecase/Signup";
import { CreatePet } from "./application/pet/usecase/CreatePet";
import { ListPets } from "./application/pet/usecase/ListPets";
import { CreateReport } from "./application/report/usecase/CreateReport";
import { JwtGenerator } from "./infra/auth/JwtGenerator";
import { AccountsController } from "./infra/controller/AccountsController";
import { PetsController } from "./infra/controller/PetsController";
import { ReportsController } from "./infra/controller/ReportsController";
import { PostgresAdapter } from "./infra/database/PostgresAdapter";
import { Registry } from "./infra/di/DependencyInjection";
import { BCryptAdapter } from "./infra/hash/BCryptAdapter";
import { ExpressAdapter } from "./infra/http/ExpressAdapter";
import { PostgresAccountsRepository } from "./infra/repository/account/PostgresAccountsRepository";
import { PostgresPreferencesRepository } from "./infra/repository/account/preferences/PostgresPreferencesRepository";
import { PostgresProfilesRepository } from "./infra/repository/account/profile/PostgresProfilesRepository";
import { PostgresPetsRepository } from "./infra/repository/pet/PostgresPetsRepository";
import { PostgresReportsRepository } from "./infra/repository/report/PostgresReportsRepository";
import { Settings } from "./infra/settings/Settings";

const settings = new Settings();
const httpServer = new ExpressAdapter();
Registry.getInstance().provide("Settings", settings);
Registry.getInstance().provide("HttpServer", httpServer);
Registry.getInstance().provide("Database", new PostgresAdapter());
Registry.getInstance().provide("PetsRepository", new PostgresPetsRepository());
Registry.getInstance().provide(
  "ProfilesRepository",
  new PostgresProfilesRepository()
);
Registry.getInstance().provide(
  "PreferencesRepository",
  new PostgresPreferencesRepository()
);
Registry.getInstance().provide(
  "AccountsRepository",
  new PostgresAccountsRepository()
);
Registry.getInstance().provide(
  "ReportsRepository",
  new PostgresReportsRepository()
);
Registry.getInstance().provide("PasswordHasher", new BCryptAdapter());
Registry.getInstance().provide("TokenGenerator", new JwtGenerator());
Registry.getInstance().provide("CreateProfile", new CreateProfile());
Registry.getInstance().provide("CreatePet", new CreatePet());
Registry.getInstance().provide("ListPets", new ListPets());
Registry.getInstance().provide("Signup", new Signup());
Registry.getInstance().provide("Login", new Login());
Registry.getInstance().provide("Authenticate", new Authenticate());
Registry.getInstance().provide("GetProfile", new GetProfile());
Registry.getInstance().provide("SetPreferences", new SetPreferences());
Registry.getInstance().provide("CreateReport", new CreateReport());
Registry.getInstance().provide("PetsController", new PetsController());
Registry.getInstance().provide("AccountsController", new AccountsController());
Registry.getInstance().provide("Reports", new ReportsController());

httpServer.listen(settings.port);
