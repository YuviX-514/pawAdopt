import mongoose, { Schema, Document } from "mongoose";
import { USER_ROLES, type UserRole } from "@/lib/roles";

export interface IUser extends Document {
  name?: string;
  username: string;
  email: string;
  image?: string;
  password?: string | null;
  provider?: string;
  role: UserRole;
  adoptedPets: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: "/user.png" },
    password: { type: String, default: null },
    provider: { type: String, default: "credentials" },
    role: { type: String, enum: [...USER_ROLES], default: "adopter" },
    adoptedPets: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
