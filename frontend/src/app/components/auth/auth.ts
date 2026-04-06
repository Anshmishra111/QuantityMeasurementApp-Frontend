import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BackendService } from '../../services/backend';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  mode: 'login' | 'signup' = 'login';

  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  constructor(private backend: BackendService, private router: Router) {}

  toggleMode() {
    this.mode = this.mode === 'login' ? 'signup' : 'login';
    this.errorMsg.set('');
    this.successMsg.set('');
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (err.status === 0) return 'Cannot connect to server. Is the backend running?';
    if (typeof err.error === 'string' && err.error.length > 0) return err.error;
    if (err.message) return err.message;
    return fallback;
  }

  submit() {
    this.errorMsg.set('');
    this.successMsg.set('');

    if (!this.username || !this.password) {
      this.errorMsg.set('Please fill in all fields.');
      return;
    }

    if (this.mode === 'signup') {
      if (!this.email) {
        this.errorMsg.set('Please enter your email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.errorMsg.set('Please enter a valid email address.');
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMsg.set('Passwords do not match.');
        return;
      }
    }

    this.loading.set(true);
    const req = { username: this.username, password: this.password };

    if (this.mode === 'login') {
      this.backend.login(req).subscribe({
        next: (token) => {
          localStorage.setItem('jwt_token', token);
          localStorage.setItem('username', this.username);
          localStorage.setItem('email', this.email || '');
          this.loading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(this.extractErrorMessage(err, 'Login failed. Please check your credentials.'));
        }
      });
    } else {
      this.backend.signup(req).subscribe({
        next: (msg) => {
          this.loading.set(false);
          this.successMsg.set((msg || 'Account created!') + ' Please sign in.');
          this.mode = 'login';
          this.username = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(this.extractErrorMessage(err, 'Signup failed. Please try again.'));
        }
      });
    }
  }
}
