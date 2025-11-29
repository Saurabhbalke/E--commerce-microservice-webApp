import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  cartItemCount: number = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user._id) {
        this.loadCart(user._id);
      } else {
        this.cartItemCount = 0;
      }
    });

    this.cartService.cart$.subscribe(cart => {
      if (cart && cart.items) {
        this.cartItemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
      } else {
        this.cartItemCount = 0;
      }
    });
  }

  loadCart(userId: string): void {
    this.cartService.getCart(userId).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
