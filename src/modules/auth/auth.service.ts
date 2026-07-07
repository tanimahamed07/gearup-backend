import bcrypt from "bcryptjs";
import { User } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const loginUser = async (payload: Pick<User, "email" | "password">) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  console.log(isPasswordMatch);

  if (!isPasswordMatch) {
    throw new Error("password or email not valid");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  
};

export const authService = {
  loginUser,
};
