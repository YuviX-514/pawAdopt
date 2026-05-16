import bcrypt from "bcryptjs";
import User from "@/models/User";

let seeded = false;

function getConfiguredAdmins() {
  return [
    {
      username: "PawAdopt Admin 1",
      email: process.env.ADMIN_ONE_EMAIL,
      password: process.env.ADMIN_ONE_PASSWORD,
    },
    {
      username: "PawAdopt Admin 2",
      email: process.env.ADMIN_TWO_EMAIL,
      password: process.env.ADMIN_TWO_PASSWORD,
    },
  ].filter(
    (admin): admin is { username: string; email: string; password: string } =>
      Boolean(admin.email && admin.password)
  );
}

export async function ensureConfiguredAdmins() {
  if (seeded) return;

  const admins = getConfiguredAdmins();
  if (!admins.length) {
    seeded = true;
    return;
  }

  for (const admin of admins) {
    const email = admin.email.toLowerCase();
    const existing = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    if (!existing) {
      await User.create({
        username: email.split("@")[0],
        email,
        password: hashedPassword,
        provider: "credentials",
        role: "admin",
      });
      continue;
    }

    existing.role = "admin";
    existing.password = hashedPassword;
    existing.provider = existing.provider || "credentials";
    await existing.save();
  }

  seeded = true;
}
