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
  listingRejectedCount: number;
  listingBanned: boolean;
  listingBanReason?: string;
  listingBanLiftedAt?: Date;
  roleRequest?: {
    requestedRole?: UserRole;
    message?: string;
    status?: "none" | "pending" | "approved" | "rejected";
    requestedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
  };
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
    listingRejectedCount: { type: Number, default: 0 },
    listingBanned: { type: Boolean, default: false },
    listingBanReason: { type: String },
    listingBanLiftedAt: { type: Date },
    roleRequest: {
      requestedRole: { type: String, enum: [...USER_ROLES] },
      message: { type: String },
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
      },
      requestedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
