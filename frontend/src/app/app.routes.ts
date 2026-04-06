import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth';
import { DashboardComponent } from './components/dashboard/dashboard';
import { HistoryComponent } from './components/history/history';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'auth' }
];
