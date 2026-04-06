import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackendService, MeasurementDTO } from '../../services/backend';

@Component({
  selector: 'app-history',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class HistoryComponent implements OnInit {
  records = signal<MeasurementDTO[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  filterOp = 'ALL';

  operations = ['ALL', 'CONVERT', 'COMPARE', 'ADD', 'SUBTRACT', 'DIVIDE', 'ERRORED'];

  get username(): string {
    return localStorage.getItem('username') || 'User';
  }

  constructor(private backend: BackendService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);
    this.errorMsg.set('');

    const src$ = this.filterOp === 'ALL'
      ? this.backend.getHistory()
      : this.filterOp === 'ERRORED'
        ? this.backend.getErrorHistory()
        : this.backend.getHistoryByOperation(this.filterOp);

    src$.subscribe({
      next: data => { this.records.set(data); this.loading.set(false); },
      error: e => { this.errorMsg.set(e.error || 'Failed to load history.'); this.loading.set(false); }
    });
  }

  onFilterChange() {
    this.loadHistory();
  }

  opColor(op: string): string {
    const map: Record<string, string> = {
      CONVERT: '#6C63FF', COMPARE: '#4ECDC4', ADD: '#64f08a',
      SUBTRACT: '#f0a164', DIVIDE: '#f06464'
    };
    return map[op] ?? '#aaa';
  }
}
