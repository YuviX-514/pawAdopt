import mongoose, { Schema, Document } from "mongoose";

export type AdoptionRequestStatus = "pending" | "approved" | "rejected";

export type AdoptionContact = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
};

export interface IAdoptionRequest extends Document {
  requester: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  pet: mongoose.Types.ObjectId;
  contact: AdoptionContact;
  message?: string;
  status: AdoptionRequestStatus;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
}

const AdoptionRequestSchema = new Schema<IAdoptionRequest>(
  {
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pet: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
    contact: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "" },
      postalCode: { type: String, required: true },
    },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AdoptionRequestSchema.index({ requester: 1, pet: 1, status: 1 });
AdoptionRequestSchema.index({ owner: 1, status: 1 });
AdoptionRequestSchema.index({ pet: 1, status: 1 });

export default mongoose.models.AdoptionRequest ||
  mongoose.model<IAdoptionRequest>("AdoptionRequest", AdoptionRequestSchema);
