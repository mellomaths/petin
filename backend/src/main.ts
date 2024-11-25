import { CreatePet } from "./application/pets/CreatePet";
import { PetsController } from "./infra/controller/PetsController";
import { PostgresAdapter } from "./infra/database/PostgresAdapter";
import { Registry } from "./infra/di/DependencyInjection";
import { ExpressAdapter } from "./infra/http/ExpressAdapter";
import { PostgresPetsRepository } from "./infra/repository/pets/PostgresPetsRepository";
import { Settings } from "./infra/settings/Settings";

const settings = new Settings();
const httpServer = new ExpressAdapter();
Registry.getInstance().provide("Settings", settings);
Registry.getInstance().provide("HttpServer", httpServer);
Registry.getInstance().provide("Database", new PostgresAdapter());
Registry.getInstance().provide("PetsRepository", new PostgresPetsRepository());
Registry.getInstance().provide("CreatePet", new CreatePet());
Registry.getInstance().provide("PetsController", new PetsController());
httpServer.listen(settings.port);
