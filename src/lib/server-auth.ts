import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User, { type IUser } from "@/models/User";
import { normalizeRole, type UserRole } from "@/lib/roles";

export type CurrentUser = {
  id: string;
  email: string;
  username: string;
  image?: string;
  role: UserRole;
  document: IUser;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return null;

  const role = normalizeRole(user.role);

  if (user.role !== role) {
    user.role = role;
    await user.save();
  }

  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    image: user.image,
    role,
    document: user,
  };
}
