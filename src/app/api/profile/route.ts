import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      username: user.username,
      image: user.image,
      email: user.email,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const formData = await req.formData();
  const username = formData.get("username") as string;
  const imageFile = formData.get("image") as File | null;

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  let imageUrl = user.image;

  if (imageFile) {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "users",
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve(result);
        }
      ).end(buffer);
    });

    imageUrl = uploadRes.secure_url;
  }

  user.username = username;
  user.image = imageUrl;

  await user.save();

  return NextResponse.json({ message: "Profile updated", user });
}
