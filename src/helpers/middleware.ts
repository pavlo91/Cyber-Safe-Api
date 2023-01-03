import { NOT_AUTHENTICATED } from "./errors";
import { getUserFromToken } from "./jwt";
import User from "../entities/user";

export const authenticated = (
  next: (
    parent: any,
    args: any,
    context: IContext & { user: User },
    info: any
  ) => any
) => async (parent: any, args: any, context: IContext, info: any) => {
  const token = context.req.header("x-token");
  if (!token) {
    throw NOT_AUTHENTICATED;
  }

  const user = await getUserFromToken(token, context.connection);
  if (!user) {
    throw NOT_AUTHENTICATED;
  }

  return await next(parent, args, { ...context, user }, info);
};

export const withUser = (
  next: (
    parent: any,
    args: any,
    context: IContext & { user?: User },
    info: any
  ) => any
) => async (parent: any, args: any, context: IContext, info: any) => {
  let user: User | undefined;

  const token = context.req.header("x-token");
  if (token) {
    user = await getUserFromToken(token, context.connection);
  }

  return await next(parent, args, { ...context, user }, info);
};
