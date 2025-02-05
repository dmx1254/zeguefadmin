// app/api/dashboard/stats/route.ts
import { connectDB } from "@/lib/db";
import OrderModel from "@/lib/models/order.model";
import UserModel from "@/lib/models/user.model";
import ProductModel from "@/lib/models/product.model";
import { NextResponse } from "next/server";

connectDB();

export async function GET() {
  try {
    // Statistiques générales
    const [totalOrders, totalUsers, totalProducts, revenue] = await Promise.all(
      [
        OrderModel.countDocuments(),
        UserModel.countDocuments(),
        ProductModel.countDocuments(),
        OrderModel.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: "$total" },
            },
          },
        ]),
      ]
    );

    // Commandes récentes avec informations utilisateur
    const recentOrders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
