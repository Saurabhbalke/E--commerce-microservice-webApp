import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user._id) {
      this.error = 'Please login to view orders';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.orderService.getUserOrders(user._id).subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'badge bg-success';
      case 'PENDING':
        return 'badge bg-warning text-dark';
      case 'SHIPPED':
        return 'badge bg-info';
      case 'DELIVERED':
        return 'badge bg-primary';
      case 'CANCELLED':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PROCESSED':
        return 'text-success';
      case 'PENDING':
        return 'text-warning';
      case 'FAILED':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  }

  getStockStatusClass(status: string): string {
    switch (status) {
      case 'RESERVED':
        return 'text-success';
      case 'PENDING':
        return 'text-warning';
      case 'FAILED':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  }
}
