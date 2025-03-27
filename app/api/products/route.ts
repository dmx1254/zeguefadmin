// app/api/products/route.ts
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/product.model";
import { NextResponse } from "next/server";
import sharp from "sharp";

connectDB();

async function processAndOptimizeImage(
  buffer: Buffer,
  options = { width: 800, quality: 70, format: "webp" }
): Promise<string> {
  try {
    // Créer une instance de traitement d'image
    let processor = sharp(buffer).resize(options.width); // Redimensionner (conserve le ratio)

    // Appliquer les options selon le format choisi

    processor = processor.webp({
      quality: options.quality,
      effort: 6, // Niveau de compression (0-6), 6 étant le plus élevé
    });

    // Générer le buffer optimisé
    const optimizedImageBuffer = await processor.toBuffer();

    // Convertir en base64 avec le bon type MIME
    const mimeType = `image/${options.format}`;
    const base64Image = `data:${mimeType};base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;

    return base64Image;
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'image:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extraire l'image
    const imageFile = formData.get("image") as File;

    // Récupérer les autres données
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const material = formData.get("material") as string;
    const origin = formData.get("origin") as string;
    const care = formData.get("care") as string;
    const sizes = JSON.parse(formData.get("sizes") as string);
    const discount = formData.get("discount")
      ? parseFloat(formData.get("discount") as string)
      : undefined;
    const stock = parseInt(formData.get("stock") as string);

    // Traiter l'image
    let base64Image = "";
    if (imageFile) {
      const imageBuffer = await imageFile.arrayBuffer();
      base64Image = await processAndOptimizeImage(Buffer.from(imageBuffer));
    }

    // Créer le produit
    const productData = {
      name,
      price,
      image: base64Image,
      description,
      category,
      details: {
        material,
        origin,
        care,
        sizes,
      },
      discount,
      stock,
    };

    const product = await ProductModel.create(productData);

    return NextResponse.json(
      { message: "Produit ajouté avec succès", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout du produit" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await ProductModel.countDocuments();

    // Get paginated products
    const products = await ProductModel.find({})
      .sort({ createdAt: -1 })
      .select("-__v")
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    );
  }
}
