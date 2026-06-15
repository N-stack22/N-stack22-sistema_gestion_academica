import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { StatCard } from '../../components/stat-card/stat-card';
import { SaleItem, SaleService } from '../../services/sale.service';
import { CatalogService } from '../../services/catalog.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-sales',
  imports: [StatCard, DataTable],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
})
export class Sales implements OnInit {
  private readonly saleService = inject(SaleService);
  private readonly catalogService = inject(CatalogService);
  private readonly studentService = inject(StudentService);

  protected readonly metrics = signal<
    { id: number; title: string; value: number; description: string; icon: string; variant: 'primary' | 'info' | 'success' | 'warning' }[]
  >([]);
  protected readonly allRows = signal<DataTableRow[]>([]);
  protected readonly selected = signal<SaleItem | null>(null);
  protected readonly productos = signal<{ id: string; nombre: string; precio: number }[]>([]);
  protected readonly estudiantes = signal<{ id: string; fullName: string }[]>([]);
  protected readonly estudianteId = signal('');
  protected readonly productoId = signal('');
  protected readonly metodoPago = signal('EFECTIVO');
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  protected readonly validasRows = computed(() =>
    this.allRows().filter((r) => r['_statusCode'] !== 'ANULADO'),
  );

  protected readonly anuladasRows = computed(() =>
    this.allRows().filter((r) => r['_statusCode'] === 'ANULADO'),
  );

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'monto', label: 'Monto' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha' },
  ];

  ngOnInit(): void {
    this.loadVentas();
    this.saleService.productos().subscribe({
      next: (p) => this.productos.set(p),
    });
    this.studentService.listar().subscribe({
      next: (s) => this.estudiantes.set(s.map((e) => ({ id: e.id, fullName: e.fullName }))),
    });
  }

  protected loadVentas(): void {
    this.saleService.listar().subscribe({
      next: (items) => {
        this.allRows.set(
          items.map((v) => ({
            _id: v.id,
            _canVoid: v.canVoid ? '1' : '0',
            _statusCode: v.statusCode ?? 'PAGADO',
            codigo: v.code,
            concepto: v.concept,
            cliente: v.clientName,
            monto: `S/ ${v.amount}`,
            estado: v.status,
            fecha: v.date,
          })),
        );
      },
    });
    this.saleService.resumen().subscribe({
      next: (resumen) => {
        const icons = ['bi-bag', 'bi-book', 'bi-pencil', 'bi-palette'];
        const variants: ('primary' | 'info' | 'success' | 'warning')[] = ['primary', 'info', 'success', 'warning'];
        this.metrics.set(
          resumen.map((r, i) => ({
            id: i + 1,
            title: r.product,
            value: r.sales,
            description: `S/ ${r.price}`,
            icon: icons[i] ?? 'bi-bag',
            variant: variants[i] ?? 'primary',
          })),
        );
      },
    });
  }

  protected registrarVenta(): void {
    if (!this.productoId()) return;
    const prod = this.productos().find((p) => p.id === this.productoId());
    if (!prod) return;

    this.errorMessage.set('');
    this.saleService
      .crear({
        estudiante_id: this.estudianteId() || undefined,
        metodo_pago_codigo: this.metodoPago(),
        items: [{ producto_venta_id: this.productoId(), cantidad: 1, precio_unitario: prod.precio }],
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Venta registrada correctamente.');
          this.productoId.set('');
          this.loadVentas();
        },
        error: (err) => {
          this.successMessage.set('');
          this.errorMessage.set(err?.error?.detail ?? 'No se pudo registrar la venta.');
        },
      });
  }

  protected onDetail(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.errorMessage.set('');
    this.saleService.obtener(String(id)).subscribe({
      next: (v) => this.selected.set(v),
      error: (err) => {
        this.errorMessage.set(err?.error?.detail ?? 'No se pudo cargar el detalle de la venta.');
      },
    });
  }

  protected cerrarDetalle(): void {
    this.selected.set(null);
  }

  protected anularVenta(): void {
    const venta = this.selected();
    if (!venta?.canVoid) {
      this.errorMessage.set('Esta venta no puede anularse.');
      return;
    }
    const motivo = window.prompt(
      'Motivo de anulación (opcional). La venta permanece en el historial pero deja de contar como válida:',
    );
    if (motivo === null) return;

    this.errorMessage.set('');
    this.saleService.anular(venta.id, motivo || undefined).subscribe({
      next: (updated) => {
        this.selected.set(updated);
        this.successMessage.set('Venta anulada. Ya no cuenta en los totales de ventas válidas.');
        this.loadVentas();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.detail ?? 'No se pudo anular la venta.');
      },
    });
  }
}
