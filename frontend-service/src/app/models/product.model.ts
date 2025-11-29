export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
}
