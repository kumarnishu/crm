import { IconButton, LinearProgress, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { DropDownDto, IColumnRowData } from '../../dtos'
import { GetExcelDbReport } from '../../services/ExcelDbService'
import { useParams } from 'react-router-dom'
import PopUp from '../../components/popup/PopUp'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, KeyChoiceActions } from '../../contexts/dialogContext'
import { Comment, Visibility } from '@mui/icons-material'
import { GetKeyCategoryById } from '../../services/KeyServices'
import CreateOrEditExcelDBRemarkDialog from '../../components/dialogs/excel-db/CreateOrEditExcelDBRemarkDialog'
import ViewExcelDBRemarksDialog from '../../components/dialogs/excel-db/ViewExcelDBRemarksDialog'


export default function ExcelDBPage() {
  const [reports, setReports] = useState<IColumnRowData['rows']>([])
  const [reportcolumns, setReportColumns] = useState<IColumnRowData['columns']>([])
  const [category, setCategory] = useState<DropDownDto>()
  const [obj, setObj] = useState<string | undefined>()
  const { user: LoggedInUser } = useContext(UserContext)
  const { setChoice } = useContext(ChoiceContext)
  const { id, name, label } = useParams()

  const { data: categorydata, refetch: RefetchCategory, isSuccess: isSuccessCategorydata } = useQuery<AxiosResponse<DropDownDto>, BackendError>(["key_categories"], async () => GetKeyCategoryById(id || ""), { enabled: false })

  const { data, isLoading, isSuccess, refetch, isRefetching } = useQuery<AxiosResponse<IColumnRowData>, BackendError>(["exceldb"], async () => GetExcelDbReport(id || ""), { enabled: false })
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  let columns = useMemo<MRT_ColumnDef<IColumnRowData['columns']>[]>(
    () => reportcolumns && reportcolumns.map((item, index) => {
      if (item.type == "action")
        return {
          accessorKey: item.key,
          header: item.header,
          maxSize: 70,
          Cell: (cell) => <PopUp
            element={
              <Stack direction="row" spacing={1} key={item.key}>
                {LoggedInUser?.assigned_permissions.includes('grp_excel_view') && <Tooltip title="view remarks">
                  <IconButton color="primary"

                    onClick={() => {

                      setChoice({ type: KeyChoiceActions.view_excel_db_remarks })
                      //@ts-ignore
                      if (cell.row.original['Account Name'])
                        //@ts-ignore
                        setObj(cell.row.original['Account Name'])
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>}

                {LoggedInUser?.assigned_permissions.includes('grp_excel_edit') &&
                  <Tooltip title="Add Remark">
                    <IconButton

                      color="success"
                      onClick={() => {

                        setChoice({ type: KeyChoiceActions.create_or_edit_excel_db_remark })
                        //@ts-ignore
                        if (cell.row.original['Account Name'])
                          //@ts-ignore
                          setObj(cell.row.original['Account Name'])
                      }}
                    >
                      <Comment />
                    </IconButton>
                  </Tooltip>}

              </Stack>}
          />,
          Footer: ""
        }
      else if (item.type == "string")
        return { accessorKey: item.key, header: item.header, Footer: "", grow: true }
      else if (item.type == "timestamp")
        return { accessorKey: item.key, header: item.header, Footer: "", grow: true }
      else if (item.type == "date")
        return {
          accessorKey: item.key,
          header: item.header,
          grow: true,
          Footer: <b>Total</b>,
        }
      else
        return {
          accessorKey: item.key, header: item.header,
          grow: true,
          Cell: (cell) => parseFloat(Number(cell.cell.getValue()).toFixed(2)),
          //@ts-ignore
          Footer: ({ table }) => <b>{index < 3 ? table.getFilteredRowModel().rows.length : table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original[item.key]) }, 0).toFixed()}</b>
        }
    })
    ,
    [reports, reportcolumns],
    //end
  );

  useEffect(() => {
    if (id != "") {
      refetch()
      RefetchCategory()
    }
  }, [id])

  useEffect(() => {
    if (isSuccess && data) {
      setReports(data.data.rows);
      setReportColumns(data.data.columns)
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isSuccessCategorydata && categorydata) {
      setCategory(categorydata.data);
    }
  }, [isSuccessCategorydata, categorydata]);


  const table = useMaterialReactTable({
    //@ts-ignore
    columns, columnFilterDisplayMode: 'popover',
    data: reports ? reports : [], //10,000 rows       
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '62vh' }
    }),
    muiTableHeadRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white'
      },
    }),
    muiTableBodyCellProps: () => ({
      sx: {
        border: '1px solid #c2beba;',
      },
    }),
    muiPaginationProps: {
      rowsPerPageOptions: [100, 200, 500, 1000, 2000, 5000, 7000, 10000],
      shape: 'rounded',
      variant: 'outlined',
    },
    initialState: {
      density: 'compact', pagination: { pageIndex: 0, pageSize: 7000 }
    },
    enableGrouping: true,
    enableRowSelection: true,
    manualPagination: false,
    enablePagination: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    rowVirtualizerInstanceRef, //optional
    rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
    columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizer
    onSortingChange: setSorting,
    state: { isLoading, sorting }
  });
  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting]);

  console.log(category)
  return (
    <>
      <Stack
        spacing={2}
        padding={1}
        direction="row"
        justifyContent="space-between"
        alignItems={'center'}
      >
        <Typography
          variant={'h6'}
          component={'h1'}
          sx={{ pl: 1 }}
        >
          {name + (label == 'undefined' ? "" : " - " + label) || "Excel DB"}
        </Typography>
      </Stack >
      {id && obj && <CreateOrEditExcelDBRemarkDialog category={id} obj={obj} />}
      {id && obj && <ViewExcelDBRemarksDialog id={id} obj={obj} />}

      <MaterialReactTable table={table} />
      {isLoading || isRefetching && <LinearProgress />}
    </>

  )

}

