// app/api/orders/route.ts
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import OrderModel from "@/lib/models/order.model";
import UserModel from "@/lib/models/user.model"; // Assurez-vous d'importer le modèle User

connectDB();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!)
    : undefined;

  try {
    const orders = await OrderModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit ?? 0)
      .lean();

    const ordersWithUserDetails = await Promise.all(
      orders.map(async (order) => {
        const user = await UserModel.findById(order.userId)
          .select("firstName lastName email phone address")
          .lean();

        return {
          ...order,
          user: {
            firstName: (user as any)?.firstName,
            lastName: (user as any)?.lastName,
            email: (user as any)?.email,
            phone: (user as any)?.phone,
            address: (user as any)?.address,
          },
        };
      })
    );

    return NextResponse.json(ordersWithUserDetails, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
