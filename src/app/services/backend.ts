import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message: string;
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

  // Local: Connect to the local API Gateway on port 8080
  // private readonly BASE_URL = 'http://localhost:8080';

  // Production: All requests go through the deployed API Gateway on Render
  private readonly BASE_URL = 'https://quantity-measurement-app-p09q.onrender.com';

  constructor(private http: HttpClient) {}

  // ── Auth ──────────────────────────────────────────────────────

  signup(req: AuthRequest): Observable<string> {
    return this.http.post(`${this.BASE_URL}/auth/signup`, req, { responseType: 'text' });
  }

  /**
   * UC18: login now returns AuthResponse JSON { token, message }
   * We extract only the token so callers don't need to change.
   */
  login(req: AuthRequest): Observable<string> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/auth/login`, req).pipe(
      map((res: AuthResponse) => res.token)
    );
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

  // ── History (UC18: served by history-service via gateway) ─────

  getHistory(): Observable<MeasurementDTO[]> {
    return this.http.get<MeasurementDTO[]>(`${this.BASE_URL}/api/history`);
  }

  getHistoryByOperation(operation: string): Observable<MeasurementDTO[]> {
    return this.http.get<MeasurementDTO[]>(`${this.BASE_URL}/api/history/operation/${operation}`);
  }

  getHistoryByType(measurementType: string): Observable<MeasurementDTO[]> {
    return this.http.get<MeasurementDTO[]>(`${this.BASE_URL}/api/history/type/${measurementType}`);
  }

  getErrorHistory(): Observable<MeasurementDTO[]> {
    return this.http.get<MeasurementDTO[]>(`${this.BASE_URL}/api/history/errored`);
  }

  getOperationCount(operation: string): Observable<{ operation: string; count: number }> {
    return this.http.get<{ operation: string; count: number }>(
      `${this.BASE_URL}/api/history/count/${operation}`
    );
  }
}
