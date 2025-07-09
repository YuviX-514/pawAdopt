import mongoose from "mongoose";

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
