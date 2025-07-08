import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Pet from "@/models/Pet";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    // change "photo" → "photos" (fix for error #1)
    const file = formData.get("photos") as File;

    if (!file) {
      return NextResponse.json({ message: "Photo required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "pets" },
          (err, result) => {
            if (err || !result) return reject(err);
            resolve(result);
          }
        )
        .end(buffer);
    });

    await connectDB();

    // find user from DB (fix for error #2)
    const dbUser = await User.findOne({ email: session.user?.email });
    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const pet = await Pet.create({
      name: formData.get("name"),
      species: formData.get("species"),
      breed: formData.get("breed") || "",
      age: Number(formData.get("age")) || null,
      gender: formData.get("gender"),
      description: formData.get("description"),
      photos: [uploadRes.secure_url],
      createdBy: dbUser._id,
    });

    return NextResponse.json(pet);
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
