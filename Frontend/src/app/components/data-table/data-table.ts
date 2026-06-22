import { NgClass } from '@angular/common';
import { Component, ElementRef, computed, effect, inject, input, output, signal } from '@angular/core';
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

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
  readonly autoScrollOnAction = input<boolean>(true);
  readonly actionScrollTarget = input<string>('');
  readonly showViewButton = input<boolean>(false);
  readonly viewLabel = input<string>('Ver');
  readonly detailLabel = input<string>('Detalle');
  readonly secondaryDetailLabel = input<string>('');

  readonly viewClick = output<DataTableRow>();
  readonly detailClick = output<DataTableRow>();
  readonly secondaryDetailClick = output<DataTableRow>();

  public readonly searchTerm = signal('');
  public readonly columnFilters = signal<Record<string, string>>({});
  public readonly currentPage = signal(1);

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

  public readonly filteredRows = computed(() => {
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

  public readonly filterGroups = computed<DataTableFilterGroup[]>(() =>
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

  public readonly activeFilterCount = computed(
    () => Object.values(this.columnFilters()).filter((value) => value).length,
  );

  public readonly hasActiveFilters = computed(
    () => Boolean(this.searchTerm().trim()) || this.activeFilterCount() > 0,
  );

  public readonly recordCount = computed(() => this.filteredRows().length);

  public readonly totalPages = computed(() => {
    const total = this.filteredRows().length;
    const size = Math.max(1, this.pageSize());
    return Math.max(1, Math.ceil(total / size));
  });

  public readonly paginatedRows = computed(() => {
    const rows = this.filteredRows();
    if (!this.showPagination()) {
      return rows;
    }
    const start = (this.currentPage() - 1) * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  public readonly pageStart = computed(() => {
    if (this.filteredRows().length === 0) {
      return 0;
    }
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  public readonly pageEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredRows().length),
  );

  public readonly canGoPrevious = computed(() => this.currentPage() > 1);

  public readonly canGoNext = computed(() => this.currentPage() < this.totalPages());

  public rowTrack(_row: DataTableRow, index: number): string {
    const id = _row['_id']?.trim();
    return id ? `${id}::${index}` : `row-${index}`;
  }

  public onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  public onColumnFilterInput(key: string, value: string): void {
    this.columnFilters.update((current) => ({
      ...current,
      [key]: value,
    }));
    this.currentPage.set(1);
  }

  public filterValue(key: string): string {
    return this.columnFilters()[key] ?? '';
  }

  public clearFilters(): void {
    this.searchTerm.set('');
    this.columnFilters.set({});
    this.currentPage.set(1);
  }

  public goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  public previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  public nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  public onDetail(row: DataTableRow): void {
    this.detailClick.emit(row);
    this.scheduleActionScroll(this.detailLabel());
  }

  public onView(row: DataTableRow): void {
    this.viewClick.emit(row);
    this.scheduleActionScroll(this.viewLabel());
  }

  public onSecondaryDetail(row: DataTableRow): void {
    this.secondaryDetailClick.emit(row);
    this.scheduleActionScroll(this.secondaryDetailLabel());
  }

  public cellValue(row: DataTableRow, key: string): string {
    return row[key] ?? '—';
  }

  public isStatusValue(value: string): boolean {
    return this.statusBadgeClass(value) !== '';
  }

  public statusBadgeClass(value: string): string {
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

  private scheduleActionScroll(label: string): void {
    if (!this.autoScrollOnAction() || !this.shouldAutoScroll(label)) {
      return;
    }

    window.setTimeout(() => this.scrollToActionTarget(label), 80);
  }

  private shouldAutoScroll(label: string): boolean {
    const normalized = this.normalize(label);
    return ['editar', 'detalle', 'seguimiento', 'usar como base', 'calificar', 'entregas'].some((term) =>
      normalized.includes(term),
    );
  }

  private scrollToActionTarget(label: string): void {
    const hostElement = this.host.nativeElement;
    const page = hostElement.closest('.admin-page') as HTMLElement | null;
    const scope = page ?? document.body;
    const explicitTarget = this.actionScrollTarget().trim();
    const target =
      (explicitTarget ? this.findVisibleElement(scope, explicitTarget) : null) ??
      this.findMatchingActionPanel(scope, hostElement, label) ??
      this.findMarkedActionPanel(scope, hostElement) ??
      this.findDefaultActionPanel(scope, hostElement, label);

    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private findVisibleElement(scope: ParentNode, selector: string): HTMLElement | null {
    return (
      Array.from(scope.querySelectorAll<HTMLElement>(selector)).find((element) =>
        this.isVisible(element),
      ) ?? null
    );
  }

  private findMatchingActionPanel(scope: ParentNode, hostElement: HTMLElement, label: string): HTMLElement | null {
    const labelTerms = this.actionTerms(label);
    if (labelTerms.length === 0) {
      return null;
    }

    const panels = this.actionPanels(scope).filter((element) => !element.contains(hostElement));
    return (
      panels.find((element) => {
        const title = this.normalize(element.querySelector('h1,h2,h3,h4,.form-panel__title')?.textContent ?? '');
        return labelTerms.some((term) => title.includes(term));
      }) ?? null
    );
  }

  private findMarkedActionPanel(scope: ParentNode, hostElement: HTMLElement): HTMLElement | null {
    const markedPanels = Array.from(scope.querySelectorAll<HTMLElement>('[data-table-action-target]')).filter(
      (element) => this.isVisible(element) && !element.contains(hostElement),
    );

    return this.closestPanel(markedPanels, hostElement);
  }

  private findDefaultActionPanel(scope: ParentNode, hostElement: HTMLElement, label: string): HTMLElement | null {
    const panels = this.actionPanels(scope).filter((element) => !this.isFilterPanel(element));
    const formPanels = panels.filter((element) => element.classList.contains('form-panel'));
    const beforeForms = formPanels.filter((element) => this.isBefore(element, hostElement));

    if (this.prefersFormTarget(label) && beforeForms.length) {
      return beforeForms[0];
    }

    const beforeTable = panels.filter(
      (element) => this.isBefore(element, hostElement),
    );
    const afterTable = panels.filter((element) => this.isAfter(element, hostElement));

    if (this.prefersDetailTarget(label)) {
      return afterTable[0] ?? this.closestPanel(beforeTable, hostElement) ?? panels[0] ?? null;
    }

    return beforeForms[0] ?? this.closestPanel(beforeTable, hostElement) ?? afterTable[0] ?? panels[0] ?? null;
  }

  private actionPanels(scope: ParentNode): HTMLElement[] {
    return Array.from(scope.querySelectorAll<HTMLElement>('.form-panel, .admin-card')).filter(
      (element) =>
        this.isVisible(element) &&
        !element.classList.contains('data-table') &&
        !!element.querySelector('h1,h2,h3,h4,.form-panel__title,form,button'),
    );
  }

  private actionTerms(label: string): string[] {
    const normalized = this.normalize(label);
    const terms = ['editar', 'detalle', 'seguimiento', 'usar como base', 'calificar', 'entregas'];
    return terms.filter((term) => normalized.includes(term));
  }

  private prefersFormTarget(label: string): boolean {
    const normalized = this.normalize(label);
    return normalized.includes('editar') || normalized.includes('usar como base') || normalized.includes('seguimiento');
  }

  private prefersDetailTarget(label: string): boolean {
    const normalized = this.normalize(label);
    return normalized.includes('detalle') || normalized.includes('entregas') || normalized.includes('calificar');
  }

  private isFilterPanel(element: HTMLElement): boolean {
    return this.normalize(element.textContent ?? '').includes('filtros de busqueda');
  }

  private isBefore(element: HTMLElement, reference: HTMLElement): boolean {
    return (element.compareDocumentPosition(reference) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  }

  private isAfter(element: HTMLElement, reference: HTMLElement): boolean {
    return (element.compareDocumentPosition(reference) & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
  }

  private closestPanel(elements: HTMLElement[], reference: HTMLElement): HTMLElement | null {
    return (
      elements
        .map((element) => ({
          element,
          distance: Math.abs(element.getBoundingClientRect().top - reference.getBoundingClientRect().top),
        }))
        .sort((a, b) => a.distance - b.distance)[0]?.element ?? null
    );
  }

  private isVisible(element: HTMLElement): boolean {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }
}
