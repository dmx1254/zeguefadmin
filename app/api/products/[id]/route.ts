import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/product.model";

import { NextResponse } from "next/server";

connectDB();
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await params;
  const productId = data.id;

  try {
    const orderDeleted = await ProductModel.findByIdAndDelete(productId);

    return NextResponse.json(orderDeleted, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await params;
  const productId = data.id;

  const { price } = await req.json();

  try {
    const orderUpadted = await ProductModel.findByIdAndUpdate(
      productId,
      {
        $set: {
          price,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json(orderUpadted, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
