import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/product.model";
import { NextResponse } from "next/server";
import sharp from "sharp";

connectDB();

// async function processAndOptimizeImage(
//   buffer: Buffer,
//   options = { width: 800, quality: 70, format: "webp" }
// ): Promise<string> {
//   try {
//     let processor = sharp(buffer).resize(options.width);
//     processor = processor.webp({
//       quality: options.quality,
//       effort: 6,
//     });
//     const optimizedImageBuffer = await processor.toBuffer();
//     const mimeType = `image/${options.format}`;
//     const base64Image = `data:${mimeType};base64,${optimizedImageBuffer.toString(
//       "base64"
//     )}`;
//     return base64Image;
//   } catch (error) {
//     console.error("Error optimizing image:", error);
//     throw error;
//   }
// }

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData();
    const data = await params;
    const productId = data.id;

    // Extract other fields
    const updateData: any = {
      name: formData.get("name") as string,
      price: Number(formData.get("price") as string),
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      material: formData.get("material") as string,
      origin: formData.get("origin") as string,
      care: formData.get("care") as string,
      sizes: JSON.parse(formData.get("sizes") as string),
      stock: Number(formData.get("stock") as string),
      discount: Number(formData.get("discount") as string),
    };

    const notNullData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => !!value)
    );

    // console.log("notNullData", notNullData);

    // console.log(productId);
    // console.log(notNullData);

    // Update the product
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: notNullData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // console.log("Updated product:", updatedProduct);

    return NextResponse.json(
      { message: "Produit mis à jour avec success", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await params;
    const productId = data.id;

    const deletedProduct = await ProductModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    );
  }
}
