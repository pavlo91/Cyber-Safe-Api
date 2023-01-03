import { Connection } from "typeorm";
import { IResolvers } from "graphql-tools";
import { Request } from "express";

declare global {
  type IContext = {
    connection: Connection;
    req: Request;
  };

  type IResolver = IResolvers<any, IContext>;
}
