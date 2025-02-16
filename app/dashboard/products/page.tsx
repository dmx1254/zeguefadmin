// app/dashboard/products/page.tsx
"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Edit2, Loader } from "lucide-react";
import Link from "next/link";
import { OrderC, ProductDash, formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  const [localProducts, setLocalProducts] = useState<ProductDash[]>([]);
  const [isPriceUpdating, setIsPriceUpdating] = useState<boolean>(false);
  const [isPriceUpdatingLoader, setIsPriceUpdatingLoader] =
    useState<boolean>(false);
  const [price, setPrice] = useState<number | string>(0);
  const [idProductPriceUpdating, setIdProductPriceUpdating] =
    useState<string>("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  useEffect(() => {
    if (products) {
      setLocalProducts(products);
    }
  }, [products]);

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete product status");

      setLocalProducts((prevProducts) =>
        prevProducts.filter((p) => p._id !== productId)
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleUpdatePrice = async (productId: string) => {
    try {
      setIsPriceUpdatingLoader(true);
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price: Number(price) }),
      });

      if (!res.ok) throw new Error("Failed to update product status");

      const data = await res.json();

      if (data) {
        setLocalProducts((prevProducts) =>
          prevProducts.map((p) => {
            if (p._id === productId) {
              return {
                ...p,
                price: data.price,
              };
            }
            return p;
          })
        );
        setIsPriceUpdating(false);
        setIdProductPriceUpdating("");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsPriceUpdatingLoader(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Produits</h2>
        <Link href="/dashboard/products/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Aucun produit trouvé
                </TableCell>
              </TableRow>
            ) : (
              localProducts?.map((product: ProductDash) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {idProductPriceUpdating === product._id &&
                    isPriceUpdating ? (
                      <div className="flex flex-col items-start gap-2">
                        <Input
                          type="number"
                          defaultValue={product.price}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setPrice(e.target.value)
                          }
                        />
                        <div className="flex items-center gap-2">
                          <button
                            className="bg-green-500 text-white transition-colors hover:bg-green-600 text-sm p-1.5 rounded outline-none"
                            onClick={() => handleUpdatePrice(product._id)}
                            disabled={isPriceUpdatingLoader}
                          >
                            {isPriceUpdatingLoader ? (
                              <Loader
                                size={24}
                                className="text-white animate-spin"
                              />
                            ) : (
                              "Confirmer"
                            )}
                          </button>
                          <button
                            className="bg-red-500 text-white transition-colors hover:bg-red-600 text-sm p-1.5 rounded outline-none"
                            onClick={() => {
                              setIsPriceUpdating(false);
                              setIdProductPriceUpdating("");
                            }}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600"
                      onClick={() => {
                        setIdProductPriceUpdating(product._id);
                        setIsPriceUpdating(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => deleteProduct(product._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
