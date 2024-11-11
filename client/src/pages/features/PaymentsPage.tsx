import { useContext, useEffect, useMemo, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { Button, Fade, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import { GetUsers } from '../../services/UserServices'
import moment from 'moment'
import { toTitleCase } from '../../utils/TitleCase'
import { GetPaymentDto, GetPaymentsFromExcelDto, GetUserDto } from '../../dtos'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { PaymentsChoiceActions, ChoiceContext } from '../../contexts/dialogContext'
import PopUp from '../../components/popup/PopUp'
import { Delete, Edit, FilterAltOff, Fullscreen, FullscreenExit } from '@mui/icons-material'
import DBPagination from '../../components/pagination/DBpagination'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { queryClient } from '../../main'
import { ChangePaymentsDueDate, ChangePaymentsNextDate, GetPaymentss, GetPaymentsTopBarDetails } from '../../services/PaymentsService'
import { PaymentsExcelButtons } from '../../components/buttons/PaymentsExcelButtons'
import AssignPaymentsDialog from '../../components/dialogs/payments/AssignPaymentsDialog'
import BulkDeletePaymentsDialog from '../../components/dialogs/payments/BulkDeletePaymentsDialog'


function PaymentsPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [users, setUsers] = useState<GetUserDto[]>([])
  const [payment, setPayment] = useState<GetPaymentDto>()
  const [payments, setPayments] = useState<GetPaymentDto[]>([])
  const [paginationData, setPaginationData] = useState({ limit: 1000, page: 1, total: 1 });
  const [flag, setFlag] = useState(1);
  const [stage, setStage] = useState('all')
  const [categoriesData, setCategoriesData] = useState<{ category: string, count: number }[]>([])
  const [userId, setUserId] = useState<string>()
  const { data: categorydata, isSuccess: categorySuccess } = useQuery<AxiosResponse<{ category: string, count: number }[]>, BackendError>("payments", GetPaymentsTopBarDetails)
  const { setChoice } = useContext(ChoiceContext)
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', permission: 'payments_view', show_assigned_only: false }))
  const { data, isSuccess, isLoading, refetch } = useQuery<AxiosResponse<{ result: GetPaymentDto[], page: number, total: number, limit: number }>, BackendError>(["payments", userId, stage], async () => GetPaymentss({ limit: paginationData?.limit, page: paginationData?.page, id: userId, stage: stage }))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { mutate: changedate } = useMutation
    <AxiosResponse<any>, BackendError, { id: string, next_date: string }>
    (ChangePaymentsNextDate, {
      onSuccess: () => {
        queryClient.invalidateQueries('payments')
      }
    })
  const { mutate: changeDuedate } = useMutation
    <AxiosResponse<any>, BackendError, { id: string, due_date: string }>
    (ChangePaymentsDueDate, {
      onSuccess: () => {
        queryClient.invalidateQueries('payments')
      }
    })


  const columns = useMemo<MRT_ColumnDef<GetPaymentDto>[]>(
    //column definitions...
    () => payments && [
      {
        accessorKey: 'actions',
        header: '',
        maxSize: 50,
        size: 120,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>
              {LoggedInUser?.assigned_permissions.includes('payments_delete') && <Tooltip title="delete">
                <IconButton color="error"

                  onClick={() => {

                    setChoice({ type: PaymentsChoiceActions.delete_payment })
                    setPayment(cell.row.original)


                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('payments_edit') &&
                <Tooltip title="Edit">
                  <IconButton

                    onClick={() => {

                      setChoice({ type: PaymentsChoiceActions.create_or_edit_payment })
                      setPayment(cell.row.original)

                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}

            </Stack>}
        />
      },
      {
        accessorKey: 'payment_title',
        header: ' Payment Title',
        size: 300,
        Cell: (cell) => <>{!cell.row.original.link ? <Tooltip title={cell.row.original.payment_description}><span>{cell.row.original.payment_title ? cell.row.original.payment_title : ""}</span></Tooltip> :
          <Tooltip title={cell.row.original.payment_description}>
            <a style={{ fontSize: 11, fontWeight: 'bold', textDecoration: 'none' }} target='blank' href={cell.row.original.link}>{cell.row.original.payment_title}</a>
          </Tooltip>}
        </>
      },
      {
        accessorKey: 'payment_description',
        header: ' Payment Description',
        size: 300,
        Cell: (cell) =>  <Tooltip title={cell.row.original.payment_description}><span>{cell.row.original.payment_description ? cell.row.original.payment_description : ""}</span></Tooltip>
      },
      {
        accessorKey: 'assigned_users.value',
        header: 'Responsible',
        size: 190,
        filter: 'custom',
        enableColumnFilter: true,
        Cell: (cell) => <>{cell.row.original.assigned_users.map((user) => { return user.value }).toString() || ""}</>,
        filterFn: (row, columnId, filterValue) => {
          console.log(columnId)
          if (!Array.isArray(row.original.assigned_users)) return false;
          return row.original.assigned_users.some((user) =>
            user.value.toLowerCase().includes(filterValue.toLowerCase())
          );
        },
      },
      {
        accessorKey: 'category.value',
        header: ' Category',
        size: 120,
        Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.label : ""}</>
      },
      {
        accessorKey: 'frequency',
        header: ' Frequency',
        size: 120,
        Cell: (cell) => <>{cell.row.original.frequency ? cell.row.original.frequency : ""}</>
      },
      {
        accessorKey: 'due_date',
        header: 'Due Date',
        size: 120,
        Cell: (cell) => <>
          < input
            type="date"
            id="remind_date"
            disabled={!LoggedInUser?.assigned_permissions.includes('payments_edit')}
            value={moment(new Date(cell.row.original.due_date)).format("YYYY-MM-DD")}
            onChange={(e) => {
              if (e.target.value) {
                changeDuedate({ id: cell.row.original._id, due_date: e.target.value })
              }
            }}
          />

        </>
      },
      {
        accessorKey: 'next_date',
        header: 'Next Check Date',
        size: 120,
        Cell: (cell) => <>
          < input
            type="date"
            id="remind_date"
            disabled={!LoggedInUser?.assigned_permissions.includes('payments_edit')}
            value={moment(new Date(cell.row.original.next_date)).format("YYYY-MM-DD")}
            onChange={(e) => {
              if (e.target.value) {
                changedate({ id: cell.row.original._id, next_date: e.target.value })
              }
            }}
          />

        </>
      },
      {
        accessorKey: 'updated_by',
        header: 'Last Updated By',
        size: 100,
        Cell: (cell) => <>{cell.row.original.updated_by ? cell.row.original.updated_by.value : ""}</>
      },
    ],
    [payments, data],
  );

  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: payments, //10,000 rows       
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '65vh' }
    }),
    muiTableHeadRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
        border: '1px solid lightgrey;',
      },
    }),
    renderTopToolbarCustomActions: ({ table }) => (

      <Stack
        sx={{ width: '100%' }}
        pt={1}
        direction="row"
        alignItems={'center'}
        justifyContent="space-between">
        <Stack direction={'row'} gap={1} sx={{ maxWidth: '70vw', background: 'whitesmoke', p: 1, borderRadius: 5 }} className='scrollable-stack'>
          {categoriesData.map((category, index) => (
            <Stack style={{ minWidth: '100px', overflowY: 'hidden' }}
              key={index}
            >
              <span key={category.category} style={{ paddingLeft: '5px', fontSize: '13px' }}> {category.count} : {toTitleCase(category.category)} </span>
            </Stack>
          ))}
        </Stack>
        <Stack justifyContent={'right'} direction={'row'} gap={1}>
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
      </Stack>
    ),
    renderBottomToolbarCustomActions: () => (
      <DBPagination paginationData={paginationData} refetch={refetch} setPaginationData={setPaginationData} />

    ),
    muiTableBodyCellProps: () => ({
      sx: {
        border: '1px solid lightgrey;',
      },
    }),
    positionToolbarAlertBanner: 'none',
    enableToolbarInternalActions: false,
    initialState: { density: 'compact' },
    enableRowSelection: true,
    enableRowNumbers: true,
    enableColumnPinning: true,
    onSortingChange: setSorting,
    enableTableFooter: true,
    enableRowVirtualization: true,
    state: { sorting, isLoading: isLoading, showAlertBanner: false },
    enableBottomToolbar: true,
    enableGlobalFilter: false,
    enablePagination: false,
    manualPagination: true
  });

  useEffect(() => {
    if (categorySuccess && categorydata)
      setCategoriesData(categorydata.data)
  }, [categorySuccess])

  useEffect(() => {
    if (isUsersSuccess)
      setUsers(usersData?.data)
  }, [users, isUsersSuccess, usersData])

  useEffect(() => {
    if (data && isSuccess) {
      setPayments(data.data.result)
      setPaginationData({
        ...paginationData,
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total
      })
    }
  }, [isSuccess,data])

  console.log(payment)
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

        {LoggedInUser?.assigned_permissions.includes('payments_create') && <MenuItem

          onClick={() => {
            setChoice({ type: PaymentsChoiceActions.create_or_edit_payment })
            setPayment(undefined)
            setAnchorEl(null)
          }}
        > Add New</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('payments_edit') && <MenuItem

          onClick={() => {
            if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
              alert("select some payments")
            }
            else {
              setChoice({ type: PaymentsChoiceActions.assign_payment_to_users })
              setPayment(undefined)
              setFlag(1)
            }
            setAnchorEl(null)
          }}
        > Assign Users</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('payments_edit') && <MenuItem

          onClick={() => {
            if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
              alert("select some payments")
            }
            else {
              setChoice({ type: PaymentsChoiceActions.assign_payment_to_users })
              setPayment(undefined)
              setFlag(0)
            }
            setAnchorEl(null)
          }}
        > Remove Users</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('payments_export') && < MenuItem onClick={() => {

          let data: GetPaymentsFromExcelDto[] = []
          data = table.getRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              payment_title: row.original.payment_title,
              payment_description: row.original.payment_description,
              category: row.original.category.value,
              duedate: row.original.due_date,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.value }).toString(),
              status: ""
            }
          })
          ExportToExcel(data, "payments Data")
        }
        }
        >Export All</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('payments_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
          let data: GetPaymentsFromExcelDto[] = []
          data = table.getSelectedRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              payment_title: row.original.payment_title,
              payment_description: row.original.payment_description,
              category: row.original.category.value,
              duedate: row.original.due_date,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.value }).toString(),
              status: ""
            }
          }
          )
          ExportToExcel(data, "payments Data")
        }}

        >Export Selected</MenuItem>}
      </Menu>
      <Stack sx={{ p: 2 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>
        <Typography variant='h6'>Payments</Typography>
        <Stack direction='row' gap={2}>
          {LoggedInUser?._id === LoggedInUser?.created_by.id && LoggedInUser?.assigned_permissions.includes('payments_delete') && <Tooltip title="Delete Selected">
            <Button variant='contained' color='error'

              onClick={() => {
                let data: any[] = [];
                data = table.getSelectedRowModel().rows
                if (data.length == 0)
                  alert("select some payments")
                else
                  setChoice({ type: PaymentsChoiceActions.bulk_delete_payment })
              }}
            >
              <Delete />
            </Button>
          </Tooltip>}

          {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 &&
            < TextField
              select
              size="small"
              SelectProps={{
                native: true,
              }}
              onChange={(e) => {
                setStage(e.target.value)
              }}
              focused
              required
              id="Stage"
              label="payment Stage"
              fullWidth
            >
              {
                ['all', 'completed', 'pending'].map((st, index) => {

                  return (<option key={index} value={st}>
                    {toTitleCase(st)}
                  </option>)
                })
              }
            </TextField>}

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
              focused
              required
              id="payment_owners"
              label="Person"
              fullWidth
            >
              <option key={'00'} value={undefined}>
              </option>
              {
                users.map((user, index) => {

                  return (<option key={index} value={user._id}>
                    {user.username}
                  </option>)

                })
              }
            </TextField>}

          {LoggedInUser?.assigned_permissions.includes('payments_create') && <PaymentsExcelButtons />}
        </Stack>
      </Stack>
      <MaterialReactTable table={table} />
      {/* <CreateOrEditCheckListDialog payment={payment} setPayment={setPayment} />
      {payment && <DeleteCheckListDialog payment={payment} />}
      {payment && <CreateOrEditCheckListDialog payment={payment} setPayment={setPayment} />}
      {payment && paymentBox && <ViewpaymentRemarksDialog payment={payment} payment_box={paymentBox} />} */}
     
      {<AssignPaymentsDialog flag={flag} payments={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
      {table.getSelectedRowModel().rows && table.getSelectedRowModel().rows.length > 0 && <BulkDeletePaymentsDialog ids={table.getSelectedRowModel().rows.map((l) => { return l.original._id })} clearIds={() => { table.resetRowSelection() }} />}

    </>
  )
}

export default PaymentsPage