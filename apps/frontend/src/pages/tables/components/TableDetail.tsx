import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { TableDetailResponse } from '../../api/tables';
import './TableDetail.css';

interface TableDetailProps {
  tableData: TableDetailResponse;
  onRenameTable: (currentName: string) => void;
  onRenameColumn: (columnId: string, currentName: string) => void;
  onDeleteTable: () => void;
  onReuploadTable: () => void;
}

export const TableDetail: React.FC<TableDetailProps> = ({
  tableData,
  onRenameTable,
  onRenameColumn,
  onDeleteTable,
  onReuploadTable,
}) => {
  // Transform the data for AG Grid
  const rowData = tableData.rows.map(row => {
    const transformedRow: any = {};
    tableData.columns.forEach(column => {
      transformedRow[column.name] = row.data[column.column_id];
    });
    return transformedRow;
  });

  const columnDefs = tableData.columns.map(column => ({
    headerName: column.name,
    field: column.name,
    sortable: true,
    filter: true,
    headerComponent: () => (
      <div className="column-header">
        <span className="column-name">{column.name}</span>
        <button
          className="rename-column-button"
          onClick={() => onRenameColumn(column.column_id, column.name)}
          title="Rename column"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>
    ),
  }));

  const defaultColDef = {
    resizable: true,
  };

  return (
    <div className="table-detail">
      {/* <div className="table-header">
        <div className="table-info">
          <h2>{tableData.name}</h2>
          <div className="table-stats">
            {tableData.columns.length} columns • {tableData.rows.length} rows
          </div>
        </div>
        <div className="table-actions">
          <button
            className="action-button rename-table-button"
            onClick={() => onRenameTable(tableData.name)}
          >
            Rename Table
          </button>
          <button
            className="action-button reupload-button"
            onClick={onReuploadTable}
          >
            Reupload CSV
          </button>
          <button
            className="action-button delete-button"
            onClick={onDeleteTable}
          >
            Delete Table
          </button>
        </div>
      </div> */}

      <div className="ag-theme-alpine table-grid" style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[20, 50, 100]}
        />
      </div>
    </div>
  );
};