import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { GetReminderRemarks } from '../../services/LeadsServices'
import { BackendError } from '../..'
import { Box, DialogTitle, Stack } from '@mui/material'

import { Comment, Visibility } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { onlyUnique } from '../../utils/UniqueArray'
import { DownloadFile } from '../../utils/DownloadFile'
import ViewRemarksDialog from '../../components/dialogs/crm/ViewRemarksDialog'
import CreateOrEditRemarkDialog from '../../components/dialogs/crm/CreateOrEditRemarkDialog'
import { GetActivitiesOrRemindersDto } from '../../dtos/crm-remarks.dto'

function CrmReminderPage() {
  const [remarks, setRemarks] = useState<GetActivitiesOrRemindersDto[]>([])
  const [remark, setRemark] = useState<GetActivitiesOrRemindersDto>()
  const { data, isSuccess, isLoading } = useQuery<AxiosResponse<GetActivitiesOrRemindersDto[]>, BackendError>(["reminders"], async () => GetReminderRemarks())
  const { user: LoggedInUser } = useContext(UserContext)

  const [dialog, setDialog] = useState<string | undefined>()

  const isFirstRender = useRef(true);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetActivitiesOrRemindersDto>[]>(
    //column definitions...
    () => remarks && [
      {
        accessorKey: 'actions',
        header: '',

        Footer: <b></b>,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>
              {LoggedInUser?.assigned_permissions.includes('reminders_view') && <Tooltip title="view remarks">
                <IconButton color="primary"

                  onClick={() => {

                    setDialog('ViewRemarksDialog')
                    setRemark(cell.row.original)


                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('reminders_create') &&
                <Tooltip title="Add Remark">
                  <IconButton

                    color="success"
                    onClick={() => {
                      setDialog('CreateOrEditRemarkDialog')
                      setRemark(cell.row.original)

                    }}
                  >
                    <Comment />
                  </IconButton>
                </Tooltip>}

            </Stack>}
        />
      },
      {
        accessorKey: 'remark',
        header: ' Last Remark',

        Cell: (cell) => <>{cell.row.original.remark ? cell.row.original.remark : ""}</>
      },
      {
        accessorKey: 'created_by.label',
        header: 'Creator',

        Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>
      },

      {
        accessorKey: 'stage',
        header: 'Stage',

        Cell: (cell) => <>{cell.row.original.stage ? cell.row.original.stage : ""}</>
      },

      {
        accessorKey: 'remind_date',
        header: 'Next Call',

        Cell: (cell) => <>{cell.row.original.remind_date ? cell.row.original.remind_date : ""}</>
      },

      {
        accessorKey: 'name',
        header: 'Name',

        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
        filterSelectOptions: remarks && remarks.map((i) => {
          return i.name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'city',
        header: 'City',
        filterVariant: 'multi-select',

        Cell: (cell) => <>{cell.row.original.city ? cell.row.original.city : ""}</>,
        filterSelectOptions: remarks && remarks.map((i) => {
          return i.city;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'state',
        header: 'State',
        filterVariant: 'multi-select',

        Cell: (cell) => <>{cell.row.original.state ? cell.row.original.state : ""}</>,
        filterSelectOptions: remarks && remarks.map((i) => {
          return i.state;
        }).filter(onlyUnique)
      },


      {
        accessorKey: 'mobile',
        header: 'Mobile1',

        Cell: (cell) => <>{cell.row.original.mobile ? cell.row.original.mobile : ""}</>
      }, {
        accessorKey: 'alternate_mobile1',
        header: 'Mobile2',

        Cell: (cell) => <>{cell.row.original.alternate_mobile1 ? cell.row.original.alternate_mobile1 : ""}</>
      }, {
        accessorKey: 'alternate_mobile2',
        header: 'Mobile3',

        Cell: (cell) => <>{cell.row.original.alternate_mobile2 ? cell.row.original.alternate_mobile2 : ""}</>
      },
      {
        accessorKey: 'created_at',
        header: 'TimeStamp',

        Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
      },
      {
        accessorKey: 'referred_party_name',
        header: 'Refer Party',

        Cell: (cell) => <>{cell.row.original.referred_party_name ? cell.row.original.referred_party_name : ""}</>
      },
      {
        accessorKey: 'referred_party_mobile',
        header: 'Refer Mobile',

        Cell: (cell) => <>{cell.row.original.referred_party_mobile ? cell.row.original.referred_party_mobile : ""}</>
      },
      {
        accessorKey: 'referred_date',
        header: 'Refer Date',

        Cell: (cell) => <>{cell.row.original.referred_date ? cell.row.original.referred_date : ""}</>
      },


      {
        accessorKey: 'customer_name',
        header: 'Customer',

        Cell: (cell) => <>{cell.row.original.customer_name ? cell.row.original.customer_name : ""}</>
      }
      , {
        accessorKey: 'customer_designation',
        header: 'Designitaion',

        Cell: (cell) => <>{cell.row.original.customer_designation ? cell.row.original.customer_designation : ""}</>
      }

      ,
      {
        accessorKey: 'email',
        header: 'Email',

        Cell: (cell) => <>{cell.row.original.email ? cell.row.original.email : ""}</>
      }
      ,
      {
        accessorKey: 'alternate_email',
        header: 'Email2',

        Cell: (cell) => <>{cell.row.original.alternate_email ? cell.row.original.alternate_email : ""}</>
      }
      ,

      {
        accessorKey: 'address',
        header: 'Address',

        Cell: (cell) => <>{cell.row.original.address ? cell.row.original.address : ""}</>
      },
      {
        accessorKey: 'source',
        header: 'Lead Source',

        Cell: (cell) => <>{cell.row.original.lead_source ? cell.row.original.lead_source : ""}</>
      },
      {
        accessorKey: 'type',
        header: 'Lead Type',

        Cell: (cell) => <>{cell.row.original.lead_type ? cell.row.original.lead_type : ""}</>
      },
      {
        accessorKey: 'country',
        header: 'Country',

        Cell: (cell) => <>{cell.row.original.country ? cell.row.original.country : ""}</>
      },
      {
        accessorKey: 'visiting_card',
        header: 'Visiting Card',

        Cell: (cell) => <span onDoubleClick={() => {
          if (cell.row.original.visiting_card && cell.row.original.visiting_card) {
            DownloadFile(cell.row.original.visiting_card, 'visiting card')
          }
        }}>
          {cell.row.original.visiting_card && cell.row.original.visiting_card ? < img height="20" width="55" src={cell.row.original.visiting_card && cell.row.original.visiting_card} alt="visiting card" /> : "na"}</span>
      },
    ],
    [remarks],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: remarks, //10,000 rows       
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '58vh' }
    }),
    muiTableHeadRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white'
      },
    }),
	muiTableHeadCellProps: ({ column }) => ({
      sx: {
        '& div:nth-child(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted()|| column.getIsGrouped())?'inline':'none', // Initially hidden
        },
        '& div:nth-child(2)': {
          display: (column.getIsFiltered() || column.getIsGrouped())?'inline-block':'none'
        },
        '&:hover div:nth-child(1) span': {
          display: 'inline', // Visible on hover
        },
        '&:hover div:nth-child(2)': {
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
    onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //optional

    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });
  useEffect(() => {
    if (isSuccess)
      setRemarks(data?.data)
  }, [remarks, isSuccess, data])
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
    <Box>
      <DialogTitle sx={{ textAlign: 'center' }}>My Reminders - {remarks && remarks.length}</DialogTitle>
      {remark && <ViewRemarksDialog dialog={dialog} setDialog={setDialog} id={remark.lead_id} />}
      {remark && <CreateOrEditRemarkDialog dialog={dialog} setDialog={setDialog} lead={remark ? {
        _id: remark.lead_id,
        has_card: remark.has_card,
        stage: remark.stage
      } : undefined} />}
      <MaterialReactTable table={table} />
    </Box >
  )
}

export default CrmReminderPage