// app/api/users/route.ts
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import UserModel from "@/lib/models/user.model";

connectDB();

export async function GET(req: Request) {
  try {
    const users = await UserModel.find({}).lean();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}