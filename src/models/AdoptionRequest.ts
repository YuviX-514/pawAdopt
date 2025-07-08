import mongoose, { Schema, Document } from "mongoose";

export interface IAdoptionRequest extends Document {
  user: mongoose.Types.ObjectId;
  pet: mongoose.Types.ObjectId;
  message?: string;
  status: "pending" | "approved" | "rejected";
}

const AdoptionRequestSchema = new Schema<IAdoptionRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pet: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdoptionRequest ||
  mongoose.model<IAdoptionRequest>("AdoptionRequest", AdoptionRequestSchema);
