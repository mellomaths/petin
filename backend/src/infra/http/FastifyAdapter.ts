import Fastify, { FastifyReply, RequestPayload } from "fastify";
import cors from "@fastify/cors";
import { HttpServer } from "./HttpServer";
import { ApplicationException } from "../exception/ApplicationException";
import { Request } from "express";
import fastifyFormbody from "@fastify/formbody";

export class FastifyAdapter implements HttpServer {
  app: any;
  upload: any;

  constructor() {
    const fastify = Fastify({
      logger: true,
    });
    fastify.register(cors);
    fastify.register(fastifyFormbody);
    this.app = fastify;
  }

  getAuthToken(headers: any): string {
    const authorization = headers.authorization;
    if (!authorization) {
      throw new ApplicationException(
        401,
        { message: "Unauthorized" },
        "Unauthorized"
      );
    }
    return authorization.replace("Bearer ", "");
  }

  register(
    method: string,
    url: string,
    callback: Function,
    isUpload: boolean = false
  ): void {
    const handler = async (req: Request, reply: FastifyReply) => {
      try {
        const output = await callback(
          req.query,
          req.body,
          req.file,
          req.headers
        );
        if (method === "delete" || method === "patch" || method === "put") {
          return reply.status(204).send();
        }
        if (method === "post") {
          return reply.status(201).send(output);
        }
        return reply.send(output);
      } catch (error: any) {
        if (error instanceof ApplicationException) {
          return reply.status(error.status).send(error.payload);
        }
        return reply.status(500).send({ message: "Internal Server Error" });
      }
    };

    if (isUpload) {
      this.app[method](url, this.upload.single("file"), handler);
    } else {
      this.app.route({
        method,
        url,
        handler,
      });
    }
  }

  async listen(port: number): Promise<void> {
    await this.app.listen({ port, host: "0.0.0.0" });
  }
}
