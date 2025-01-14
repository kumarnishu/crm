import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { Box, Button, Fade, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { toTitleCase } from '../../utils/TitleCase'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import PopUp from '../../components/popup/PopUp'
import { Delete, Edit, FilterAltOff, Fullscreen, FullscreenExit } from '@mui/icons-material'
import DBPagination from '../../components/pagination/DBpagination'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import CreateOrEditSalesmanAttendanceDialog from '../../components/dialogs/sales/CreateOrEditSalesmanAttendanceDialog'
import DeleteVisitSalesManAttendanceDialog from '../../components/dialogs/sales/DeleteSalesManAttendanceDialog'
import { HandleNumbers } from '../../utils/IsDecimal'
import { UserService } from '../../services/UserServices'
import { SalesService } from '../../services/SalesServices'
import { GetSalesAttendanceDto } from '../../dtos/response/AttendanceDto'
import { DropDownDto } from '../../dtos/response/DropDownDto'


function SalesmanAttendancePage() {
    const { user: LoggedInUser } = useContext(UserContext)
    const [users, setUsers] = useState<DropDownDto[]>([])
    const [attendance, setAttendance] = useState<GetSalesAttendanceDto>()
    const [attendances, setAttendances] = useState<GetSalesAttendanceDto[]>([])
    const [paginationData, setPaginationData] = useState({ limit: 1000, page: 1, total: 1 });
    const [userId, setUserId] = useState<string>('all')
    const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
        start_date: moment(new Date().setDate(new Date().getDate() - 10)).format("YYYY-MM-DD")
        , end_date: moment(new Date().setDate(new Date().getDate())).format("YYYY-MM-DD")
    })

    const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})

    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const [dialog, setDialog] = useState<string | undefined>()
    let previous_date = new Date()
    let day = previous_date.getDate() - 4
    previous_date.setDate(day)
    previous_date.setHours(0, 0, 0, 0)
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'sales_menu', show_assigned_only: false }))
    const { data, isLoading, refetch } = useQuery<AxiosResponse<{ result: GetSalesAttendanceDto[], page: number, total: number, limit: number }>, BackendError>(["attendances", userId, dates?.start_date, dates?.end_date], async () => new SalesService().GetSalesmanAttendances({ limit: paginationData?.limit, page: paginationData?.page, id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const columns = useMemo<MRT_ColumnDef<GetSalesAttendanceDto>[]>(
        //column definitions...
        () => attendances && [
            {
                accessorKey: 'actions',
                header: '',

                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row" spacing={1}>
                            {LoggedInUser?.is_admin && LoggedInUser?.assigned_permissions.includes('salesman_attendance_delete') && <Tooltip title="delete">
                                <IconButton color="error"
                                    onClick={() => {

                                        setDialog('DeleteVisitSalesManAttendanceDialog')
                                        setAttendance(cell.row.original)


                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>}
                            {LoggedInUser?.assigned_permissions.includes('salesman_attendance_edit') &&
                                <Tooltip title="Edit">
                                    <IconButton
                                        disabled={!LoggedInUser.is_admin && new Date(cell.row.original.date) < previous_date}
                                        onClick={() => {

                                            setDialog('CreateOrEditSalesmanAttendanceDialog')
                                            setAttendance(cell.row.original)

                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                </Tooltip>}

                        </Stack>}
                />
            },

            {
                accessorKey: 'date',
                header: ' Date',
                Cell: (cell) => <span >{cell.row.original.date && moment(cell.row.original.date).format("DD/MM/YYYY")}</span>

            },
            {
                accessorKey: 'employee.label',
                header: ' Employee',
                Cell: (cell) => <span title={cell.row.original.remark && cell.row.original.remark}>{cell.row.original.employee && cell.row.original.employee.label}</span>
            },
            {
                accessorKey: 'attendance',
                header: ' Attendance',
                aggregationFn: 'count',

            },
            {
                accessorKey: 'sunday_working',
                header: ' Sunday Wokring',
                aggregationFn: 'count',

            },
            {
                accessorKey: 'station.value',
                header: ' Station',
                aggregationFn: 'count'

            },
            {
                accessorKey: 'in_time',
                header: ' Work Time',
                aggregationFn: 'count',

                Cell: (cell) => <span >{cell.row.original.in_time + " - " + cell.row.original.end_time}</span>
            },
            {
                accessorKey: 'new_visit',
                header: ' New Visit',
                aggregationFn: 'sum',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

            },
            {
                accessorKey: 'old_visit',
                header: ' Old Visit',
                aggregationFn: 'sum',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
            },
            {
                accessorKey: 'remark',
                header: ' Remarks'
            },

            {
                accessorKey: 'updated_at',
                header: 'Last Updated At',

                Cell: (cell) => <>{cell.row.original.updated_at}</>
            },
            {
                accessorKey: 'updated_by.label',
                header: 'Last Updated By',

                Cell: (cell) => <>{cell.row.original.updated_by.label}</>
            },
        ],
        [attendances, data],
    );

    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: attendances, //10,000 rows       
        enableColumnResizing: true,
        enableGrouping: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),
        muiTableContainerProps: (table) => ({
            sx: { maxHeight: table.table.getState().isFullScreen ? 'auto' : '64vh' }
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
                color: 'white',

            },
        }),
        renderTopToolbarCustomActions: ({ table }) => (
            <Box minWidth={'100vw'} >
                <Stack sx={{ p: 1 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography variant='h6'>Salesman Daily Visit New/old/Time - Chanchal</Typography>
                    <Stack
                        pt={1}
                        direction="row"
                        alignItems={'center'}
                        justifyContent="right">

                        <Stack justifyContent={'right'} direction={'row'} gap={1}>
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
                                type="date"
                                id="end_date"
                                size="small"
                                label="End Date"
                                value={dates.end_date}

                                fullWidth
                                onChange={(e) => {
                                    setDates({
                                        ...dates,
                                        end_date: moment(e.target.value).format("YYYY-MM-DD")
                                    })
                                }}
                            />
                            {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 &&
                                < TextField
                                    variant='filled'
                                    select
                                    size="small"
                                    SelectProps={{
                                        native: true,
                                    }}
                                    onChange={(e) => {
                                        setUserId(e.target.value)
                                    }}
                                    required
                                    id="attendance_owners"
                                    label="Person"
                                    fullWidth
                                >
                                    <option key={'00'} value={'all'}>All
                                    </option>
                                    {
                                        users.map((user, index) => {

                                            return (<option key={index} value={user.id}>
                                                {toTitleCase(user.label)}
                                            </option>)

                                        })
                                    }
                                </TextField>}
                            {LoggedInUser?._id === LoggedInUser?.created_by.id && LoggedInUser?.assigned_permissions.includes('salesman_attendance_delete') &&
                                <Button variant='contained' color='inherit' size='large'
                                    onClick={() => {
                                        let data: any[] = [];
                                        data = table.getSelectedRowModel().rows
                                        if (data.length == 0)
                                            alert("select some attendances")
                                        else
                                            setDialog('DeleteVisitSalesManAttendanceDialog')
                                    }}
                                >
                                    <Delete sx={{ width: 15, height: 15 }} />
                                </Button>}

                            <Tooltip title="Toogle Filter">
                                <Button size="small" color="inherit" variant='contained'
                                    onClick={() => {
                                        table.resetColumnFilters(true)
                                    }
                                    }
                                >
                                    <FilterAltOff />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Toogle FullScreen" >
                                <Button size="small" color="inherit" variant='contained'
                                    onClick={() => table.setIsFullScreen(!table.getState().isFullScreen)
                                    }
                                >
                                    {table.getState().isFullScreen ? <FullscreenExit /> : <Fullscreen />}
                                </Button>
                            </Tooltip>
                            <Tooltip title="Menu" sx={{ pl: 1 }}>
                                <Button size="small" color="inherit" variant='contained'
                                    onClick={(e) => setAnchorEl(e.currentTarget)
                                    }
                                >
                                    <MenuIcon />
                                    <Typography pl={1}> {`Menu `}</Typography>
                                </Button>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Stack>
            </Box >
        ),
        renderBottomToolbarCustomActions: () => (
            <DBPagination paginationData={paginationData} refetch={refetch} setPaginationData={setPaginationData} />

        ),
        muiTableBodyCellProps: () => ({
            sx: {
                border: '1px solid lightgrey;',
            },
        }),
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: new Date(row.original.date).getDay() == 0 ? 'yellow' : ""
            },
        }),
        positionToolbarAlertBanner: 'none',
        enableToolbarInternalActions: false,
       enableDensityToggle: false, initialState: { density: 'compact' },
        enableRowSelection: true,
        enableRowNumbers: true,
        enableColumnPinning: true,
        onSortingChange: setSorting,
        enableTableFooter: true,
        enableRowVirtualization: true,
        onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //
        columnVirtualizerOptions: { overscan: 2 },
        onColumnSizingChange: setColumnSizing, state: {
            isLoading: isLoading,
            columnVisibility,

            sorting,
            columnSizing: columnSizing
        },
        enableBottomToolbar: true,
        enableGlobalFilter: false,
        enablePagination: false,
        manualPagination: true
    });



    useEffect(() => {
        if (isUsersSuccess)
            setUsers(usersData?.data)
    }, [isUsersSuccess, usersData])

    useEffect(() => {
        if (data) {
            setAttendances(data.data.result)
            setPaginationData({
                ...paginationData,
                page: data.data.page,
                limit: data.data.limit,
                total: data.data.total
            })
        }
    }, [data])
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

                {LoggedInUser?.assigned_permissions.includes('salesman_attendance_create') && <MenuItem

                    onClick={() => {
                        setDialog('CreateOrEditSalesmanAttendanceDialog')
                        setAttendance(undefined)
                        setAnchorEl(null)
                    }}
                > Add New</MenuItem>}


                {LoggedInUser?.assigned_permissions.includes('salesman_attendance_export') && < MenuItem onClick={() => {

                    let data = table.getRowModel().rows;
                    ExportToExcel(data, "Attendances Data")
                }
                }
                >Export All</MenuItem>}
                {LoggedInUser?.assigned_permissions.includes('salesman_attendance_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
                    let data = table.getSelectedRowModel().rows
                    ExportToExcel(data, "Attendances Data")
                }}

                >Export Selected</MenuItem>}
            </Menu>
            <MaterialReactTable table={table} />
            <CreateOrEditSalesmanAttendanceDialog dialog={dialog} setDialog={setDialog} attendance={attendance} />
            {attendance && <DeleteVisitSalesManAttendanceDialog dialog={dialog} setDialog={setDialog} attendance={attendance} />}
        </>
    )
}

export default SalesmanAttendancePage