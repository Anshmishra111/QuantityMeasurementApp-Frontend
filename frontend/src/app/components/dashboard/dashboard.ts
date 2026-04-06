import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BackendService, MeasurementDTO, QuantityRequest } from '../../services/backend';
import { OpFindPipe, OpSymbolPipe } from '../../pipes/op.pipe';

type Operation = 'convert' | 'compare' | 'add' | 'subtract' | 'divide';

// Sync with Backend Enums in QuantityDTO.java
const UNITS = {
  LengthUnit: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  WeightUnit: ['MILLIGRAM', 'GRAM', 'KILOGRAM', 'POUND', 'TONNE'],
  VolumeUnit: ['LITRE', 'MILLILITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OpFindPipe, OpSymbolPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  operations: { id: Operation; label: string; icon: string; description: string }[] = [
    { id: 'convert',  label: 'Convert',   icon: '⇄',  description: 'Convert to another unit' },
    { id: 'compare',  label: 'Compare',   icon: '⇔',  description: 'Compare two quantities' },
    { id: 'add',      label: 'Add',       icon: '+',   description: 'Add two quantities' },
    { id: 'subtract', label: 'Subtract',  icon: '−',   description: 'Subtract two quantities' },
    { id: 'divide',   label: 'Divide',    icon: '÷',   description: 'Divide two quantities' }
  ];

  selectedOp = signal<Operation>('convert');
  categories = Object.keys(UNITS) as (keyof typeof UNITS)[];
  allUnits = UNITS;

  // Inputs
  val1 = '';
  unit1 = 'FEET';
  val2 = '';
  unit2 = 'INCHES';
  targetUnit = 'INCHES';
  targetUnitAdd = '';

  loading = signal(false);
  result = signal<MeasurementDTO | null>(null);
  errorMsg = signal('');

  isTwoQuantityOp = computed(() =>
    ['compare', 'add', 'subtract', 'divide'].includes(this.selectedOp())
  );

  get username(): string {
    return localStorage.getItem('username') || 'User';
  }

  constructor(private backend: BackendService, private router: Router) {}

  selectOp(op: Operation) {
    this.selectedOp.set(op);
    this.result.set(null);
    this.errorMsg.set('');
  }

  getUnitsForUnit(unit: string): string[] {
    for (const cat of this.categories) {
      if (this.allUnits[cat].includes(unit)) return this.allUnits[cat];
    }
    return this.allUnits.LengthUnit;
  }

  getMeasurementType(unit: string): string {
    for (const cat of this.categories) {
      if (this.allUnits[cat].includes(unit)) return cat;
    }
    return 'LengthUnit';
  }

  allUnitsList(): string[] {
    return Object.values(UNITS).flat();
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (err.status === 0) return 'Cannot connect to server. Is the backend running?';
    if (err.status === 400) {
      // Handle validation errors or bad request messages
      if (typeof err.error === 'string') return err.error;
      if (err.error?.message) return err.error.message;
      if (err.message) return err.message;
    }
    if (typeof err.error === 'string' && err.error.length > 0) return err.error;
    if (err.message) return err.message;
    return fallback;
  }

  calculate() {
    this.errorMsg.set('');
    this.result.set(null);

    const v1 = parseFloat(this.val1);
    if (isNaN(v1)) { this.errorMsg.set('Please enter a valid number for value 1.'); return; }

    const q1: QuantityRequest = { 
      value: v1, 
      unit: this.unit1, 
      measurementType: this.getMeasurementType(this.unit1) 
    };
    this.loading.set(true);
    const op = this.selectedOp();

    if (op === 'convert') {
      this.backend.convert({ thisQuantity: q1, targetUnit: this.targetUnit }).subscribe({
        next: r => { this.result.set(r); this.loading.set(false); },
        error: e => { this.errorMsg.set(this.extractErrorMessage(e, 'Conversion failed.')); this.loading.set(false); }
      });
      return;
    }

    const v2 = parseFloat(this.val2);
    if (isNaN(v2)) { this.errorMsg.set('Please enter a valid number for value 2.'); this.loading.set(false); return; }
    const q2: QuantityRequest = { 
      value: v2, 
      unit: this.unit2, 
      measurementType: this.getMeasurementType(this.unit2) 
    };

    if (op === 'compare') {
      this.backend.compare({ thisQuantity: q1, thatQuantity: q2 }).subscribe({
        next: r => { this.result.set(r); this.loading.set(false); },
        error: e => { this.errorMsg.set(this.extractErrorMessage(e, 'Comparison failed.')); this.loading.set(false); }
      });
    } else if (op === 'add') {
      this.backend.add({ thisQuantity: q1, thatQuantity: q2, targetUnit: this.targetUnitAdd || undefined }).subscribe({
        next: r => { this.result.set(r); this.loading.set(false); },
        error: e => { this.errorMsg.set(this.extractErrorMessage(e, 'Addition failed.')); this.loading.set(false); }
      });
    } else if (op === 'subtract') {
      this.backend.subtract({ thisQuantity: q1, thatQuantity: q2, targetUnit: this.targetUnitAdd || undefined }).subscribe({
        next: r => { this.result.set(r); this.loading.set(false); },
        error: e => { this.errorMsg.set(this.extractErrorMessage(e, 'Subtraction failed.')); this.loading.set(false); }
      });
    } else if (op === 'divide') {
      this.backend.divide({ thisQuantity: q1, thatQuantity: q2 }).subscribe({
        next: r => { this.result.set(r); this.loading.set(false); },
        error: e => { this.errorMsg.set(this.extractErrorMessage(e, 'Division failed.')); this.loading.set(false); }
      });
    }
  }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    this.router.navigate(['/auth']);
  }
}
