import { Button, Fade, IconButton, LinearProgress, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { UserContext } from '../../contexts/userContext'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { Delete, Edit, FilterAlt, FilterAltOff, Fullscreen, FullscreenExit, Menu as MenuIcon, Photo } from '@mui/icons-material';
import DBPagination from '../../components/pagination/DBpagination'
import ExportToExcel from '../../utils/ExportToExcel'
import PopUp from '../../components/popup/PopUp'
import { GetUsersForDropdown } from '../../services/UserServices'
import moment from 'moment'
import { DropDownDto } from '../../dtos/dropdown.dto'
import { GetDriverSystemDto } from '../../dtos/driver.dto'
import { GetDriverSystems } from '../../services/DriverServices'
import CreateOrEditDriverSystemDialog from '../../components/dialogs/driver/CreateOrEditDriverSystemDialog'
import ViewDriverSystemPhotoDialog from '../../components/dialogs/driver/ViewDriverSystemPhotoDialog'
import DeleteDriverSystemDialog from '../../components/dialogs/driver/DeleteDriverSystemDialog'


export default function DriverAppSystemPage() {
  const [paginationData, setPaginationData] = useState({ limit: 100, page: 1, total: 1 });
  const { user: LoggedInUser } = useContext(UserContext)
  const [system, setSystem] = useState<GetDriverSystemDto>()
  const [systems, setSystems] = useState<GetDriverSystemDto[]>([])
  const [users, setUsers] = useState<DropDownDto[]>([])
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const [userId, setUserId] = useState<string>()
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date()).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")
  })
  const { data, isLoading, isSuccess, isRefetching, refetch } = useQuery<AxiosResponse<{ result: GetDriverSystemDto[], page: number, total: number, limit: number }>, BackendError>(["shoe_weights", userId, dates?.start_date, dates?.end_date], async () => GetDriverSystems({ limit: paginationData?.limit, page: paginationData?.page, id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))

  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => GetUsersForDropdown({ hidden: false, permission: 'driver_system_view', show_assigned_only: true }))

  useEffect(() => {
    if (isUsersSuccess)
      setUsers(usersData?.data)
  }, [users, isUsersSuccess, usersData])



  useEffect(() => {
    if (data && isSuccess) {
      setSystems(data.data.result)
      setPaginationData({
        ...paginationData,
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total
      })
    }
  }, [data, isSuccess])


  const columns = useMemo<MRT_ColumnDef<GetDriverSystemDto>[]>(
    () => systems && [
      {
        accessorKey: 'actions',
        header: '',

        enableColumnFilter: false,

        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>

              <>
                {LoggedInUser?.assigned_permissions.includes('driver_system_edit') && <>
                  <IconButton color="info"
                    onClick={() => {
                      setDialog('CreateOrEditDriverSystemDialog')
                      setSystem(cell.row.original)
                    }}

                  >
                    <Edit />
                  </IconButton>

                </>}

                {LoggedInUser?.is_admin && LoggedInUser?.assigned_permissions.includes('driver_system_delete') && <Tooltip title="delete">
                  <IconButton color="error"

                    onClick={() => {
                      setDialog('DeleteDriverSystemDialog')
                      setSystem(cell.row.original)
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>}
              </>


            </Stack>}
        />
      },

      {
        accessorKey: 'photo',
        header: 'Photos',
        Cell: (cell) => <>
          {cell.row.original.photo && <Photo onClick={() => {
            setSystem(cell.row.original)
            setDialog('ViewDriverSystemPhotoDialog')
          }} sx={{ height: 15, width: 15, color: 'grey', cursor: 'pointer' }} />
          }

        </>
      },
      {
        accessorKey: 'date',
        header: 'Date'
      },
      {
        accessorKey: 'driver.label',
        header: 'Driver'
      },
      {
        accessorKey: 'billno',
        header: 'Bill No'
      },
      {
        accessorKey: 'party',
        header: 'Party'
      },
      {
        accessorKey: 'marka',
        header: 'Marka'
      },
      {
        accessorKey: 'trasport',
        header: 'Transport'
      },
      {
        accessorKey: 'remark',
        header: 'Remark'
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',

        Cell: (cell) => <>{cell.row.original.created_at || ""}</>
      },
      {
        accessorKey: 'updated_by.label',
        header: 'Creator',

        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.updated_by.label.toString() || "" ? cell.row.original.updated_by.label.toString() || "" : ""}</>,
        filterSelectOptions: systems && systems.map((i) => {
          return i.updated_by.label.toString() || "";
        }).filter(onlyUnique)
      },
    ],
    [systems],
  );


  const table = useMaterialReactTable({
    columns,
    data: systems, columnFilterDisplayMode: 'popover',
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableHeadRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
        border: '1px solid lightgrey;',
      },
    }),
    muiTableHeadCellProps: ({ column }) => ({
      sx: {
        '& div:nth-child(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially hidden
        },
        '& div:nth-child(2)': {
          display: (column.getIsFiltered() || column.getIsGrouped()) ? 'inline-block' : 'none'
        },
        '&:hover div:nth-child(1) span': {
          display: 'inline', // Visible on hover
        },
        '&:hover div:nth-child(2)': {
          display: 'block', // Visible on hover
        }
      },
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '72vh' }
    }),
    positionToolbarAlertBanner: 'none',
    renderTopToolbarCustomActions: ({ table }) => (

      <Stack
        spacing={2}
        direction="row"
        sx={{ width: '100%' }}
        justifyContent="space-between"

      >
        <Typography
          variant={'h6'}
          component={'h1'}
          sx={{ pl: 1 }}

        >
          Driver App System
        </Typography>
        {/* filter dates and person */}
        <Stack direction="row" gap={2} justifyContent={'end'}>
          < TextField
            variant='filled'
            size="small"
            type="date"
            id="start_date"
            label="Start Date"
            fullWidth
            value={dates.start_date}
            onChange={(e) => {
              if (e.currentTarget.value) {
                setDates({
                  ...dates,
                  start_date: moment(e.target.value).format("YYYY-MM-DD")
                })
              }
            }}
          />
          < TextField
            variant='filled'
            size="small"
            type="date"
            id="end_date"
            label="End Date"
            value={dates.end_date}
            fullWidth
            onChange={(e) => {
              if (e.currentTarget.value) {
                setDates({
                  ...dates,
                  end_date: moment(e.target.value).format("YYYY-MM-DD")
                })
              }
            }}
          />
          {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 && < TextField
            size="small"
            select
            variant='filled'
            SelectProps={{
              native: true,
            }}
            onChange={(e) => {
              setUserId(e.target.value)
            }}
            required
            id="system_owner"
            label="Person"
            fullWidth
          >
            <option key={'00'} value={undefined}>

            </option>
            {
              users.map((user, index) => {

                return (<option key={index} value={user.id}>
                  {user.label}
                </option>)

              })
            }
          </TextField>}
          <Tooltip title="Toogle Filter">
            <Button size="small" color="inherit" variant='contained'
              onClick={() => {
                if (table.getState().showColumnFilters)
                  table.resetColumnFilters(true)
                table.setShowColumnFilters(!table.getState().showColumnFilters)
              }
              }
            >
              {table.getState().showColumnFilters ? <FilterAltOff /> : <FilterAlt />}
            </Button>
          </Tooltip>
          <Tooltip title="Toogle FullScreen">
            <Button size="small" color="inherit" variant='contained'
              onClick={() => table.setIsFullScreen(!table.getState().isFullScreen)
              }
            >
              {table.getState().isFullScreen ? <FullscreenExit /> : <Fullscreen />}
            </Button>
          </Tooltip>
          <Tooltip title="Menu">
            <Button size="small" color="inherit" variant='contained'
              onClick={(e) => setAnchorEl(e.currentTarget)
              }
            >
              <MenuIcon />
              <Typography pl={1}> Menu</Typography>
            </Button>
          </Tooltip>
        </Stack>
      </Stack >
    ),
    rowVirtualizerInstanceRef,
    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.background.paper, //change default background color
    }),
    renderBottomToolbarCustomActions: () => (
      <DBPagination paginationData={paginationData} refetch={() => { refetch() }} setPaginationData={setPaginationData} />

    ),
    muiTableBodyCellProps: () => ({
      sx: {
        border: '1px solid lightgrey;',
      },
    }),
    initialState: { density: 'compact' },
    enableRowSelection: true,
    enableRowNumbers: true,
    enableColumnPinning: true,
    onSortingChange: setSorting,
    enableTopToolbar: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    onColumnVisibilityChange: setColumnVisibility, //optional

    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    },
    enableBottomToolbar: true,
    enableGlobalFilter: false,
    manualPagination: true,
    enablePagination: false,
    enableToolbarInternalActions: false
  });

  useEffect(() => {
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting]);
  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting]);

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

  return (
    <>
      {
        isLoading || isRefetching && <LinearProgress color='secondary' />
      }
      <>
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
          {LoggedInUser?.assigned_permissions.includes('driver_system_create') && <MenuItem
            onClick={() => {
              setDialog('CreateOrEditDriverSystemDialog')
              setSystem(undefined);
              setAnchorEl(null)
            }}


          > Add New</MenuItem>}

          {LoggedInUser?.assigned_permissions.includes('driver_system_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export All</MenuItem>}
          {LoggedInUser?.assigned_permissions.includes('driver_system_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export Selected</MenuItem>}

        </Menu >
        <CreateOrEditDriverSystemDialog dialog={dialog} setDialog={setDialog} item={system} />
      </>
      {
        system ?
          <>

            <DeleteDriverSystemDialog dialog={dialog} setDialog={setDialog} item={system} />
            <ViewDriverSystemPhotoDialog dialog={dialog} setDialog={setDialog} item={system} />
          </>
          : null
      }
      <MaterialReactTable table={table} />

    </>

  )

}