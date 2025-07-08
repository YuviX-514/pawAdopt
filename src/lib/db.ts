import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

export const connectDB = async ()=> {
  if(mongoose.connection.readyState >=1)return;

  try{
    await mongoose.connect(MONGODB_URI, {
      dbName: "pet-adopt",
    });
    console.log("MongoDB Connected");
  }catch(error){
    console.error("MongoDB connection error:", error);
    throw error;
  }
}