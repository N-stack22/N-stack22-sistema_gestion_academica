import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface CatalogSection {
  id: string;
  nombre: string;
  aula?: string;
  capacidad?: number;
  matriculasActivas?: number;
  cuposDisponibles?: number;
  grado_id?: string;
  grado?: string;
  nivel?: string;
  label?: string;
}

export interface CatalogGrade {
  id: string;
  nombre: string;
  label?: string;
  nivel_id?: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<unknown[]>>();

  private cached(key: string, url: string): Observable<unknown[]> {
    let request$ = this.cache.get(key);
    if (!request$) {
      request$ = this.http.get<unknown[]>(url).pipe(shareReplay(1));
      this.cache.set(key, request$);
    }
    return request$;
  }

  invalidate(): void {
    this.cache.clear();
  }

  roles(): Observable<unknown[]> {
    return this.cached('roles', `${API_BASE_URL}/api/catalogos/roles`);
  }

  anios(): Observable<unknown[]> {
    return this.cached('anios', `${API_BASE_URL}/api/catalogos/anios-academicos`);
  }

  niveles(): Observable<unknown[]> {
    return this.cached('niveles', `${API_BASE_URL}/api/catalogos/niveles-educativos`);
  }

  grados(nivelId?: string): Observable<unknown[]> {
    const q = nivelId ? `?nivel_id=${nivelId}` : '';
    return this.cached(`grados:${nivelId ?? 'all'}`, `${API_BASE_URL}/api/catalogos/grados${q}`);
  }

  secciones(anioId?: string, gradoId?: string): Observable<unknown[]> {
    const params = new URLSearchParams();
    if (anioId) params.set('anio_id', anioId);
    if (gradoId) params.set('grado_id', gradoId);
    const q = params.toString() ? `?${params}` : '';
    return this.cached(
      `secciones:${anioId ?? 'all'}:${gradoId ?? 'all'}`,
      `${API_BASE_URL}/api/catalogos/secciones${q}`,
    );
  }

  estadosMatricula(contexto?: 'nueva' | 'filtro'): Observable<unknown[]> {
    const q = contexto ? `?contexto=${contexto}` : '';
    return this.cached(
      `estadosMatricula:${contexto ?? 'all'}`,
      `${API_BASE_URL}/api/catalogos/estados-matricula${q}`,
    );
  }

  asignaturas(): Observable<unknown[]> {
    return this.cached('asignaturas', `${API_BASE_URL}/api/catalogos/asignaturas`);
  }

  docentes(): Observable<unknown[]> {
    return this.cached('docentes', `${API_BASE_URL}/api/docentes`);
  }

  estudiantes(): Observable<unknown[]> {
    return this.cached('estudiantes', `${API_BASE_URL}/api/estudiantes`);
  }

  tiposRecurso(): Observable<unknown[]> {
    return this.cached('tiposRecurso', `${API_BASE_URL}/api/catalogos/tipos-recurso`);
  }

  metodosPago(): Observable<unknown[]> {
    return this.cached('metodosPago', `${API_BASE_URL}/api/catalogos/metodos-pago`);
  }

  tiposEvaluacion(): Observable<unknown[]> {
    return this.cached('tiposEvaluacion', `${API_BASE_URL}/api/catalogos/tipos-evaluacion`);
  }

  periodos(anioId?: string): Observable<unknown[]> {
    const q = anioId ? `?anio_id=${anioId}` : '';
    return this.cached(
      `periodos:${anioId ?? 'all'}`,
      `${API_BASE_URL}/api/catalogos/periodos-academicos${q}`,
    );
  }

  estadosSeguimiento(): Observable<unknown[]> {
    return this.cached('estadosSeguimiento', `${API_BASE_URL}/api/catalogos/estados-seguimiento`);
  }

  estadosPago(): Observable<unknown[]> {
    return this.cached('estadosPago', `${API_BASE_URL}/api/catalogos/estados-pago`);
  }
}
