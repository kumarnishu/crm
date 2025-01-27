import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { Button, CircularProgress, Fade, LinearProgress, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState,  MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { DownloadFile } from '../../utils/DownloadFile'
import { queryClient } from '../../main'
import { currentYear, getNextMonday, getPrevMonday, nextMonth, nextYear, previousMonth, previousYear } from '../../utils/datesHelper'
import { toTitleCase } from '../../utils/TitleCase'
import ViewChecklistBoxRemarksDialog from '../../components/dialogs/checklists/ViewChecklistBoxRemarksDialog'
import ViewChecklistRemarksDialog from '../../components/dialogs/checklists/ViewChecklistRemarksDialog'
import ExportToExcel from '../../utils/ExportToExcel'
import { UserService } from '../../services/UserServices'
import { ChecklistService } from '../../services/ChecklistService'
import { GetChecklistBoxDto, GetChecklistDto, GetChecklistTopBarDto } from '../../dtos/ChecklistDto'
import { DropDownDto } from '../../dtos/DropDownDto'
import { CreateChecklistFromExcelDto } from '../../dtos/ChecklistDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'



function ChecklistPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [users, setUsers] = useState<DropDownDto[]>([])
  const [stage, setStage] = useState('open')
  const [checklist, setChecklist] = useState<GetChecklistDto>()
  const [checklists, setChecklists] = useState<GetChecklistDto[]>([])
  const [checklistBox, setChecklistBox] = useState<GetChecklistBoxDto>()
  const [userId, setUserId] = useState<string>('all')
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const [categoriesData, setCategoriesData] = useState<GetChecklistTopBarDto>()
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  
  const { data: categorydata, isSuccess: categorySuccess, isLoading: isScoreLoading } = useQuery<AxiosResponse<GetChecklistTopBarDto>, BackendError>(["checklists_top_bar", userId], async () => new ChecklistService().GetChecklistTopBarDetails(userId || "all"))
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const [dialog, setDialog] = useState<string | undefined>()
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  let previous_date = new Date()
  let day = previous_date.getDate() - 1
  previous_date.setDate(day)
  previous_date.setHours(0, 0, 0, 0)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'checklist_view', show_assigned_only: true }))
  const { data, isLoading } = useQuery<AxiosResponse<GetChecklistDto[]>, BackendError>(["checklists", userId, stage], async () => new ChecklistService().GetChecklists({ id: userId, stage: stage }))
  const { mutate: changedate } = useMutation
    <AxiosResponse<any>, BackendError, { id: string, next_date: string }>
    (new ChecklistService().ChangeChecklistNextDate, {
      onSuccess: () => {
        queryClient.invalidateQueries('checklists')
      }
    })


  useEffect(() => {
    if (LoggedInUser?.assigned_users && LoggedInUser.assigned_users.length == 0) {
      setUserId(LoggedInUser._id)
    }
  }, [LoggedInUser])

  useEffect(() => {
    if (categorySuccess && categorydata)
      setCategoriesData(categorydata.data)
  }, [categorySuccess])

  const columns = useMemo<MRT_ColumnDef<GetChecklistDto>[]>(
    //column definitions...
    () => checklists && [
      {
        accessorKey: 'serial_no',
        header: 'Serial No',
        enableColumnActions: false,
        enableSorting: false,
        enableGrouping: false,
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
      },
      {
        accessorKey: 'last_checked_box',
        header: 'Stage',
        enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        Cell: (cell) => <Tooltip title={cell.row.original.last_checked_box ? cell.row.original.last_checked_box.last_remark : ""}>
          <Button onClick={() => {
            setChecklist(cell.row.original)
            setDialog('ViewChecklistRemarksDialog')
          }} size="small" sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0, p: 0.5, fontSize: 9 }} color={cell.row.original.last_checked_box?.stage != 'done' ? (cell.row.original.last_checked_box?.stage == 'pending' ? "warning" : 'error') : 'success'} variant='contained'>{cell.row.original.last_checked_box ? toTitleCase(cell.row.original.last_checked_box.stage) : "Open"}</Button>
        </Tooltip>
      },
      {
        accessorKey: 'group_title',
        header: ' Group Title',
        Cell: (cell) => <>{cell.row.original.group_title || ""}</>,
        enableColumnActions: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'work_title',
        header: ' Work Title',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={checklists.map((item) => { return item.work_title || "" })} />,
        Footer: "Score",
        AggregatedCell: (cell) => <h4 style={{
          textAlign: 'left', fontSize: '1.1em', width: '100%', wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal'
        }} title={cell.row.original.group_title && cell.row.original.group_title.toUpperCase()}>{cell.row.original.group_title && cell.row.original.group_title.toUpperCase()}</h4>,
        Cell: (cell) => <span title={cell.row.original.work_title} >
          {cell.row.original.link && cell.row.original.link != "" ?
            <a style={{ fontSize: '1.1em', fontWeight: '400', textDecoration: 'none' }} target='blank' href={cell.row.original.link}><pre>{cell.row.original.work_title}</pre></a>
            :
            <pre style={{ fontSize: '1.1em', fontWeight: '400', textDecoration: 'none' }}>
              {cell.row.original.work_title}
            </pre>
          }
        </span>
      },


      {
        accessorKey: 'last_10_boxes',
        header: 'Filtered Dates',
        enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        filterFn: (row, columnId, filterValue) => {
          console.log(columnId)
          if (!Array.isArray(row.original.last_10_boxes)) return false;
          return row.original.last_10_boxes.some((box) => {
            if (row.original.frequency == 'daily')
              return String(new Date(box.date).getDate()).toLowerCase() == filterValue
            else if (row.original.frequency == 'weekly')
              return String(new Date(box.date).getDate()).toLowerCase() == filterValue
            else if (row.original.frequency == 'monthly')
              return String(monthNames[new Date(box.date).getMonth()]).toLowerCase() == filterValue
            else
              return String(new Date(box.date).getFullYear()).toLowerCase() == filterValue
          }
          );
        },
        Cell: (cell) => <>
          <Stack direction="row" className="scrollable-stack" sx={{ height: '20px' }}>
            {cell.row.original && cell.row.original.last_10_boxes.map((b) => (
              <>
                {
                  cell.row.original.frequency == 'daily' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                    <Button
                      sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0.3, pl: 1 }}
                      onClick={() => {
                        if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) > new Date(previous_date)) {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }
                      }}
                      size="small"
                      disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) > new Date()}
                      variant="contained"
                      color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                    >
                      {new Date(b.date).getDate()}
                    </Button>
                  </Tooltip>
                }
                {
                  cell.row.original.frequency == 'weekly' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                    <Button
                      sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0.3, pl: 1 }}
                      onClick={() => {
                        if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) < new Date(getNextMonday()) && new Date(new Date(b.date).setHours(0, 0, 0, 0)) >= new Date(getPrevMonday())) {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }
                      }}
                      size="small"
                      disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) >= new Date(getNextMonday())}
                      variant="contained"
                      color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                    >
                      {new Date(b.date).getDate()}
                    </Button>
                  </Tooltip>
                }
                {
                  cell.row.original.frequency == 'monthly' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                    <Button
                      sx={{ borderRadius: 4, maxHeight: '15px', minWidth: '10px', m: 0.3 }}
                      onClick={() => {
                        if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) < nextMonth && new Date(new Date(b.date).setHours(0, 0, 0, 0)) > previousMonth) {

                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }
                      }}
                      size="small"
                      disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) >= nextMonth}
                      variant="contained"
                      color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                    >
                      {monthNames[new Date(b.date).getMonth()]}
                    </Button>
                  </Tooltip>
                }
                {
                  cell.row.original.frequency == 'yearly' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                    <Button
                      sx={{ borderRadius: 4, maxHeight: '15px', minWidth: '10px', m: 0.3, }}
                      onClick={() => {
                        if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) > previousYear && new Date(new Date(b.date).setHours(0, 0, 0, 0)) < nextYear) {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }
                      }}
                      size="small"
                      disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) > currentYear}
                      variant="contained"
                      color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                    >
                      {new Date(b.date).getFullYear()}
                    </Button>
                  </Tooltip>
                }
              </>
            ))}
          </Stack>
        </>
      },


      {
        accessorKey: 'last_remark',
        header: ' Last Remark',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={checklists.map((item) => { return item.last_remark || "" })} />,
        Cell: (cell) => cell.row.original.last_remark && cell.row.original.last_remark.includes("\n") ? <pre title={cell.row.original.last_remark || ""}>{cell.row.original.last_remark || ""}</pre> : <p style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal'
        }} title={cell.row.original.last_remark || ""}>{cell.row.original.last_remark || ""}</p>
      },
      {
        accessorKey: 'category.label',
        header: ' Category',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={checklists.map((item) => { return item.category.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.label : ""}</>
      },
      {
        accessorKey: 'assigned_usersnames',
        header: 'Responsible',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={checklists.map((item) => { return item.assigned_usersnames || "" })} />,
      },
      {
        accessorKey: 'frequency',
        header: ' Frequency',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={checklists.map((item) => { return item.frequency || "" })} />,
        Cell: (cell) => <>{cell.row.original.frequency ? cell.row.original.frequency : ""}</>
      },


      {
        accessorKey: 'next_date',
        header: 'Next Check Date',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={checklists.map((item) => { return moment(new Date(item.next_date)).format("YYYY-MM-DD") || "" })} />,
        Cell: (cell) => <>
          < input
            type="date"
            id="remind_date"
            disabled={!LoggedInUser?.assigned_permissions.includes('checklist_edit')}
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
        accessorKey: 'filtered_score',
        header: 'Filtered Score',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        Cell: (cell) => <>{cell.row.original.filtered_score || 0}</>,
        Footer: ({ table }) => <b>{parseFloat(Number(table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.filtered_score) }, 0) / table.getFilteredRowModel().rows.length).toFixed(2))}</b>
      },
      {
        accessorKey: 'today_score',
        header: 'Today Score',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        Cell: (cell) => <>{cell.row.original.today_score || 0}</>,
        Footer: ({ table }) => <b>{parseFloat(Number(table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.today_score) }, 0) / table.getFilteredRowModel().rows.length).toFixed(2))}</b>
      },
      {
        accessorKey: 'expected_number',
        header: 'Expected No',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
      },
      {
        accessorKey: 'photo',
        header: 'Photo',
        enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        Cell: (cell) => <span onDoubleClick={() => {
          if (cell.row.original.photo && cell.row.original.photo) {
            DownloadFile(cell.row.original.photo, 'photo')
          }
        }}>
          {cell.row.original.photo && cell.row.original.photo ? < img height="20" width="55" src={cell.row.original.photo && cell.row.original.photo} alt="visiting card" /> : "na"}</span>
      },
    ],
    [checklists, data],
  );

  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: checklists, //10,000 rows       
    enableColumnResizing: true,
    positionToolbarAlertBanner: 'none',
    enableColumnVirtualization: true,
    enableStickyFooter: true,
    enableDensityToggle: false, initialState: { sorting: [{ id: "group_title", desc: false }], density: 'compact', grouping: ['group_title'], showGlobalFilter: true, expanded: true, pagination: { pageIndex: 0, pageSize: 1000 } },
    enableGrouping: true,
    enableRowSelection: true,
    enablePagination: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '85vh' }
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
    renderTopToolbarCustomActions: () => (
      < >
        {isScoreLoading ? <CircularProgress /> :
          <Typography sx={{ overflow: 'hidden', fontSize: '1.1em', fontWeight: 'bold', textAlign: 'center' }} >Checklists : {`${checklists.length} - `} LM:{`${categoriesData?.lastmonthscore} - `}CM: {categoriesData?.currentmonthscore}</Typography>}
        <Stack justifyContent={'center'} direction={'row'} gap={1} sx={{ backgroundColor: 'white' }} >
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
              value={stage}

              required
              id="Stage"
              label="Checklist Stage"
              fullWidth
            >
              {
                ['all', 'open', 'pending', 'done'].map((st, index) => {

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
              required
              id="checklist_owners"
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

        </Stack>

      </>
    ),
    muiTableBodyRowProps: (row) => ({
      sx: {
        backgroundColor: row.row.getIsGrouped() ? 'lightgrey' : 'inherit', // Light blue for grouped rows
        visibility: row.row.getIsGrouped() && row.row.original.work_title == "" ? 'none' : 'block',
        fontWeight: row.row.getIsGrouped() ? 'bold' : 'normal', // Bold text for grouped rows
      },
    }),
    muiTableBodyCellProps: (cell) => ({
      sx: {
        border: '1px solid lightgrey;',
        borderBottom: cell.row.original.group_title != "" ? 'none' : '1px solid lightgrey;',
      },
    }),
    muiPaginationProps: {
      rowsPerPageOptions: [100, 200, 500, 1000, 2000, 5000, 7000, 10000],
      shape: 'rounded',
      variant: 'outlined',
    },

    enableRowVirtualization: true,
     //optional
    //optionally customize the column virtualizer
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      columnVisibility: { ...columnVisibility, 'group_title': false, "mrt-row-expand": false, },
      columnSizing: columnSizing
    },
  });

  useEffect(() => {
    if (isUsersSuccess)
      setUsers(usersData?.data)
  }, [users, isUsersSuccess, usersData])

  useEffect(() => {
    if (data) {
      setChecklists(data.data)
    }
  }, [data])
  

  //load state from local storage
  useEffect(() => {
    const columnVisibility = localStorage.getItem(
      'mrt_columnVisibility_ChecklistPage',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_ChecklistPage',
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
      'mrt_columnVisibility_ChecklistPage',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_ChecklistPage', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_ChecklistPage', JSON.stringify(columnSizing));
  }, [columnSizing]);

  return (
    <>
      {isLoading && <LinearProgress />}
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
        {LoggedInUser?.assigned_permissions.includes('checklist_export') && < MenuItem onClick={() => {

          let data: CreateChecklistFromExcelDto[] = []
          data = table.getRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              serial_no: row.original.serial_no,
              work_title: row.original.work_title,
              group_title: row.original.group_title,
              category: row.original.category.label,
              condition: row.original.condition,
              expected_number: row.original.expected_number,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.label }).toString(),
              status: ""
            }
          })
          ExportToExcel(data, "Checklists Data")
        }
        }
        >Export All</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('checklist_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
          let data: CreateChecklistFromExcelDto[] = []
          data = table.getSelectedRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              serial_no: row.original.serial_no,
              work_title: row.original.work_title,
              group_title: row.original.group_title,
              category: row.original.category.label,
              condition: row.original.condition,
              expected_number: row.original.expected_number,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.label }).toString(),
              status: ""
            }
          }
          )
          ExportToExcel(data, "Checklists Data")
        }}

        >Export Selected</MenuItem>}
      </Menu>
      <MaterialReactTable table={table} />
      {checklist && checklistBox && <ViewChecklistBoxRemarksDialog is_admin={false} dialog={dialog} setDialog={setDialog} checklist={checklist} checklist_box={checklistBox} />}
      {checklist && <ViewChecklistRemarksDialog dialog={dialog} setDialog={setDialog} checklist={checklist} />}
    </>
  )
}

export default ChecklistPage