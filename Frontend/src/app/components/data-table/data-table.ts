import { NgClass } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { EmptyState } from '../empty-state/empty-state';
import { DataTableColumn, DataTableRow } from './data-table.model';

interface DataTableFilterGroup {
  key: string;
  label: string;
  options: string[];
}

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
  readonly showColumnFilters = input<boolean>(true);
  readonly showPagination = input<boolean>(true);
  readonly pageSize = input<number>(10);
  readonly showViewButton = input<boolean>(false);
  readonly viewLabel = input<string>('Ver');
  readonly detailLabel = input<string>('Detalle');
  readonly secondaryDetailLabel = input<string>('');

  readonly viewClick = output<DataTableRow>();
  readonly detailClick = output<DataTableRow>();
  readonly secondaryDetailClick = output<DataTableRow>();

  protected readonly searchTerm = signal('');
  protected readonly columnFilters = signal<Record<string, string>>({});
  protected readonly currentPage = signal(1);

  constructor() {
    effect(() => {
      this.rows();
      this.columns();
      this.searchTerm.set('');
      this.columnFilters.set({});
      this.currentPage.set(1);
    });

    effect(() => {
      this.searchTerm();
      this.currentPage.set(1);
    });

    effect(() => {
      const totalPages = this.totalPages();
      if (this.currentPage() > totalPages) {
        this.currentPage.set(totalPages);
      }
    });
  }

  protected readonly filteredRows = computed(() => {
    const term = this.normalize(this.searchTerm());
    const activeFilters = Object.entries(this.columnFilters()).filter(([, value]) => value);

    return this.rows().filter((row) => {
      const matchesSearch =
        !term || Object.values(row).some((value) => this.normalize(String(value)).includes(term));

      if (!matchesSearch) {
        return false;
      }

      return activeFilters.every(
        ([key, value]) => this.normalize(this.filterDisplayValue(row, key)) === this.normalize(value),
      );
    });
  });

  protected readonly filterGroups = computed<DataTableFilterGroup[]>(() =>
    this.columns()
      .map((column) => {
        const options = Array.from(
          new Set(this.rows().map((row) => this.filterDisplayValue(row, column.key))),
        )
          .filter((value) => value)
          .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

        return {
          key: column.key,
          label: column.label,
          options,
        };
      })
      .filter((group) => group.options.length > 1),
  );

  protected readonly activeFilterCount = computed(
    () => Object.values(this.columnFilters()).filter((value) => value).length,
  );

  protected readonly hasActiveFilters = computed(
    () => Boolean(this.searchTerm().trim()) || this.activeFilterCount() > 0,
  );

  protected readonly recordCount = computed(() => this.filteredRows().length);

  protected readonly totalPages = computed(() => {
    const total = this.filteredRows().length;
    const size = Math.max(1, this.pageSize());
    return Math.max(1, Math.ceil(total / size));
  });

  protected readonly paginatedRows = computed(() => {
    const rows = this.filteredRows();
    if (!this.showPagination()) {
      return rows;
    }
    const start = (this.currentPage() - 1) * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  protected readonly pageStart = computed(() => {
    if (this.filteredRows().length === 0) {
      return 0;
    }
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  protected readonly pageEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredRows().length),
  );

  protected readonly canGoPrevious = computed(() => this.currentPage() > 1);

  protected readonly canGoNext = computed(() => this.currentPage() < this.totalPages());

  protected rowTrack(_row: DataTableRow, index: number): string {
    const id = _row['_id']?.trim();
    return id ? `${id}::${index}` : `row-${index}`;
  }

  protected onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  protected onColumnFilterInput(key: string, value: string): void {
    this.columnFilters.update((current) => ({
      ...current,
      [key]: value,
    }));
    this.currentPage.set(1);
  }

  protected filterValue(key: string): string {
    return this.columnFilters()[key] ?? '';
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.columnFilters.set({});
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected onDetail(row: DataTableRow): void {
    this.detailClick.emit(row);
  }

  protected onView(row: DataTableRow): void {
    this.viewClick.emit(row);
  }

  protected onSecondaryDetail(row: DataTableRow): void {
    this.secondaryDetailClick.emit(row);
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
    if (normalized.includes('inactivo') || normalized.includes('archivado') || normalized.includes('anulad')) {
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

  private filterDisplayValue(row: DataTableRow, key: string): string {
    return row[key]?.trim() || 'Sin dato';
  }
}
