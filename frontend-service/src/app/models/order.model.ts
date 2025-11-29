export interface OrderItem {
  productId: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED' | 'DELIVERED';
  stockStatus: 'PENDING' | 'RESERVED' | 'FAILED';
  paymentStatus: 'PENDING' | 'PROCESSED' | 'FAILED';
  failureReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlaceOrderRequest {
  userId: string;
  items: OrderItem[];
  totalAmount: number;
}
