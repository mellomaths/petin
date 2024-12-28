import { Authenticate } from "./application/account/usecase/Authenticate";
import { CheckDocumentNumber } from "./application/account/usecase/CheckDocumentNumber";
import { CheckZipCode } from "./application/account/usecase/CheckZipCode";
import { CreateProfile } from "./application/account/usecase/CreateProfile";
import { GetProfile } from "./application/account/usecase/GetProfile";
import { Login } from "./application/account/usecase/Login";
import { SetPreferences } from "./application/account/usecase/SetPreferences";
import { Signup } from "./application/account/usecase/Signup";
import { HealthCheck } from "./application/health/usecase/HealthCheck";
import { CreatePet } from "./application/pet/usecase/CreatePet";
import { ListPets } from "./application/pet/usecase/ListPets";
import { CreateReport } from "./application/report/usecase/CreateReport";
import { BrasilApi } from "./infra/api/gov/br/BrasilApi";
import { BrDocumentNumberApi } from "./infra/api/gov/br/BrDocumentNumberApi";
import { BrZipCodeApi } from "./infra/api/gov/br/BrZipCodeApi";
import { JwtGenerator } from "./infra/auth/JwtGenerator";
import { AccountsController } from "./infra/controller/AccountsController";
import { HealthCheckController } from "./infra/controller/HealthCheckController";
import { PetsController } from "./infra/controller/PetsController";
import { ReportsController } from "./infra/controller/ReportsController";
import { ValidatorController } from "./infra/controller/ValidatorController";
import { PostgresAdapter } from "./infra/database/PostgresAdapter";
import { Registry } from "./infra/di/DependencyInjection";
import { BCryptAdapter } from "./infra/hash/BCryptAdapter";
import { FastifyAdapter } from "./infra/http/FastifyAdapter";
import { RabbitMQAdapter } from "./infra/queue/RabbitMQAdapter";
import { PostgresAccountsRepository } from "./infra/repository/account/PostgresAccountsRepository";
import { PostgresPreferencesRepository } from "./infra/repository/account/preferences/PostgresPreferencesRepository";
import { PostgresProfilesRepository } from "./infra/repository/account/profile/PostgresProfilesRepository";
import { PostgresPetsRepository } from "./infra/repository/pet/PostgresPetsRepository";
import { PostgresReportsRepository } from "./infra/repository/report/PostgresReportsRepository";
import { Settings } from "./infra/settings/Settings";

const settings = new Settings();
const httpServer = new FastifyAdapter();
Registry.getInstance().provide("Settings", settings);
Registry.getInstance().provide("HttpServer", httpServer);
Registry.getInstance().provide("Database", new PostgresAdapter());
Registry.getInstance().provide("MessageBroker", new RabbitMQAdapter());
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
Registry.getInstance().provide("HealthCheck", new HealthCheck());
Registry.getInstance().provide(
  "CheckDocumentNumber",
  new CheckDocumentNumber()
);
Registry.getInstance().provide(
  "BrDocumentNumberApi",
  new BrDocumentNumberApi()
);
Registry.getInstance().provide("CheckZipCode", new CheckZipCode());
Registry.getInstance().provide("BrasilApi", new BrasilApi());
Registry.getInstance().provide("BrZipCodeApi", new BrZipCodeApi());
Registry.getInstance().provide("PetsController", new PetsController());
Registry.getInstance().provide("AccountsController", new AccountsController());
Registry.getInstance().provide("ReportsController", new ReportsController());
Registry.getInstance().provide(
  "HealthCheckController",
  new HealthCheckController()
);
Registry.getInstance().provide(
  "ValidatorController",
  new ValidatorController()
);

httpServer.listen(settings.getPort());
