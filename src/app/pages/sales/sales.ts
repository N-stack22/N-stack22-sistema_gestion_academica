import { Component } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { StatCard } from '../../components/stat-card/stat-card';

@Component({
  selector: 'app-sales',
  imports: [StatCard, DataTable],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
})
export class Sales {
  protected readonly metrics = [
    {
      id: 1,
      title: 'Uniformes',
      value: 68,
      description: 'Ventas del mes',
      icon: 'bi-bag',
      variant: 'primary' as const,
    },
    {
      id: 2,
      title: 'Libros',
      value: 42,
      description: 'Textos escolares',
      icon: 'bi-book',
      variant: 'info' as const,
    },
    {
      id: 3,
      title: 'Materiales',
      value: 31,
      description: 'Útiles escolares',
      icon: 'bi-pencil',
      variant: 'success' as const,
    },
    {
      id: 4,
      title: 'Talleres',
      value: 15,
      description: 'Actividades extracurriculares',
      icon: 'bi-palette',
      variant: 'warning' as const,
    },
  ];

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'monto', label: 'Monto' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha' },
  ];

  protected readonly rows: DataTableRow[] = [
    {
      codigo: 'VTA-001',
      concepto: 'Uniforme completo',
      cliente: 'Lucía Torres',
      monto: 'S/ 280',
      estado: 'Completada',
      fecha: '03 Mar 2026',
    },
    {
      codigo: 'VTA-002',
      concepto: 'Pack de libros 3.°',
      cliente: 'Mateo Rojas',
      monto: 'S/ 320',
      estado: 'Completada',
      fecha: '05 Mar 2026',
    },
    {
      codigo: 'VTA-003',
      concepto: 'Materiales de arte',
      cliente: 'Valeria Quispe',
      monto: 'S/ 45',
      estado: 'Pendiente',
      fecha: '08 Mar 2026',
    },
    {
      codigo: 'VTA-004',
      concepto: 'Taller de robótica',
      cliente: 'Diego Fernández',
      monto: 'S/ 120',
      estado: 'Completada',
      fecha: '10 Mar 2026',
    },
    {
      codigo: 'VTA-005',
      concepto: 'Agenda escolar',
      cliente: 'Camila Salazar',
      monto: 'S/ 25',
      estado: 'Completada',
      fecha: '11 Mar 2026',
    },
  ];
}
