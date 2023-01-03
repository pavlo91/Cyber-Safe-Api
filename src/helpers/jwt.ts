import { Connection } from "typeorm";
import jwt from "jsonwebtoken";
import moment from "moment";

import config from "../config";
import User from "../entities/user";

export const getUserFromToken = async (
  token: string,
  connection: Connection
) => {
  const payload: any = jwt.verify(token, config.secret);

  return await connection.manager.findOne(User, {
    where: payload
  });
};

export const generateTokenForUser = ({ uuid }: User) => {
  const token = jwt.sign({ uuid }, config.secret, {
    expiresIn: "15 days"
  });
  const expiresAt = moment()
    .add(15, "days")
    .toDate();

  return { token, expiresAt };
};
