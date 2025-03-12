// app/api/orders/[id]/route.ts
import { connectDB } from "@/lib/db";
import OrderModel from "@/lib/models/order.model";
import { NextResponse } from "next/server";

connectDB();


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await params;
  const orderId = data.id;

  try {
    const orderDeleted = await OrderModel.findByIdAndDelete(orderId);

    return NextResponse.json(orderDeleted, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
