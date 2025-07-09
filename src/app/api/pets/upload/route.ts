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

    const files = formData.getAll("photos") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "At least one photo is required" },
        { status: 400 }
      );
    }

    const photoUrls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadRes = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "pets",
            },
            (err, result) => {
              if (err || !result) return reject(err);
              resolve(result);
            }
          )
          .end(buffer);
      });

      photoUrls.push(uploadRes.secure_url);
    }

    await connectDB();

    const dbUser = await User.findOne({ email: session.user?.email });

    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const pet = await Pet.create({
      name: formData.get("name")?.toString() || "",
      species: formData.get("species")?.toString() || "",
      breed: formData.get("breed")?.toString() || "",
      age: formData.get("age")
        ? Number(formData.get("age")?.toString())
        : null,
      gender: formData.get("gender")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      photos: photoUrls,
      createdBy: dbUser._id,
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
