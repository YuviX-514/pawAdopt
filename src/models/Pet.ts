import mongoose ,{Document, Types} from "mongoose";

export interface PetType extends Document {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  description?: string;
  photos: string[];
  createdBy: Types.ObjectId;
  adopted: boolean;
  adoptedBy?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    message?: string;
    adoptedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
const PetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String },
    age: { type: Number },
    gender: { type: String },
    description: { type: String },
    photos: [String],

    // Reference to User who created pet listing
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    adopted: { type: Boolean, default: false },
    

    adoptedBy: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
      message: { type: String },
      adoptedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Pet || mongoose.model("Pet", PetSchema);
