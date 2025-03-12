"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { OrderC, formatPrice } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [localOrders, setLocalOrders] = useState<OrderC[]>([]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/guest-order");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  useEffect(() => {
    if (orders) {
      setLocalOrders(orders);
    }
  }, [orders]);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  // console.log(selectedOrder);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/guest-order/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      const data: OrderC = await response.json();

      // Mise à jour locale du statut
      //   setLocalOrders((prevOrders) =>
      //     prevOrders.map((order) => {
      //       return order._id === orderId ? { ...order, status: newStatus } : order;
      //     })
      //   );
      if (data) {
        setLocalOrders((prevOrders) => {
          return prevOrders.map((o) => {
            if (o._id === data._id) {
              return {
                ...o,
                status: data.status,
              };
            }

            return o;
          });
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/guest-order/${orderId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete order");

      // Mise à jour locale après suppression
      setLocalOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Commandes</h2>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
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
            ) : localOrders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Aucune commande trouvée
                </TableCell>
              </TableRow>
            ) : (
              localOrders?.map((order: any) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    {order.userId?.firstName} {order.userId?.lastName}
                  </TableCell>
                  <TableCell>
                    {formatPrice(order.total + order.shipping)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        updateOrderStatus(order._id, value)
                      }
                    >
                      <SelectTrigger
                        className={`w-32 ${
                          statusColors[
                            order.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="processing">En cours</SelectItem>
                        <SelectItem value="completed">Terminée</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="space-x-4">
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="bg-orange-100 text-orange-500 border border-orange-500 hover:bg-orange-100 hover:opacity-90 hover:text-orange-500"
                    >
                      <Eye className="h-4 w-4" />
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOrder(order._id)}
                      className="bg-red-100 text-red-500 border border-red-500 hover:bg-red-100 hover:opacity-90 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Détails de la commande #{selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p>
                      {selectedOrder.user?.name}{" "}
                     
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{selectedOrder.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p>{selectedOrder.user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p>{selectedOrder.user?.address}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Articles commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Prix unitaire</TableHead>
                        <TableHead>Livraison</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="flex items-center gap-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.size && (
                                <p className="text-sm text-gray-500">
                                  Taille: {item.size}
                                </p>
                              )}
                              {item.volume && (
                                <p className="text-sm text-gray-500">
                                  Volume: {item.volume}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatPrice(item.price)}</TableCell>
                          <TableCell>
                            {item.shippingRegion || "Casablanca"}
                          </TableCell>
                          <TableCell>
                            {formatPrice(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-right font-medium"
                        >
                          Sous-total
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(selectedOrder.total)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-right font-medium"
                        >
                          Livraison
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(selectedOrder.shipping)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatPrice(
                            selectedOrder.total + selectedOrder.shipping
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
