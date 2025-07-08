import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  username: string;
  email: string;
  image?: string;
  password?: string | null;
  provider?: string;
  adoptedPets: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    password: { type: String, default: null },
    provider: { type: String, default: "credentials" },
    adoptedPets: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
