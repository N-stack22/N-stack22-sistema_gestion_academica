import { NgClass } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { EmptyState } from '../empty-state/empty-state';
import { DataTableColumn, DataTableRow } from './data-table.model';

@Component({
  selector: 'app-data-table',
  imports: [EmptyState, NgClass],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly icon = input<string>('bi-table');
  readonly columns = input.required<DataTableColumn[]>();
  readonly rows = input.required<DataTableRow[]>();
  readonly showActions = input<boolean>(true);
  readonly showSearch = input<boolean>(true);

  protected readonly searchTerm = signal('');

  protected readonly filteredRows = computed(() => {
    const term = this.normalize(this.searchTerm());
    if (!term) {
      return this.rows();
    }
    return this.rows().filter((row) =>
      Object.values(row).some((value) => this.normalize(String(value)).includes(term)),
    );
  });

  protected readonly recordCount = computed(() => this.filteredRows().length);

  protected onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  protected cellValue(row: DataTableRow, key: string): string {
    return row[key] ?? '—';
  }

  protected isStatusValue(value: string): boolean {
    return this.statusBadgeClass(value) !== '';
  }

  protected statusBadgeClass(value: string): string {
    const normalized = this.normalize(value);

    if (normalized.includes('activo') || normalized.includes('pagado') || normalized.includes('presente') || normalized.includes('completada') || normalized.includes('disponible')) {
      return 'erp-status-badge erp-status-badge--success';
    }
    if (normalized.includes('pendiente') || normalized.includes('tarde')) {
      return 'erp-status-badge erp-status-badge--warning';
    }
    if (normalized.includes('observado') || normalized.includes('falta')) {
      return 'erp-status-badge erp-status-badge--danger';
    }
    if (normalized.includes('inactivo') || normalized.includes('archivado')) {
      return 'erp-status-badge erp-status-badge--muted';
    }
    if (normalized.includes('revision') || normalized.includes('revisión')) {
      return 'erp-status-badge erp-status-badge--info';
    }

    return '';
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
