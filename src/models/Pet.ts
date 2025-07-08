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

    // kis user ne upload kiya
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // adoption info
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
},

  },
  { timestamps: true }
);

// agar pehle se model exist kare to woh use kar lo, warna naya create karo
export default mongoose.models.Pet || mongoose.model("Pet", PetSchema);
