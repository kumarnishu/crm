import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Add } from '@mui/icons-material'
import { Button, Fade, IconButton, Menu, MenuItem, TextField, Typography } from '@mui/material'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { GetSalesmanAttendanceReportDto } from '../../dtos/leave.dto'
import { AttendanceService } from '../../services/AttendanceService'
import ApplyLeaveFromAdminDialog from '../../components/dialogs/attendance/ApplyLeaveFromAdminDialog'
import ApplyLeaveDialog from '../../components/dialogs/attendance/ApplyLeaveDialog'
import { useNavigate } from 'react-router-dom'

export default function SalesAttendanceReportPage() {
  const [balance, setBalance] = useState<GetSalesmanAttendanceReportDto>()
  const [balances, setBalances] = useState<GetSalesmanAttendanceReportDto[]>([])
  const { user: LoggedInUser } = useContext(UserContext)
  const navigate = useNavigate()
  const getCurrentYearMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Ensure two digits
    return Number(`${year}${month}`);
  };
  const getYearMonthLabels = () => {
    const result = [];
    const now = new Date();

    for (let i = -3; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' }); // Full month name
      result.push({ value: Number(`${year}${String(date.getMonth() + 1).padStart(2, '0')}`), label: `${month} ${year}` });
    }

    return result;
  };
  const [yearmonth, setYearMonth] = useState<number>(getCurrentYearMonth())


  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetSalesmanAttendanceReportDto[]>, BackendError>(["attendance_report", yearmonth], async () => new AttendanceService().GetAttendanceReport({ yearmonth: yearmonth }))
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetSalesmanAttendanceReportDto>[]>(
    //column definitions...
    () => balances && [
      {
        accessorKey: 'actions',
        header: '',

        enableColumnFilter: false,

        Cell: ({ cell }) => <>
          <Button color="inherit" size="small"
            variant='text'
            onClick={() => {
              setBalance(cell.row.original)
              if (LoggedInUser?.is_admin)
                setDialog('ApplyLeaveFromAdminDialog')
              else
                setDialog('ApplyLeaveDialog')
            }}
          >
            <Add /> Apply Leave
          </Button>
        </>
      },

      {
        accessorKey: 'attendance',
        header: 'Attendance',
        Cell: (cell) => <>{cell.row.original.attendance ? cell.row.original.attendance : ""}</>,
      },
      {
        accessorKey: 'created_at',
        header: '',
        Cell: () => <Stack direction={'column'}>
          <Typography sx={{ fontWeight: '500' }} fontSize='0.9rem'>{"This Month Provided"}</Typography>
          <Typography sx={{ fontWeight: '500' }} fontSize='0.9rem'>{"Old Balance"}</Typography>
          <Typography sx={{ fontWeight: '500' }} fontSize='0.9rem'>{"Total"}</Typography>
          <Typography sx={{ fontWeight: '500' }} fontSize='0.9rem'>{"Consumed this Month"}</Typography>
          <Typography sx={{ fontWeight: '500' }} fontSize='0.9rem'>{"Carry Forward"}</Typography>
        </Stack>
      },
      {
        accessorKey: 'provided.sl',
        header: 'SL',
        Cell: (cell) => <Stack direction={'column'}>
          <Typography >{cell.row.original.provided.sl ? cell.row.original.provided.sl : "."}</Typography>
          <Typography >{cell.row.original.brought_forward.sl ? cell.row.original.brought_forward.sl : "."}</Typography>
          <Typography >{cell.row.original.total.sl ? cell.row.original.total.sl : "."}</Typography>
          <Typography >{cell.row.original.consumed.sl ? cell.row.original.consumed.sl : "."}</Typography>
          <Typography >{cell.row.original.carryforward.sl ? cell.row.original.carryforward.sl : "."}</Typography>
        </Stack>
      },
      {
        accessorKey: 'brought_forward.fl',
        header: 'FL',
        Cell: (cell) => <Stack direction={'column'}>
          <Typography >{cell.row.original.provided.fl ? cell.row.original.provided.fl : "."}</Typography>
          <Typography >{cell.row.original.brought_forward.fl ? cell.row.original.brought_forward.fl : "."}</Typography>
          <Typography >{cell.row.original.total.fl ? cell.row.original.total.fl : "."}</Typography>
          <Typography >{cell.row.original.consumed.fl ? cell.row.original.consumed.fl : "."}</Typography>
          <Typography >{cell.row.original.carryforward.fl ? cell.row.original.carryforward.fl : "."}</Typography>

        </Stack>
      },
      {
        accessorKey: 'total.sw',
        header: 'SW',
        Cell: (cell) => <Stack direction={'column'}>
          <Typography >{cell.row.original.provided.sw ? cell.row.original.provided.sw : "."}</Typography>
          <Typography >{cell.row.original.brought_forward.sw ? cell.row.original.brought_forward.sw : "."}</Typography>
          <Typography >{cell.row.original.total.sw ? cell.row.original.total.sw : "."}</Typography>
          <Typography >{cell.row.original.consumed.sw ? cell.row.original.consumed.sw : "."}</Typography>
          <Typography >{cell.row.original.carryforward.sw ? cell.row.original.carryforward.sw : "."}</Typography>
        </Stack>
      },
      {
        accessorKey: 'consumed.cl',
        header: 'CL',
        Cell: (cell) => <Stack direction={'column'}>
          <Typography >{cell.row.original.provided.cl ? cell.row.original.provided.cl : "."}</Typography>
          <Typography >{cell.row.original.brought_forward.cl ? cell.row.original.brought_forward.cl : "."}</Typography>
          <Typography >{cell.row.original.total.cl ? cell.row.original.total.cl : "."}</Typography>
          <Typography >{cell.row.original.consumed.cl ? cell.row.original.consumed.cl : "."}</Typography>
          <Typography >{cell.row.original.carryforward.cl ? cell.row.original.carryforward.cl : "."}</Typography>
        </Stack>
      },
      {
        accessorKey: 'yearmonth',
        header: 'year Month',
        Cell: (cell) => <>{cell.row.original.yearmonth ? cell.row.original.yearmonth : ""}</>,
      },
      {
        accessorKey: 'employee.label',
        header: 'Employee',
        enableColumnFilter: true,
        Cell: (cell) => <>{cell.row.original.employee ? cell.row.original.employee.label : ""}</>,
      }
    ],
    [balances],
    //end
  );


  const table = useMaterialReactTable({
    columns,
    data: balances, //10,000 rows       
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
    muiTableHeadCellProps: ({ column }) => ({
      sx: {
        '& div:nth-of-type(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially status
        },
        '& div:nth-of-type(2)': {
          display: (column.getIsFiltered() || column.getIsGrouped()) ? 'inline-block' : 'none'
        },
        '&:hover div:nth-of-type(1) span': {
          display: 'inline', // Visible on hover
        },
        '&:hover div:nth-of-type(2)': {
          display: 'block', // Visible on hover
        }
      },
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
      rowsPerPageOptions: [100, 200, 500, 1000, 2000],
      shape: 'rounded',
      variant: 'outlined',
    },
    enableDensityToggle: false, initialState: {
      density: 'compact', pagination: { pageIndex: 0, pageSize: 500 }
    },
    columnFilterDisplayMode: 'popover',
    enableRowSelection: true,
    enablePagination: true,
    enableRowNumbers: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //optional

    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });

  //load state from local storage
  useEffect(() => {
    const columnVisibility = localStorage.getItem(
      'mrt_columnVisibility_table_1',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_table_1',
    );





    if (columnVisibility) {
      setColumnVisibility(JSON.parse(columnVisibility));
    }


    if (columnSizing)
      setColumnSizing(JSON.parse(columnSizing))

    isFirstRender.current = false;
  }, []);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem(
      'mrt_columnVisibility_table_1',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_table_1', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_table_1', JSON.stringify(columnSizing));
  }, [columnSizing]);

  useEffect(() => {
    if (isSuccess) {
      setBalances(data.data);
    }
  }, [data, isSuccess]);

  console.log(balance, dialog)
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
          Sales Attendance Report
        </Typography>
        {LoggedInUser?.is_admin && <Typography
          variant={'h6'}
          component={'h1'}
          sx={{ pl: 1, cursor: 'pointer' }}
          color="red"
          onClick={() => { navigate('/Attendance/LeavesPage') }}
        >
          5  leaves pending For Approval
        </Typography>}

        <Stack spacing={2}
          padding={1}
          direction="row"
          justifyContent="space-between">
          < TextField
            select
            SelectProps={{
              native: true
            }}
            id="state"
            size="small"
            label="Select Month"
            sx={{ width: '200px' }}
            value={yearmonth}
            onChange={(e) => {
              if (e.currentTarget.value)
                setYearMonth(Number(e.target.value));
            }
            }
          >
            <option key={getYearMonthLabels()[3].value} value={getYearMonthLabels()[3].value}>
              Current Month
            </option>
            {
              getYearMonthLabels().map(cat => {
                return (<option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>)
              })
            }
          </TextField>

          <IconButton size="small" color="primary"
            onClick={(e) => setAnchorEl(e.currentTarget)
            }
            sx={{ border: 2, borderRadius: 3, marginLeft: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)
            }
            TransitionComponent={Fade}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            sx={{ borderRadius: 2 }}
          >

            {LoggedInUser?.assigned_permissions.includes('leave_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('leave_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
        </Stack>
      </Stack >
      {/* table */}
      < MaterialReactTable table={table} />
      {balance && <ApplyLeaveFromAdminDialog dialog={dialog} setDialog={setDialog} leavedata={balance} />}
      {balance && <ApplyLeaveDialog dialog={dialog} setDialog={setDialog} leavedata={balance} />}
    </>

  )

}

