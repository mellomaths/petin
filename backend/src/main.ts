import { Authenticate } from "./application/account/usecase/Authenticate";
import { Login } from "./application/account/usecase/Login";
import { Signup } from "./application/account/usecase/Signup";
import { CreateOwner } from "./application/owner/usecase/CreateOwner";
import { CreatePet } from "./application/pet/usecase/CreatePet";
import { ListPets } from "./application/pet/usecase/ListPets";
import { JwtGenerator } from "./infra/auth/JwtGenerator";
import { AccountsController } from "./infra/controller/AccountsController";
import { OwnersController } from "./infra/controller/OwnersController";
import { PetsController } from "./infra/controller/PetsController";
import { PostgresAdapter } from "./infra/database/PostgresAdapter";
import { Registry } from "./infra/di/DependencyInjection";
import { BCryptAdapter } from "./infra/hash/BCryptAdapter";
import { ExpressAdapter } from "./infra/http/ExpressAdapter";
import { PostgresAccountsRepository } from "./infra/repository/account/PostgresAccountsRepository";
import { PostgresOwnersRepository } from "./infra/repository/owner/PostgresOwnersRepository";
import { PostgresPetsRepository } from "./infra/repository/pet/PostgresPetsRepository";
import { Settings } from "./infra/settings/Settings";

const settings = new Settings();
const httpServer = new ExpressAdapter();
Registry.getInstance().provide("Settings", settings);
Registry.getInstance().provide("HttpServer", httpServer);
Registry.getInstance().provide("Database", new PostgresAdapter());
Registry.getInstance().provide("PetsRepository", new PostgresPetsRepository());
Registry.getInstance().provide(
  "OwnersRepository",
  new PostgresOwnersRepository()
);
Registry.getInstance().provide(
  "AccountsRepository",
  new PostgresAccountsRepository()
);
Registry.getInstance().provide("PasswordHasher", new BCryptAdapter());
Registry.getInstance().provide("TokenGenerator", new JwtGenerator());
Registry.getInstance().provide("CreateOwner", new CreateOwner());
Registry.getInstance().provide("OwnersController", new OwnersController());
Registry.getInstance().provide("CreatePet", new CreatePet());
Registry.getInstance().provide("ListPets", new ListPets());
Registry.getInstance().provide("PetsController", new PetsController());
Registry.getInstance().provide("Signup", new Signup());
Registry.getInstance().provide("Login", new Login());
Registry.getInstance().provide("Authenticate", new Authenticate());
Registry.getInstance().provide("AccountsController", new AccountsController());
httpServer.listen(settings.port);
