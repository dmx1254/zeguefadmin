// app/api/orders/[id]/route.ts
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/user.model";
import { NextResponse } from "next/server";

connectDB();
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await params;
  const userId = data.id;

  try {
    const userDeleted = await UserModel.findByIdAndDelete(userId);

    return NextResponse.json(userDeleted, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}

// Route API PUT
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const data = await params;

    const userId = data.id;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          address: body.address,
          city: body.city,
          country: body.country,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(updatedUser, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      {
        status: 500,
      }
    );
  }
}
