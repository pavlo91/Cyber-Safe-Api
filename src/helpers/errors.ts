import { ApolloError } from "apollo-server-express";

export class HTTPError extends Error {
  statusCode: number = 500;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}

export const NOT_AUTHENTICATED = new ApolloError("You are not authenticated", "NOT_AUTHENTICATED");

export const createInternalServerError = (ticketNumber: number) =>
  new ApolloError("Internal Server Error", "INTERNAL_SERVER_ERROR", {
    ticketNumber
  });
