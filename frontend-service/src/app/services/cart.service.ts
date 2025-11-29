import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cart, AddToCartRequest, UpdateCartItemRequest, RemoveFromCartRequest } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3008/cart';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(userId: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/${userId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addToCart(data: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(this.apiUrl, data).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateCartItem(data: UpdateCartItemRequest): Observable<Cart> {
    return this.http.put<Cart>(this.apiUrl, data).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeFromCart(data: RemoveFromCartRequest): Observable<Cart> {
    return this.http.request<Cart>('delete', this.apiUrl, { body: data }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  getCartTotal(): number {
    const cart = this.cartSubject.value;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    const cart = this.cartSubject.value;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  }
}
