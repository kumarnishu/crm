import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { BackendError } from '../..'
import ExportToExcel from '../../utils/ExportToExcel'
import CreateOrEditChecklistCategoryDialog from '../../components/dialogs/checklists/CreateOrEditChecklistCategoryDialog'
import { DropDownDto } from '../../dtos/dropdown.dto'
import { DropdownService } from '../../services/DropDownServices'

// const MultiSelectFilter = ({ key, table, options }: { key: string, table: MRT_TableInstance<DropDownDto>, options: DropDownDto[] }) => {
//   const [filter, setFilter] = useState<string>()
//   const [columnFilter, setColumFilter] = useState<MRT_ColumnFiltersState>(table.getState().columnFilters)
//   const [selected, setSelected] = useState<DropDownDto[]>([])
//   const [filteredOptions, setFilteredOptions] = useState<DropDownDto[]>([])

//   useEffect(() => {
//     if (filter) {
//       setFilteredOptions(options.filter(option => option.label.toLowerCase().includes(filter.toLowerCase())))
//     } else {
//       setFilteredOptions(options)
//     }
//   }, [filter])


//   console.log(columnFilter)
//   return (
//     <Box sx={{ maxHeight: 500, overflowY: 'auto', pt: 2 }}>
//       <TextField size="small" variant="outlined" label="Search" onChange={(e) => {
//         const value = e.target.value
//         setFilter(value)
//       }} />
//       <br />
//       <Button fullWidth onClick={() => setSelected([])}>Clear All</Button>
//       {filteredOptions.map((option) => (
//         <MenuItem key={option.id} value={option.label}>
//           <Checkbox checked={Boolean(selected.find(item => item.id == option.id))} onChange={(e) => {
//             if (e.target.checked) {
//               setSelected([...selected, option])
//             }
//             else {
//               setSelected(selected.filter(item => item.id !== option.id))
//             }
//           }} />
//           <ListItemText>{option.label.slice(0, 50)}</ListItemText>
//         </MenuItem>
//       ))}
//     </Box>
//   );
// }

export default function ChecklistCategoriesPage() {
  const [category, setChecklistCategory] = useState<DropDownDto>()
  const [categories, setChecklistCategorys] = useState<DropDownDto[]>([])
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["check_categories"], async () => new DropdownService().GetAllCheckCategories())


  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<DropDownDto>[]>(
    //column definitions...
    () => categories && [
      {
        accessorKey: 'actions',
        header: '',

        grow: false,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>
                {LoggedInUser?.assigned_permissions.includes('checklist_category_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setChecklistCategory(cell.row.original)
                      setDialog('CreateOrEditChecklistCategoryDialog')
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
        accessorKey: 'label',
        header: 'Category',
        grow: false,
        filterVariant: 'text',
        Cell: (cell) => <>{cell.row.original.label ? cell.row.original.label : ""}</>,
        // Filter: (props) => <MultiSelectFilter key="value" table={props.table} options={onlyUniqueByKey(categories && categories.map((i) => {
        //   return { id: i.id, label: i.label };
        // }), 'label')} />
      },
    ],
    [categories],
    //end
  );



  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: categories, //10,000 rows       
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
    muiTableHeadCellProps: ({ column }) => ({
      sx: {
        '& div:nth-of-type(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially hidden
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
    onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //
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
    if (isSuccess) {
      setChecklistCategorys(data.data);
    }
  }, [data, isSuccess]);

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
          Checklist Category
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
            {LoggedInUser?.assigned_permissions.includes("checklist_category_create") && <MenuItem
              onClick={() => {
                setChecklistCategory(undefined)
                setAnchorEl(null)
                setDialog('CreateOrEditChecklistCategoryDialog')
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('checklist_category_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('checklist_category_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditChecklistCategoryDialog dialog={dialog} setDialog={setDialog} category={category} />
        </>


      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

