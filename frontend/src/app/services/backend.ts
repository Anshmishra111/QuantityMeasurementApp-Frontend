import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface QuantityRequest {
  value: number;
  unit: string;
  measurementType: string;
}

export interface ArithmeticRequest {
  thisQuantity: QuantityRequest;
  thatQuantity: QuantityRequest;
  targetUnit?: string;
}

export interface ConvertRequest {
  thisQuantity: QuantityRequest;
  targetUnit: string;
}

export interface CompareRequest {
  thisQuantity: QuantityRequest;
  thatQuantity: QuantityRequest;
}

export interface MeasurementDTO {
  thisValue: number;
  thisUnit: string;
  thisMeasurementType: string;
  thatValue?: number;
  thatUnit?: string;
  thatMeasurementType?: string;
  operation: string;
  resultValue: number;
  resultUnit: string;
  resultString: string;
  resultMeasurementType: string;
  error: boolean;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private readonly BASE_URL = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  // ── Auth ──────────────────────────────────────────────────────
  signup(req: AuthRequest): Observable<string> {
    return this.http.post(`${this.BASE_URL}/auth/signup`, req, { responseType: 'text' });
  }

  login(req: AuthRequest): Observable<string> {
    return this.http.post(`${this.BASE_URL}/auth/login`, req, { responseType: 'text' });
  }

  // ── Measurements ──────────────────────────────────────────────
  convert(req: ConvertRequest): Observable<MeasurementDTO> {
    return this.http.post<MeasurementDTO>(`${this.BASE_URL}/api/measurements/convert`, req);
  }

  compare(req: CompareRequest): Observable<MeasurementDTO> {
    return this.http.post<MeasurementDTO>(`${this.BASE_URL}/api/measurements/compare`, req);
  }

  add(req: ArithmeticRequest): Observable<MeasurementDTO> {
    return this.http.post<MeasurementDTO>(`${this.BASE_URL}/api/measurements/add`, req);
  }

  subtract(req: ArithmeticRequest): Observable<MeasurementDTO> {
    return this.http.post<MeasurementDTO>(`${this.BASE_URL}/api/measurements/subtract`, req);
  }

  divide(req: ArithmeticRequest): Observable<MeasurementDTO> {
    return this.http.post<MeasurementDTO>(`${this.BASE_URL}/api/measurements/divide`, req);
  }

  // ── History ───────────────────────────────────────────────────
  getHistory(): Observable<MeasurementDTO[]> {
    return this.http.get<MeasurementDTO[]>(`${this.BASE_URL}/api/measurements/history`);
  }

  getHistoryByOperation(operation: string): Observable<MeasurementDTO[]> {
    return this.http.get<MeasurementDTO[]>(`${this.BASE_URL}/api/measurements/history/${operation}`);
  }

  getErrorHistory(): Observable<MeasurementDTO[]> {
    return this.http.get<MeasurementDTO[]>(`${this.BASE_URL}/api/measurements/history/errored`);
  }
}
