import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Cart } from '../../models/cart.model';
import { PlaceOrderRequest } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  loading: boolean = true;
  error: string = '';
  processing: boolean = false;
  defaultImage: string = 'assets/images/default.svg';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user._id) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.cartService.getCart(user._id).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load cart';
        this.loading = false;
      }
    });
  }

  getTotal(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  placeOrder(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user._id || !this.cart || !this.cart.items) {
      return;
    }

    this.processing = true;
    this.error = '';

    const orderRequest: PlaceOrderRequest = {
      userId: user._id,
      items: this.cart.items.map(item => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: this.getTotal()
    };

    this.orderService.placeOrder(orderRequest).subscribe({
      next: (order) => {
        this.processing = false;
        
        // Check order status
        if (order.paymentStatus === 'FAILED' || order.stockStatus === 'FAILED') {
          this.error = order.failureReason || 'Order placement failed. Please try again.';
        } else {
          alert('Order placed successfully!');
          this.router.navigate(['/orders']);
        }
      },
      error: (err) => {
        this.processing = false;
        this.error = err.error?.message || 'Failed to place order. Please try again.';
      }
    });
  }
}
