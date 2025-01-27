import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState,  MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { BackendError } from '../..'
import ExportToExcel from '../../utils/ExportToExcel'
import CreateOrEditKeyDialog from '../../components/dialogs/authorization/CreateOrEditKeyDialog'
import AssignKeysDialog from '../../components/dialogs/authorization/AssignKeysDialog'
import { toTitleCase } from '../../utils/TitleCase'
import { KeyExcelButton } from '../../components/buttons/KeyExcelButton'
import DeleteKeyDialog from '../../components/dialogs/authorization/DeleteKeyDialog'

import { AuthorizationService } from '../../services/AuthorizationService'
import { GetKeyDto } from '../../dtos/AuthorizationDto'
import { DropDownDto } from '../../dtos/DropDownDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'


export default function KeysPage() {
    const [key, setkey] = useState<GetKeyDto>()
    const [keys, setkeys] = useState<GetKeyDto[]>([])
    const [category, setKeyCategory] = useState<string>('all')
    const { user: LoggedInUser } = useContext(UserContext)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetKeyDto[]>, BackendError>(["keys", category], async () => new AuthorizationService().GetAllKeys({ category: category }))
    const [flag, setFlag] = useState(1);
    const [categories, setKeyCategorys] = useState<DropDownDto[]>([])
    const [dialog, setDialog] = useState<string | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
    
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const { data: categoriesdata } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["key_categories"], async () => new AuthorizationService().GetAllKeyCategoriesForDropdown({ show_assigned_only: false }))


    const columns = useMemo<MRT_ColumnDef<GetKeyDto>[]>(
        //column definitions...
        () => keys && [
            {
                accessorKey: 'actions',   enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
                header:'Actions',

                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row">
                            <>
                                {LoggedInUser?.assigned_permissions.includes('key_edit') && <Tooltip title="edit">
                                    <IconButton

                                        onClick={() => {
                                            setkey(cell.row.original)
                                            setDialog('CreateOrEditKeyDialog')
                                        }}

                                    >
                                        <Edit />
                                    </IconButton>
                                </Tooltip>}
                                {LoggedInUser?.assigned_permissions.includes('key_delete') && <Tooltip title="delete">
                                    <IconButton

                                        onClick={() => {
                                            setkey(cell.row.original)
                                            setDialog('DeleteKeyDialog')
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
                accessorKey: 'serial_no',
                header: 'Serial NO',
                Cell: (cell) => <>{cell.row.original.serial_no ? cell.row.original.serial_no : ""}</>,
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={keys.map((item) => {
                    return item.serial_no
                })} />,
            },
            {
                accessorKey: 'key',
                header: 'Key',

        
                Cell: (cell) => <>{cell.row.original.key ? cell.row.original.key : ""}</>,
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={keys.map((item) => {
                    return item.key
                })} />,
            },
            {
                accessorKey: 'type',
                header: 'Type',
                Cell: (cell) => <>{cell.row.original.type ? cell.row.original.type : ""}</>,
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={keys.map((item) => {
                    return item.type
                })} />,
            },
            {
                accessorKey: 'category.label',
                header: 'Category',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={keys.map((item) => {
                    return item.category.label
                })} />,
                Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.label : ""}</>

            },
            {
                accessorKey: 'is_date_key',
                header: 'Is date Key',
                enableColumnFilter:false,
                Cell: (cell) => <>{cell.row.original.is_date_key ? "true" : "false"}</>

            },
            {
                accessorKey: 'map_to_username',
                header: 'Map Username',
                enableColumnFilter:false,
                Cell: (cell) => <>{cell.row.original.map_to_username ? "true" : "false"}</>

            },
            {
                accessorKey: 'map_to_state',
                header: 'Map State',
                enableColumnFilter:false,
                Cell: (cell) => <>{cell.row.original.map_to_state ? "true" : "false"}</>

            },
            {
                accessorKey: 'assigned_users',
                header: 'Assigned Users',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={keys.map((item) => {
                  return item.assigned_users
                })} />,
                Cell: (cell) => <span title={cell.row.original.assigned_users}>{cell.row.original.assigned_users ? cell.row.original.assigned_users : ""}</span>

            },

        ],
        [keys],
        //end
    );


    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: keys, //10,000 rows       
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),
        muiTableContainerProps: (table) => ({
            sx: { height: table.table.getState().isFullScreen ? 'auto' : '70vh' }
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
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnSizingChange: setColumnSizing, state: {
            isLoading: isLoading,
            columnVisibility,

            sorting,
            columnSizing: columnSizing
        }
    });


    useEffect(() => {
        if (isSuccess) {
            setkeys(data.data);
        }
    }, [data, isSuccess]);

    useEffect(() => {
        if (isSuccess && categoriesdata) {
            setKeyCategorys(categoriesdata.data);
        }
    }, [categoriesdata, isSuccess]);
   

    //load state from local storage
    useEffect(() => {
        const columnVisibility = localStorage.getItem(
            'mrt_columnVisibility_KeysPage',
        );
        const columnSizing = localStorage.getItem(
            'mrt_columnSizing_KeysPage',
        );




        const sorting = localStorage.getItem('mrt_sorting_KeysPage');


        if (columnVisibility) {
            setColumnVisibility(JSON.parse(columnVisibility));
        }



        if (columnSizing)
            setColumnSizing(JSON.parse(columnSizing))
        if (sorting) {
            setSorting(JSON.parse(sorting));
        }
        isFirstRender.current = false;
    }, []);

    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem(
            'mrt_columnVisibility_KeysPage',
            JSON.stringify(columnVisibility),
        );
    }, [columnVisibility]);




    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_sorting_KeysPage', JSON.stringify(sorting));
    }, [sorting]);

    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_columnSizing_KeysPage', JSON.stringify(columnSizing));
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
                    Keys
                </Typography>



                <Stack direction={'row'} gap={1} alignItems={'center'}>
                    < TextField
                        select
                        SelectProps={{
                            native: true
                        }}
                        id="state"
                        size="small"
                        label="Select Category"
                        sx={{ width: '200px' }}
                        value={category}
                        onChange={(e) => {
                            setKeyCategory(e.target.value);
                        }
                        }
                    >
                        <option key={0} value={'all'}>
                            Select Category
                        </option>
                        {
                            categories && categories.map(cat => {
                                return (<option key={cat.id} value={cat.id}>
                                    {cat && toTitleCase(cat.label || "")}
                                </option>)
                            })
                        }
                    </TextField>
                    {LoggedInUser?.assigned_permissions.includes('key_create') && <KeyExcelButton category={category} />}
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
                        {LoggedInUser?.assigned_permissions.includes("key_create") && <MenuItem
                            onClick={() => {
                                setkey(undefined)
                                setAnchorEl(null)
                                setDialog('CreateOrEditKeyDialog')
                            }}

                        > Add New</MenuItem>}

                        {LoggedInUser?.assigned_permissions.includes('key_edit') && <MenuItem

                            onClick={() => {
                                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                                    alert("select some keys")
                                }
                                else {
                                    setDialog('AssignKeysDialog')
                                    setkey(undefined)
                                    setFlag(1)
                                }
                                setAnchorEl(null)
                            }}
                        > Assign Users</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('key_edit') && <MenuItem

                            onClick={() => {
                                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                                    alert("select some keys")
                                }
                                else {
                                    setDialog('AssignKeysDialog')
                                    setkey(undefined)
                                    setFlag(0)
                                }
                                setAnchorEl(null)
                            }}
                        > Remove Users</MenuItem>}

                        {LoggedInUser?.assigned_permissions.includes('key_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export All</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('key_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export Selected</MenuItem>}

                    </Menu >
                    <CreateOrEditKeyDialog dialog={dialog} setDialog={setDialog} keyitm={key} />
                </Stack>

                {<AssignKeysDialog dialog={dialog} setDialog={setDialog} flag={flag} keys={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
            </Stack >
            {key && <DeleteKeyDialog dialog={dialog} setDialog={setDialog} item={key} />}

            {/* table */}
            <MaterialReactTable table={table} />
        </>

    )

}

