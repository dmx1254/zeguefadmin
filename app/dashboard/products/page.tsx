// app/dashboard/products/page.tsx
"use client";

import { ChangeEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Loader } from "lucide-react";
import Link from "next/link";
import { ProductDash, formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    material: "",
    origin: "",
    care: "",
    sizes: "",
    stock: "",
    discount: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", page],
    queryFn: async () => {
      const res = await fetch(`/api/products?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProduct = async (productId: string) => {
    try {
      setIsUpdating(true);
      const formDataToSend = new FormData();

      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          formDataToSend.append(key, value);
        }
      });

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        body: formDataToSend,
      });
      
      setIsOpen(false);

      if (!res.ok) throw new Error("Erreur lors de la mise à jour du produit");

      // Invalidate and refetch products query
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success("Produit mis à jour avec success", {
        style: {
          background: "#16a34a",
          color: "#fff",
        },
      });

      setFormData({
        name: "",
        price: "",
        description: "",
        category: "",
        material: "",
        origin: "",
        care: "",
        sizes: "",
        stock: "",
        discount: "",
      });
      // setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du produit", {
        style: {
          background: "#dc2626",
          color: "#fff",
        },
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      // Invalidate and refetch products query
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success("Produit supprimé avec success", {
        style: {
          background: "#16a34a",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      toast.error("Erreur lors de la suppression du produit", {
        style: {
          background: "#dc2626",
          color: "#fff",
        },
      });
    }
  };

  const openEditDialog = (product: ProductDash) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      category: product.category,
      material: product.details.material || "",
      origin: product.details.origin || "",
      care: product.details.care || "",
      sizes: JSON.stringify(product.details.sizes || []),
      stock: product.stock.toString(),
      discount: product.discount?.toString() || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Products</h2>
        <Link href="/dashboard/products/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              data?.products?.map((product: ProductDash) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="space-x-2">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Mettre à jour le produit</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Prix</Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              value={formData.price}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <Input
                              id="category"
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                              id="stock"
                              name="stock"
                              type="number"
                              value={formData.stock}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="material">Matière</Label>
                            <Input
                              id="material"
                              name="material"
                              value={formData.material}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="origin">Origine</Label>
                            <Input
                              id="origin"
                              name="origin"
                              value={formData.origin}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="care">Instructions de soin</Label>
                            <Input
                              id="care"
                              name="care"
                              value={formData.care}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sizes">Tailles (JSON)</Label>
                            <Input
                              id="sizes"
                              name="sizes"
                              value={formData.sizes}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discount">Remise (%)</Label>
                            <Input
                              id="discount"
                              name="discount"
                              type="number"
                              value={formData.discount}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => handleUpdateProduct(product._id)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            {isUpdating ? "Updating..." : "Mettre à jour"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="text-sm">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setPage((p) => Math.min(data.pagination.totalPages, p + 1))
            }
            disabled={page === data.pagination.totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
