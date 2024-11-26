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
  }
}
