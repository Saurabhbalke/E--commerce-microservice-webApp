export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
  updatedAt?: Date;
}

export interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface UpdateCartItemRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  userId: string;
  productId: string;
}
