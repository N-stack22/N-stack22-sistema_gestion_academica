import { Component, computed, inject } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { ParentTrackingService } from '../../services/parent-tracking.service';
import { RoleContextService } from '../../services/role-context.service';

@Component({
  selector: 'app-parent-tracking',
  imports: [DataTable],
  templateUrl: './parent-tracking.html',
  styleUrl: './parent-tracking.scss',
})
export class ParentTracking {
  private readonly parentTrackingService = inject(ParentTrackingService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly adminColumns: DataTableColumn[] = [
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'apoderado', label: 'Apoderado' },
    { key: 'comunicacion', label: 'Última comunicación' },
    { key: 'estadoAcademico', label: 'Estado académico' },
    { key: 'observacion', label: 'Observación' },
  ];

  protected readonly parentColumns: DataTableColumn[] = [
    { key: 'aspecto', label: 'Aspecto' },
    { key: 'detalle', label: 'Detalle' },
  ];

  protected readonly columns = computed(() =>
    this.roleContext.isParent() ? this.parentColumns : this.adminColumns,
  );

  protected readonly adminRows: DataTableRow[] = this.parentTrackingService.getAll().map((record) => ({
    estudiante: record.studentName,
    apoderado: record.parentName,
    comunicacion: record.lastCommunication,
    estadoAcademico: record.academicStatus,
    observacion: record.observation,
  }));

  protected readonly parentRows: DataTableRow[] = [
    { aspecto: 'Estudiante', detalle: 'Lucía Torres — 2° Secundaria A' },
    { aspecto: 'Estado académico', detalle: 'Bueno' },
    { aspecto: 'Última comunicación', detalle: '25 May 2026' },
    { aspecto: 'Observación docente', detalle: 'Buen rendimiento general en el bimestre.' },
    { aspecto: 'Próxima reunión', detalle: '20 Mar 2026 — Secundaria' },
  ];

  protected readonly rows = computed(() =>
    this.roleContext.isParent() ? this.parentRows : this.adminRows,
  );
}
