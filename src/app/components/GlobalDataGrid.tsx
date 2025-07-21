"use client";

import React from "react";
import {
  DataGrid,
  GridPaginationModel,
  GridActionsCellItem,
  GridCellModesModel,
  GridColDef,
  GridRowId,
  GridRowModel,
} from "@mui/x-data-grid";

interface CustomDataGridProps {
  rows: GridRowModel[];
  columns: GridColDef[];
  getRowId?: (row: GridRowModel) => GridRowId;

  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  rowCount: number;
  loading: boolean;

  cellModesModel?: GridCellModesModel;
  onCellModesModelChange?: (model: GridCellModesModel) => void;

  processRowUpdate?: (
    newRow: GridRowModel,
    oldRow: GridRowModel
  ) => Promise<GridRowModel>;
  onProcessRowUpdateError?: (error: any) => void;

  onEditClick?: (id: GridRowId) => void;

  pageSizeOptions?: number[];
  sx?: object;
}

const CustomDataGrid: React.FC<CustomDataGridProps> = ({
  rows,
  columns,
  getRowId,
  paginationModel,
  onPaginationModelChange,
  rowCount,
  loading,
  cellModesModel,
  onCellModesModelChange,
  processRowUpdate,
  onProcessRowUpdateError,
  onEditClick,
  pageSizeOptions = [5, 10, 20],
  sx = {},
}) => {
  const enhancedColumns = React.useMemo(() => {
    if (!onEditClick) return columns;

    const hasActions = columns.some((col) => col.field === "actions");
    if (hasActions) return columns;

    return [
      ...columns,
      {
        field: "actions",
        headerName: "Actions",
        type: "actions",
        width: 100,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={
              <span className="material-symbols-outlined">edit</span>
            }
            label="Edit"
            onClick={() => onEditClick(params.id)}
            showInMenu={false}
          />,
        ],
        sortable: false,
        filterable: false,
        disableExport: true,
      },
    ];
  }, [columns, onEditClick]);

  return (
    <DataGrid
      rows={rows}
      columns={enhancedColumns}
      getRowId={getRowId}
      rowCount={rowCount}
      loading={loading}
      pagination
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      pageSizeOptions={pageSizeOptions}
      autoHeight
      disableRowSelectionOnClick
      cellModesModel={cellModesModel}
      onCellModesModelChange={onCellModesModelChange}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={onProcessRowUpdateError}
      experimentalFeatures={{ newEditingApi: true }}
      sx={{
        bgcolor: "#fff",
        borderRadius: 2,
        boxShadow: 2,
        border: "1px solid #e0e0e0",
        fontSize: 14,
        "& .MuiDataGrid-columnHeaders": {
          bgcolor: "#f9fafb",
          fontWeight: "bold",
        },
        "& .MuiDataGrid-row:hover": {
          bgcolor: "#f5f5f5",
        },
        "& .MuiDataGrid-footerContainer": {
          bgcolor: "#f9fafb",
        },
        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
          outline: "none",
        },
        ...sx,
      }}
    />
  );
};

export default CustomDataGrid;
