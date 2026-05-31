import { Component } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';

@Component({
  selector: 'app-internal-announcements',
  imports: [DataTable],
  templateUrl: './internal-announcements.html',
  styleUrl: './internal-announcements.scss',
})
export class InternalAnnouncements {
  protected readonly columns: DataTableColumn[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'destinatario', label: 'Destinatario' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly rows: DataTableRow[] = [
    {
      titulo: 'Cronograma de evaluaciones bimestrales',
      destinatario: 'Todos',
      fecha: '11 Mar 2026',
      estado: 'Activo',
    },
    {
      titulo: 'Reunión de área — Matemática',
      destinatario: 'Docentes',
      fecha: '10 Mar 2026',
      estado: 'Activo',
    },
    {
      titulo: 'Olimpiada interna de ciencias',
      destinatario: 'Estudiantes',
      fecha: '09 Mar 2026',
      estado: 'Activo',
    },
    {
      titulo: 'Reunión de padres — Secundaria',
      destinatario: 'Padres de familia',
      fecha: '08 Mar 2026',
      estado: 'Programado',
    },
    {
      titulo: 'Actualización de horarios de laboratorio',
      destinatario: 'Docentes',
      fecha: '05 Mar 2026',
      estado: 'Archivado',
    },
  ];
}
