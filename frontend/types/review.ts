export interface Review {
  _id: string;
  user: string | { _id: string; name: string };
  userName?: string;
  product: string | any;
  rating: number;
  review?: string;
  title?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewInput {
  productId: string;
  rating: number;
  review: string;
  title?: string;
  comment?: string;
}
