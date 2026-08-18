export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  pincode?: string;
  country: string;
  isDefault: boolean;
  addressType?: string;
}

export type AddressInput = Omit<Address, "_id">;
