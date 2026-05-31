import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
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
  readonly icon = input<string>('bi-table');
  readonly columns = input.required<DataTableColumn[]>();
  readonly rows = input.required<DataTableRow[]>();

  protected cellValue(row: DataTableRow, key: string): string {
    return row[key] ?? '—';
  }
}
