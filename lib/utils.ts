import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number | string) => {
  return new Intl.NumberFormat("ar-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
};

export interface UserResponse {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  city: string;
  address: string;
  password?: string;
  phone: string;
}

export const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  // Génération du numéro de commande
  const orderNumber = `ORD-${year}${minutes}${seconds}-${milliseconds}`;

  return orderNumber;
};

export interface CartResponse extends Document {
  _id: string;
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  volume?: string;
}

export interface Order extends Document {
  _id: string;
  orderNumber: string;
  userId: string;
  items: CartResponse[];
  total: number;
  volume?: string;
  shipping: number;
  paymentMethod: "card" | "cash";
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export const djellabas = [
  {
    id: "HG15LP",
    name: "Djellabas femme",
    slug: "djellabas-femme",
  },
  {
    id: "PA37KW",
    name: "Djellabas homme",
    slug: "djellabas-homme",
  },
  {
    id: "PA37KW",
    name: "Djellabas enfant",
    slug: "djellabas-enfant",
  },
];

export function maskDisplayName(name: string) {
  if (!name || name.length < 3) {
    // Si le nom est trop court, ne pas le masquer complètement
    return name;
  }

  const firstChar = name[0]; // Premier caractère
  const lastChar = name[name.length - 1]; // Dernier caractère

  // Remplir les caractères intermédiaires par des étoiles
  const maskedPart = "*".repeat(name.length - 2);

  return `${firstChar}${maskedPart}${lastChar}`;
}

export interface Review {
  id: number;
  name: string;
  reviews: number;
  date: string;
  message: string;
  titre: string;
  image: string;
}

interface Cart {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  volume?: string;
  size?: string;
}

export interface OrderC {
  _id: string;
  orderNumber: string;
  userId: string;
  items: Cart[];
  total: number;
  shipping: number;
  paymentMethod: "card" | "cash";
  status: "pending" | "processing" | "completed" | "cancelled";
}

interface ProductDetails {
  material?: string;
  origin: string;
  care?: string;
  sizes?: string[];
}

export interface ProductDash {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  details: ProductDetails;
  discount?: number;
  stock: number;
}
