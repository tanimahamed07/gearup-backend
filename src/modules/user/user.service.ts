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

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: {
      password: true,
    },
  });
  return user;
};
const getAllProfile = async () => {
  const user = await prisma.user.findMany({
    omit: {
      password: true,
    },
  });
  return user;
};

const updateUserStatus = async (
  userId: string,
  status: "ACTIVE" | "SUSPENDED",
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Update user status
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};

export const userService = {
  registerUser,
  getMyProfile,
  getAllProfile,
  updateUserStatus,
};
