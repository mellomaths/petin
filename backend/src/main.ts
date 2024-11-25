import { CreateOwner } from "./application/owner/CreateOwner";
import { CreatePet } from "./application/pets/CreatePet";
import { OwnersController } from "./infra/controller/OwnersController";
import { PetsController } from "./infra/controller/PetsController";
import { PostgresAdapter } from "./infra/database/PostgresAdapter";
import { Registry } from "./infra/di/DependencyInjection";
import { BCryptAdapter } from "./infra/hash/BCryptAdapter";
import { ExpressAdapter } from "./infra/http/ExpressAdapter";
import { PostgresOwnersRepository } from "./infra/repository/owners/PostgresOwnersRepository";
import { PostgresPetsRepository } from "./infra/repository/pets/PostgresPetsRepository";
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
Registry.getInstance().provide("PasswordHasher", new BCryptAdapter());
Registry.getInstance().provide("CreateOwner", new CreateOwner());
Registry.getInstance().provide("OwnersController", new OwnersController());
Registry.getInstance().provide("CreatePet", new CreatePet());
Registry.getInstance().provide("PetsController", new PetsController());
httpServer.listen(settings.port);
