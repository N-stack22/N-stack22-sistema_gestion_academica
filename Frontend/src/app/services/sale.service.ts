import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface SaleItemDetail {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleItem {
  id: string;
  code: string;
  concept: string;
  clientName: string;
  amount: string;
  status: string;
  statusCode?: string;
  canVoid?: boolean;
  date: string;
  method: string;
  items?: SaleItemDetail[];
}

export interface SaleProduct {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/ventas`;

  listar(): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(this.baseUrl);
  }

  obtener(id: string): Observable<SaleItem> {
    return this.http.get<SaleItem>(`${this.baseUrl}/${id}`);
  }

  productos(): Observable<SaleProduct[]> {
    return this.http.get<SaleProduct[]>(`${this.baseUrl}/productos`);
  }

  resumen(): Observable<{ product: string; sales: number; price: number }[]> {
    return this.http.get<{ product: string; sales: number; price: number }[]>(`${this.baseUrl}/resumen`);
  }

  crear(payload: Record<string, unknown>): Observable<SaleItem> {
    return this.http.post<SaleItem>(this.baseUrl, payload);
  }

  anular(ventaId: string, motivo?: string): Observable<SaleItem> {
    return this.http.post<SaleItem>(`${this.baseUrl}/${ventaId}/anular`, { motivo: motivo || undefined });
  }
}
