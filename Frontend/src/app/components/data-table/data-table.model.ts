export interface DataTableColumn {
  key: string;
  label: string;
  filterable?: boolean;
}

export interface DataTableRow {
  [key: string]: string | undefined;
}
