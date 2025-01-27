import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState,  MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { TextField, Typography } from '@mui/material'
import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import moment from 'moment'
import { UserContext } from '../../contexts/userContext'
import { HandleNumbers } from '../../utils/IsDecimal'
import { toTitleCase } from '../../utils/TitleCase'
import { SalesService } from '../../services/SalesServices'
import { UserService } from '../../services/UserServices'
import { DropDownDto } from '../../dtos/DropDownDto'
import { GetSalesAttendancesAuto } from '../../dtos/SalesDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'


export default function SalesmanVisitPageAuto() {

    const { user: LoggedInUser } = useContext(UserContext)
    const [userId, setUserId] = useState<string>('all')
    const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
        start_date: moment(new Date().setDate(new Date().getDate() - 10)).format("YYYY-MM-DD")
        , end_date: moment(new Date().setDate(new Date().getDate())).format("YYYY-MM-DD")
    })
    const [users, setUsers] = useState<DropDownDto[]>([])
    const [reports, setReports] = useState<GetSalesAttendancesAuto[]>([])
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'sales_menu', show_assigned_only: false }))
    const { data, isSuccess, isLoading } = useQuery<AxiosResponse<GetSalesAttendancesAuto[]>, BackendError>(["visits-auto", userId, dates?.start_date, dates?.end_date], async () => new SalesService().GetSalesmanAutoVisitReports({ id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))
    const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
    
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})

    useEffect(() => {
        if (isSuccess) {
            setReports(data.data)
        }
    }, [isSuccess, data])

    useEffect(() => {
        if (isUsersSuccess)
            setUsers(usersData?.data)
    }, [isUsersSuccess, usersData])



    const columns = useMemo<MRT_ColumnDef<GetSalesAttendancesAuto>[]>(
        //column definitions...
        () => reports && [

            {
                accessorKey: 'employee.label',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.employee.label || "" })} />,
                header: 'Employee',

            },

            {
                accessorKey: 'date',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.date || "" })} />,
                header: 'Date',

            },
            {
                accessorKey: 'new_visit',
                filterVariant: 'range',
                filterFn: 'betweenInclusive',
                header: 'New Visits',
                aggregationFn: 'sum',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

            },
            {
                accessorKey: 'old_visit',
                filterVariant: 'range',
                filterFn: 'betweenInclusive',
                header: 'Old Visits',
                aggregationFn: 'sum',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

            },
            {
                accessorKey: 'worktime',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.worktime || "" })} />,
                header: 'Time',

            },

        ],
        [reports, data],
        //end
    );


    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: reports, //10,000 rows       
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
                fontSize: '14px'
            }
        }),
        muiTableContainerProps: (table) => ({
            sx: { height: table.table.getState().isFullScreen ? 'auto' : '65vh' }
        }),
        muiTableHeadRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white'
            },
        }), muiTableHeadCellProps: ({ column }) => ({
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
                fontSize: '13px'
            },
        }),
        muiPaginationProps: {
            rowsPerPageOptions: [70, 200, 500, 1300, 2000],
            shape: 'rounded',
            variant: 'outlined',
        },
        enableDensityToggle: false, initialState: {
            density: 'compact', showGlobalFilter: true, pagination: { pageIndex: 0, pageSize: 2000 }
        },
        enableGrouping: true,
        enableRowSelection: true,
        manualPagination: false,
        enablePagination: true,
        enableRowNumbers: true,
        enableColumnPinning: true,
        enableTableFooter: true,
        enableRowVirtualization: true,
        onColumnVisibilityChange: setColumnVisibility,  //
        columnVirtualizerOptions: { overscan: 2 },
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
            'mrt_columnVisibility_SalesmanVisitPageAuto',
        );
        const columnSizing = localStorage.getItem(
            'mrt_columnSizing_SalesmanVisitPageAuto',
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
            'mrt_columnVisibility_SalesmanVisitPageAuto',
            JSON.stringify(columnVisibility),
        );
    }, [columnVisibility]);




    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_sorting_SalesmanVisitPageAuto', JSON.stringify(sorting));
    }, [sorting]);

    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_columnSizing_SalesmanVisitPageAuto', JSON.stringify(columnSizing));
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
                    Salesman Daily Visit New/old/Time - Auto
                </Typography>
                < Stack direction="row" spacing={2}>
                    < TextField
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
                </Stack >

            </Stack >

            {/* table */}
            <MaterialReactTable table={table} />

        </>

    )

}

