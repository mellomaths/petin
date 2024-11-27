import { Authenticate } from "../../application/account/usecase/Authenticate";
import { Login } from "../../application/account/usecase/Login";
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
  }
}
