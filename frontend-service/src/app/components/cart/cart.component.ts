import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Cart, CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading: boolean = true;
  error: string = '';
  defaultImage: string = 'assets/images/default.svg';

  constructor(
    private cartService: CartService,
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

  updateQuantity(item: CartItem, change: number): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user._id) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;

    this.cartService.updateCartItem({
      userId: user._id,
      productId: item.productId,
      quantity: newQuantity
    }).subscribe({
      next: (cart) => {
        this.cart = cart;
      },
      error: (err) => {
        this.error = 'Failed to update cart';
      }
    });
  }

  removeItem(item: CartItem): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user._id) return;

    if (confirm('Are you sure you want to remove this item?')) {
      this.cartService.removeFromCart({
        userId: user._id,
        productId: item.productId
      }).subscribe({
        next: (cart) => {
          this.cart = cart;
        },
        error: (err) => {
          this.error = 'Failed to remove item';
        }
      });
    }
  }

  getTotal(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
