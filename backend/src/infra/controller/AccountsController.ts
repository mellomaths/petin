import { Authenticate } from "../../application/account/usecase/Authenticate";
import { CreateProfile } from "../../application/account/usecase/CreateProfile";
import { GetProfile } from "../../application/account/usecase/GetProfile";
import { Login } from "../../application/account/usecase/Login";
import { SetPreferences } from "../../application/account/usecase/SetPreferences";
import { Signup } from "../../application/account/usecase/Signup";
import { Inject } from "../di/DependencyInjection";
import { HttpServer } from "../http/HttpServer";

export class AccountsController {
  @Inject("HttpServer")
  httpServer: HttpServer;

  @Inject("Signup")
  signup: Signup;

  @Inject("Login")
  login: Login;

  @Inject("Authenticate")
  authenticate: Authenticate;

  @Inject("CreateProfile")
  createProfile: CreateProfile;

  @Inject("GetProfile")
  getProfile: GetProfile;

  @Inject("SetPreferences")
  setPreferences: SetPreferences;

  constructor() {
    this.httpServer.register(
      "post",
      "/signup",
      async (params: any, body: any) => {
        const input = body;
        const output = await this.signup.execute(input);
        return output;
      }
    );
    this.httpServer.register(
      "post",
      "/login",
      async (params: any, body: any) => {
        const input = body;
        const output = await this.login.execute(input.email, input.password);
        return output;
      }
    );
    this.httpServer.register(
      "post",
      "/authenticate",
      async (params: any, body: any, file: any, headers: any) => {
        const input = body;
        const token = this.httpServer.getAuthToken(headers);
        const output = await this.authenticate.execute(token);
        return output;
      }
    );
    this.httpServer.register(
      "post",
      "/accounts/profiles",
      async (params: any, body: any, file: any, headers: any) => {
        const token = this.httpServer.getAuthToken(headers);
        const output = await this.createProfile.execute(token, body);
        return output;
      }
    );
    this.httpServer.register(
      "get",
      "/accounts/profiles",
      async (params: any, body: any, file: any, headers: any) => {
        const token = this.httpServer.getAuthToken(headers);
        let expands = [];
        if (params.expands) {
          expands = params.expands.split(",");
        }
        const output = await this.getProfile.execute(token, expands);
        return output;
      }
    );
    this.httpServer.register(
      "put",
      "/accounts/preferences",
      async (params: any, body: any, file: any, headers: any) => {
        const token = this.httpServer.getAuthToken(headers);
        const output = await this.setPreferences.execute(token, body);
        return output;
      }
    );
  }
}
