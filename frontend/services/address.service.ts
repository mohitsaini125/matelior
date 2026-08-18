import { api } from "./api";
import { Address, AddressInput } from "@/types/address";

export const addressService = {
  async list(): Promise<Address[]> {
    const list = await api.get<Address[]>("/addresses");
    return Array.isArray(list) ? list : [];
  },

  async create(payload: AddressInput): Promise<Address> {
    const body = {
      ...payload,
      pincode: payload.pincode || payload.postalCode,
      postalCode: payload.postalCode || payload.pincode,
    };
    return api.post<Address>("/addresses", body);
  },

  async update(id: string, payload: Partial<AddressInput>): Promise<Address> {
    const body = {
      ...payload,
      pincode: payload.pincode || payload.postalCode,
      postalCode: payload.postalCode || payload.pincode,
    };
    return api.patch<Address>(`/addresses/${id}`, body);
  },

  async remove(id: string): Promise<void> {
    return api.delete<void>(`/addresses/${id}`);
  },

  async setDefault(id: string): Promise<Address> {
    return api.patch<Address>(`/addresses/${id}/default`, {});
  },
};
