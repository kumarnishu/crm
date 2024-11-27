import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
   import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import CreateOrEditStateDialog from '../../components/dialogs/crm/CreateOrEditStateDialog'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, LeadChoiceActions } from '../../contexts/dialogContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { GetAllStates } from '../../services/LeadsServices'
import FindUknownCrmStatesDialog from '../../components/dialogs/crm/FindUknownCrmStatesDialog'
import { GetCrmStateDto } from '../../dtos'
import AssignCrmStatesDialog from '../../components/dialogs/crm/AssignCrmStatesDialog'
import ExportToExcel from '../../utils/ExportToExcel'


export default function CrmStatesPage() {
  const [state, setState] = useState<GetCrmStateDto>()
  const [states, setStates] = useState<GetCrmStateDto[]>([])
  const [flag, setFlag] = useState(1);
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetCrmStateDto[]>, BackendError>(["crm_states"], async () => GetAllStates())


  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetCrmStateDto>[]>(
    //column definitions...
    () => states && [
      {
        accessorKey: 'actions',
        header: '',
        
        Footer: <b></b>,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('states_delete') &&
                  <Tooltip title="delete">
                    <IconButton color="error"

                      onClick={() => {
                        setChoice({ type: LeadChoiceActions.delete_crm_item })
                        setState(cell.row.original)

                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                }
                {LoggedInUser?.assigned_permissions.includes('states_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setState(cell.row.original)
                      setChoice({ type: LeadChoiceActions.create_or_edit_state })
                    }}

                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}

              </>

            </Stack>}
        />
      },

      {
        accessorKey: 'state',
        header: 'State',
        
        filterVariant: 'multi-select',
        Cell: (cell) => <> {
          [cell.row.original.state, String(cell.row.original.alias1 || ""), String(cell.row.original.alias2 || "")].filter(value => value)
            .join(", ")
        }</>,
        filterSelectOptions: states && states.map((i) => {
          return i.state;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'assigned_users',
        header: 'Assigned Users',
      
        filterVariant: 'text',
        Cell: (cell) => <>{cell.row.original.assigned_users && cell.row.original.assigned_users.length > 0 ? cell.row.original.assigned_users : ""}</>,
      }
    ],
    [states, data],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: states, //10,000 rows     
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '68vh' }
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
    initialState: {
      density: 'compact', showGlobalFilter: true, pagination: { pageIndex: 0, pageSize: 500 }
    },
    enableGrouping: true,
    enableRowSelection: true,
    manualPagination: false,
    enablePagination: true,
    enableRowNumbers: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //optional
    rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
    columnVirtualizerOptions: { overscan: 2 },
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });
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


  useEffect(() => {
    if (isSuccess) {
      setStates(data.data);
    }
  }, [isSuccess, data]);


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
          States : {states && states.length}
        </Typography>

        <>

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
            {LoggedInUser?.assigned_permissions.includes('states_create') && <MenuItem

              onClick={() => {
                setChoice({ type: LeadChoiceActions.create_or_edit_state })
                setState(undefined)
                setAnchorEl(null)
              }}
            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some states")
                }
                else {
                  setChoice({ type: LeadChoiceActions.bulk_assign_crm_states })
                  setState(undefined)
                  setFlag(1)
                }
                setAnchorEl(null)
              }}
            > Assign States</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some states")
                }
                else {
                  setChoice({ type: LeadChoiceActions.bulk_assign_crm_states })
                  setState(undefined)
                  setFlag(0)
                }
                setAnchorEl(null)
              }}
            > Remove States</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_create') && <MenuItem
              sx={{ color: 'red' }}

              onClick={() => {
                setChoice({ type: LeadChoiceActions.find_unknown_states })
                setState(undefined)
                setAnchorEl(null)
              }}
            > Find Unknown States</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditStateDialog />
          {LoggedInUser?.is_admin && <FindUknownCrmStatesDialog />}
          {<AssignCrmStatesDialog flag={flag} states={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
          <>
            {
              state ?
                <>

                  <DeleteCrmItemDialog state={state} />
                  <CreateOrEditStateDialog state={state} />
                  <DeleteCrmItemDialog state={state} />
                </>
                : null
            }
          </>
        </>


      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}
