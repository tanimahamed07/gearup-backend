import bcrypt from "bcryptjs";
import { User } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";
import config from "../../config";

const registerUser = async (
  payload: Pick<User, "name" | "email" | "password" | "role" | "phone">,
) => {
  const { name, email, password, role, phone } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (isUserExist) {
    throw new Error("User with this email already exists");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      role,
      phone,
    },
  });

  return createdUser;
};

export const userService = {
  registerUser,
};
