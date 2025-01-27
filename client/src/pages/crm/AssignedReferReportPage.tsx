import { Fade, IconButton, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState,  MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import moment from 'moment'
import PopUp from '../../components/popup/PopUp'
import { BuildOutlined, Comment, Delete, Edit, Share, Upload, Visibility } from '@mui/icons-material'
import { UserContext } from '../../contexts/userContext'
import CreateOrEditRemarkDialog from '../../components/dialogs/crm/CreateOrEditRemarkDialog'
import ViewRemarksDialog from '../../components/dialogs/crm/ViewRemarksDialog'
import { DownloadFile } from '../../utils/DownloadFile'
import BackHandIcon from '@mui/icons-material/BackHand';
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import ReferLeadDialog from '../../components/dialogs/crm/ReferLeadDialog'
import RemoveLeadReferralDialog from '../../components/dialogs/crm/RemoveLeadReferralDialog'
import ConvertLeadToReferDialog from '../../components/dialogs/crm/ConvertLeadToReferDialog'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import CreateOrEditBillDialog from '../../components/dialogs/crm/CreateOrEditBillDialog'
import ViewLeadsBillHistoryDialog from '../../components/dialogs/crm/ViewLeadsBillHistoryDialog'
import CreateOrEditLeadDialog from '../../components/dialogs/crm/CreateOrEditLeadDialog'
import { CrmService } from '../../services/CrmService'
import { GetLeadDto } from '../../dtos/CrmDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'


export default function AssignedReferReportPage() {
  const [leads, setLeads] = useState<GetLeadDto[]>([])
  const [lead, setLead] = useState<GetLeadDto>()
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date(new Date().setDate(1)).setFullYear(2023)).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(30)).format("YYYY-MM-DD")
  })
  const [dialog, setDialog] = useState<string | undefined>()
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetLeadDto[]>, BackendError>(["assign_refer_reports", dates.start_date, dates.end_date], async () => new CrmService().GetAssignedRefers({ start_date: dates.start_date, end_date: dates.end_date }))
  const { user: LoggedInUser } = useContext(UserContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetLeadDto>[]>(
    //column definitions...
    () => leads && [
      {
        accessorKey: 'actions', enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        header: 'Actions',

        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>

              {cell.row.original.referred_party_name && LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="Remove Refrerral">
                  <IconButton color="error"

                    onClick={() => {

                      setDialog('')
                      setLead(cell.row.original)

                    }}
                  >
                    <BackHandIcon />
                  </IconButton>
                </Tooltip>}
              {!cell.row.original.referred_party_name && LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="refer">
                  <IconButton color="primary"

                    onClick={() => {

                      setDialog('CreateOrEditLeadDialog')
                      setLead(cell.row.original)

                    }}
                  >
                    <Share />
                  </IconButton>
                </Tooltip>}

              {!cell.row.original.referred_party_name && LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="convert to refer">
                  <IconButton color="primary"

                    onClick={() => {

                      setDialog('ConvertLeadToReferDialog')
                      setLead(cell.row.original)

                    }}
                  >
                    <BuildOutlined />
                  </IconButton>
                </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('assignedrefer_delete') && <Tooltip title="delete">
                <IconButton color="error"

                  onClick={() => {
                    setDialog('DeleteCrmItemDialog')
                    setLead(cell.row.original)

                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('create_lead_bills') && <Tooltip title="upload bill">
                <IconButton color="error"

                  onClick={() => {
                    setDialog('CreateOrEditBillDialog')
                    setLead(cell.row.original)

                  }}
                >
                  <Upload />
                </IconButton>
              </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('view_lead_bills') && <Tooltip title="view bills">
                <IconButton color="primary"

                  onClick={() => {

                    setDialog('ViewLeadsBillHistoryDialog')
                    setLead(cell.row.original)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="edit">
                  <IconButton color="secondary"

                    onClick={() => {

                      setDialog('CreateOrEditLeadDialog')
                      setLead(cell.row.original)
                    }}

                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('assignedrefer_view') && <Tooltip title="view leads">
                <IconButton color="primary"

                  onClick={() => {

                    setDialog('ViewRemarksDialog')
                    setLead(cell.row.original)


                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="Add Remark">
                  <IconButton

                    color="success"
                    onClick={() => {

                      setDialog('CreateOrEditRemarkDialog')
                      setLead(cell.row.original)

                    }}
                  >
                    <Comment />
                  </IconButton>
                </Tooltip>}

            </Stack>}
        />
      },


      {
        accessorKey: 'name',
        header: 'Name',

        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.name || "" })} />,
        Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
        filterSelectOptions: leads && leads.map((i) => {
          return i.name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'city',
        header: 'City',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.city || "" })} />,

        Cell: (cell) => <>{cell.row.original.city ? cell.row.original.city : ""}</>,
        filterSelectOptions: leads && leads.map((i) => {
          return i.city;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'state',
        header: 'State',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.state || "" })} />,
        Cell: (cell) => <>{cell.row.original.state ? cell.row.original.state : ""}</>,

      },


      {
        accessorKey: 'mobile',
        header: 'Mobile1',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.mobile || "" })} />,
        Cell: (cell) => <>{cell.row.original.mobile ? cell.row.original.mobile : ""}</>
      }, {
        accessorKey: 'alternate_mobile1',
        header: 'Mobile2',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.alternate_mobile1 || "" })} />,
        Cell: (cell) => <>{cell.row.original.alternate_mobile1 ? cell.row.original.alternate_mobile1 : ""}</>
      }, {
        accessorKey: 'alternate_mobile2',
        header: 'Mobile3',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.alternate_mobile2 || "" })} />,
        Cell: (cell) => <>{cell.row.original.alternate_mobile2 ? cell.row.original.alternate_mobile2 : ""}</>
      },
      {
        accessorKey: 'created_at',
        header: 'TimeStamp',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.created_at || "" })} />,
        Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
      },
      {
        accessorKey: 'referred_party_name',
        header: 'Refer Party',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.referred_party_name || "" })} />,
        Cell: (cell) => <>{cell.row.original.referred_party_name ? cell.row.original.referred_party_name : ""}</>
      },
      {
        accessorKey: 'referred_party_mobile',
        header: 'Refer Mobile',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.referred_party_mobile || "" })} />,
        Cell: (cell) => <>{cell.row.original.referred_party_mobile ? cell.row.original.referred_party_mobile : ""}</>
      },
      {
        accessorKey: 'referred_date',
        header: 'Refer Date',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.referred_date || "" })} />,
        Cell: (cell) => <>{cell.row.original.referred_date ? cell.row.original.referred_date : ""}</>
      },


      {
        accessorKey: 'customer_name',
        header: 'Customer',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.customer_name || "" })} />,
        Cell: (cell) => <>{cell.row.original.customer_name ? cell.row.original.customer_name : ""}</>
      }
      , {
        accessorKey: 'customer_designation',
        header: 'Designitaion',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.customer_designation || "" })} />,
        Cell: (cell) => <>{cell.row.original.customer_designation ? cell.row.original.customer_designation : ""}</>
      }

      ,
      {
        accessorKey: 'email',
        header: 'Email',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.email || "" })} />,
        Cell: (cell) => <>{cell.row.original.email ? cell.row.original.email : ""}</>
      }
      ,
      {
        accessorKey: 'alternate_email',
        header: 'Email2',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.alternate_email || "" })} />,
        Cell: (cell) => <>{cell.row.original.alternate_email ? cell.row.original.alternate_email : ""}</>
      }
      ,

      {
        accessorKey: 'address',
        header: 'Address',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.address || "" })} />,
        Cell: (cell) => <>{cell.row.original.address ? cell.row.original.address : ""}</>
      },
      {
        accessorKey: 'lead_source',
        header: 'Lead Source',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.lead_source || "" })} />,
        Cell: (cell) => <>{cell.row.original.lead_source ? cell.row.original.lead_source : ""}</>
      },
      {
        accessorKey: 'lead_type',
        header: 'Lead Type',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.lead_type || "" })} />,
        Cell: (cell) => <>{cell.row.original.lead_type ? cell.row.original.lead_type : ""}</>
      },
      {
        accessorKey: 'country',
        header: 'Country',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.country || "" })} />,
        Cell: (cell) => <>{cell.row.original.country ? cell.row.original.country : ""}</>
      },
      {
        accessorKey: 'visiting_card',
        header: 'Visiting Card',
        enableColumnFilter: false,
        Cell: (cell) => <span onDoubleClick={() => {
          if (cell.row.original.visiting_card && cell.row.original.visiting_card) {
            DownloadFile(cell.row.original.visiting_card, 'visiting card')
          }
        }}>
          {cell.row.original.visiting_card && cell.row.original.visiting_card ? < img height="20" width="55" src={cell.row.original.visiting_card && cell.row.original.visiting_card} alt="visiting card" /> : "na"}</span>
      },
    ],
    [leads],
    //end
  );


  

  //load state from local storage
  useEffect(() => {
    const columnVisibility = localStorage.getItem(
      'mrt_columnVisibility_AssignedReferReportPage',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_AssignedReferReportPage',
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
      'mrt_columnVisibility_AssignedReferReportPage',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_AssignedReferReportPage', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_AssignedReferReportPage', JSON.stringify(columnSizing));
  }, [columnSizing]);

  useEffect(() => {
    if (isSuccess) {
      setLeads(data.data);
    }
  }, [isSuccess]);


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: leads, //10,000 rows       
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
    onColumnVisibilityChange: setColumnVisibility,  //optional

    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });

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
          Assigned Refers : {leads && leads.length}
        </Typography>
        <Stack direction="row" gap={2}>
          < TextField
            size="small"
            type="date"
            id="start_date"
            label="Start Date"
            fullWidth
            value={dates.start_date}
            focused
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
            size="small"
            type="date"
            id="end_date"
            label="End Date"
            focused
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
        </Stack>
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
            {LoggedInUser?.assigned_permissions.includes('assignedrefer_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('assignedrefer_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >

        </>


      </Stack >

      {
        lead ?
          <>
            <CreateOrEditRemarkDialog dialog={dialog} setDialog={setDialog} lead={lead ? {
              _id: lead._id,
              has_card: lead.has_card,
              stage: lead.stage
            } : undefined} />
            <DeleteCrmItemDialog dialog={dialog} setDialog={setDialog} lead={lead ? { id: lead._id, label: lead.name } : undefined} />
            <ViewRemarksDialog dialog={dialog} setDialog={setDialog} id={lead._id} />
            <ReferLeadDialog dialog={dialog} setDialog={setDialog} lead={lead} />
            <RemoveLeadReferralDialog dialog={dialog} setDialog={setDialog} lead={lead} />
            <CreateOrEditLeadDialog dialog={dialog} setDialog={setDialog} lead={lead} />
            <ConvertLeadToReferDialog dialog={dialog} setDialog={setDialog} lead={lead} />
            <CreateOrEditBillDialog dialog={dialog} setDialog={setDialog} lead={lead} bill={undefined} />
            <ViewLeadsBillHistoryDialog dialog={dialog} setDialog={setDialog} id={lead._id} />
          </>
          : null
      }
      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

