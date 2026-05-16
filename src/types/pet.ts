import type { UserRole } from "@/lib/roles";

export type PetOwner = {
  id?: string;
  username: string;
  email: string;
  image?: string;
  role?: UserRole;
};

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  description?: string;
  photos?: string[];
  adopted: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: PetOwner;
  adoptedBy?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    message?: string;
    adoptedAt?: string;
  };
};

export type AdoptionRequest = {
  id: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    postalCode: string;
  };
  pet?: Pet;
  requester?: PetOwner;
  owner?: PetOwner;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
};

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
};
