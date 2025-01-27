import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState,  MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Button, Fade, IconButton, Menu, MenuItem, TextField, Typography } from '@mui/material'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { StockSchmeService } from '../../services/StockSchmeService'
import ConsumeStockSchmeDialog from '../../components/dialogs/stockschme/ConsumeStockSchmeDialog'
import { StockSchemeButton } from '../../components/buttons/StockSchemeButton'
import { HandleNumbers } from '../../utils/IsDecimal'
import { GetArticleStockDto } from '../../dtos/StockSchemeDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'


export default function ArticleStockPage() {
  const [schme, setSchme] = useState<string>()
  const [balance, setBalance] = useState<GetArticleStockDto>()
  const [balances, setBalances] = useState<GetArticleStockDto[]>([])
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetArticleStockDto[]>, BackendError>(["stocks"], async () => new StockSchmeService().GetAllArticlesStock())
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const isFirstRender = useRef(true);
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetArticleStockDto>[]>(
    //column definitions...
    () => balances && [
      {
        accessorKey: 'actions',   enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
        header: 'Actions',
        Cell: ({ cell }) => <>
          <Button color="error"
            disabled={cell.row.original.six + cell.row.original.seven + cell.row.original.eight + cell.row.original.nine - cell.row.original.ten == 0}
            onClick={() => {
              setBalance(cell.row.original)
              setDialog('ConsumeStockSchmeDialog')
            }}
          >
            Consume
          </Button>
        </>
      },
      {
        accessorKey: 'scheme.label',
        header: 'Scheme',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => {
          return item.scheme.label
        })} />,
        Cell: (cell) => <>{cell.row.original.scheme ? cell.row.original.scheme.label : ""}</>,
      },
      {
        accessorKey: 'article',
        header: 'article',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => {
            return item.article
        })} />,
        Cell: (cell) => <>{cell.row.original.article ? cell.row.original.article : ""}</>,
      },
      {
        accessorKey: 'six',
        header: '6',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => <>{cell.row.original.six ? cell.row.original.six : ""}</>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.six) }, 0).toFixed()}</b>

        ,
      },
      {
        accessorKey: 'seven',
        header: '7',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => <>{cell.row.original.seven ? cell.row.original.seven : ""}</>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.seven) }, 0).toFixed()}</b>,
      },

      {
        accessorKey: 'eight',
        header: '8',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => <>{cell.row.original.eight ? cell.row.original.eight : ""}</>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.eight) }, 0).toFixed()}</b>
      },
      {
        accessorKey: 'nine',
        header: '9',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => <>{cell.row.original.nine ? cell.row.original.nine : ""}</>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.nine) }, 0).toFixed()}</b>
      },
      {
        accessorKey: 'ten',
        header: '10',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => <>{cell.row.original.ten ? cell.row.original.ten : ""}</>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.ten) }, 0).toFixed()}</b>
      },
      {
        accessorKey: 'eleven',
        header: '11',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => <>{cell.row.original.eleven ? cell.row.original.eleven : ""}</>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.eleven) }, 0).toFixed()}</b>
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => {
            return item.created_at
        })} />,
        Cell: (cell) => <>{cell.row.original.created_at || ""}</>,
      },
      {
        accessorKey: 'updated_by',
        header: 'Last updated by',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => {
            return item.updated_by.label
        })} />,
        Cell: (cell) => <>{cell.row.original.updated_by ? cell.row.original.updated_by.label : ""}</>,
      },

    ],
    [balances],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: balances, //10,000 rows       
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
          display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially status
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
    onColumnVisibilityChange: setColumnVisibility,  //optional

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
      'mrt_columnVisibility_ArticleStockPage',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_ArticleStockPage',
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
      'mrt_columnVisibility_ArticleStockPage',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_ArticleStockPage', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_ArticleStockPage', JSON.stringify(columnSizing));
  }, [columnSizing]);

  useEffect(() => {
    if (isSuccess) {
      setBalances(data.data);
    }
  }, [data, isSuccess]);

  console.log(balance, dialog)
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
          Stock
        </Typography>

        <Stack direction={'row'} gap={1}>

          {LoggedInUser?.role == "admin" &&
            <>
              <TextField  size="small" label="Scheme" variant="outlined" value={schme} onChange={(e) => setSchme(e.currentTarget.value)} />
              <StockSchemeButton schme={schme} />
            </>
          }
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


            {LoggedInUser?.assigned_permissions.includes('article_stock_scheme_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('article_stock_scheme_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
        </Stack>
      </Stack>
      {/* table */}
      < MaterialReactTable table={table} />
      {balance && <ConsumeStockSchmeDialog stock={balance} dialog={dialog} setDialog={setDialog} />}
    </>

  )

}

