// app/api/orders/[id]/route.ts
import { connectDB } from "@/lib/db";
import OrderModel from "@/lib/models/order.model";
import ProductModel from "@/lib/models/product.model";
import { NextResponse } from "next/server";

connectDB();

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await params;
    const orderId = data.id;
    const { status } = await req.json();

    // Vérifier si le statut est valide
    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut non valide" }, { status: 400 });
    }

    // Rechercher et mettre à jour la commande
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true } // Retourne la commande mise à jour
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    const productParsed = JSON.parse(JSON.stringify(updatedOrder));

    const productId = productParsed.items[0].id;

    if (productId) {
      await ProductModel.findOneAndUpdate(
        { _id: productId },
        {
          $inc: { stock: -1 },
        }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
}

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
