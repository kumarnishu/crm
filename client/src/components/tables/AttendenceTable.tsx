import { Box, Checkbox, IconButton, Tooltip } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { STable, STableBody, STableCell, STableHead, STableHeadCell, STableRow } from "../styled/STyledTable"
import ViewTextDialog from '../dialogs/text/ViewTextDialog'
import { IVisit } from '../../types/visit.types'
import moment from 'moment'
import ToogleAttendenceDialog from '../dialogs/visit/ToogleAttendenceDialog'
import { Edit } from '@mui/icons-material'
import { ChoiceContext, VisitChoiceActions } from '../../contexts/dialogContext'
import { UserContext } from '../../contexts/userContext'


type Props = {
    attendence: {
        _id: string,
        date: Date,
        visits: IVisit[];
    } | undefined
    setAttendence: React.Dispatch<React.SetStateAction<{
        _id: string,
        date: Date,
        visits: IVisit[];
    } | undefined>>,
    attendences: {
        _id: string,
        date: Date,
        visits: IVisit[];
    }[],
    selectAll: boolean,
    setSelectAll: React.Dispatch<React.SetStateAction<boolean>>,
    selectedAttendeces: {
        _id: string,
        date: Date,
        visits: IVisit[]
    }[]
    setSelectedAttendeces: React.Dispatch<React.SetStateAction<{
        _id: string,
        date: Date,
        visits: IVisit[]
    }[]>>
}

function AttendenceTable({ attendences, selectedAttendeces, setSelectedAttendeces, setAttendence, selectAll, setSelectAll }: Props) {
    const { user } = useContext(UserContext)
    const { setChoice } = useContext(ChoiceContext)
    const [visit, setVisit] = useState<IVisit>()
    const [data, setData] = useState<{
        _id: string,
        date: Date,
        visits: IVisit[];
    }[]>(attendences)
    const [text, setText] = useState<string>()

    useEffect(() => {
        setData(attendences)
    }, [attendences])
    return (
        <>
            <Box sx={{
                overflow: "scroll",
                maxHeight: '63vh'
            }}>
                <STable
                >
                    <STableHead
                    >
                        <STableRow>
                            <STableHeadCell
                            >


                                <Checkbox
                                    indeterminate={selectAll ? true : false}
                                    checked={Boolean(selectAll)}
                                    size="small" onChange={(e) => {
                                        if (e.currentTarget.checked) {
                                            setSelectedAttendeces(attendences)
                                            setSelectAll(true)
                                        }
                                        if (!e.currentTarget.checked) {
                                            setSelectedAttendeces([])
                                            setSelectAll(false)
                                        }
                                    }} />

                            </STableHeadCell>

                            {user?.visit_access_fields.is_editable && <STableHeadCell
                            >

                                Actions

                            </STableHeadCell>}
                            <STableHeadCell
                            >

                                Date

                            </STableHeadCell>
                            <STableHeadCell
                            >

                                Start Time

                            </STableHeadCell>
                            <STableHeadCell
                            >

                                Person

                            </STableHeadCell>

                            <STableHeadCell
                            >

                                Attendence

                            </STableHeadCell>

                            <STableHeadCell
                            >

                                Address

                            </STableHeadCell>

                        </STableRow>
                    </STableHead>
                    <STableBody >
                        {

                            data && data.map((attendence, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        {
                                            attendence.visits.map((visit, index) => {
                                                return (
                                                    <STableRow
                                                        key={index}
                                                    >
                                                        {selectAll ?

                                                            <STableCell>


                                                                <Checkbox size="small"
                                                                    checked={Boolean(selectAll)}
                                                                />


                                                            </STableCell>
                                                            :
                                                            null}
                                                        {!selectAll ?

                                                            <STableCell>

                                                                <Checkbox size="small"
                                                                    onChange={(e) => {
                                                                        setAttendence(attendence)
                                                                        if (e.target.checked) {
                                                                            setSelectedAttendeces([...selectedAttendeces, attendence])
                                                                        }
                                                                        if (!e.target.checked) {
                                                                            setSelectedAttendeces((attendences) => attendences.filter((item) => {
                                                                                return item._id !== attendence._id
                                                                            }))
                                                                        }
                                                                    }}
                                                                />

                                                            </STableCell>
                                                            :
                                                            null}
                                                        {user?.visit_access_fields.is_editable && <STableCell>
                                                            <Tooltip title="Edit Summary">
                                                                <IconButton color="success"
                                                                    onClick={() => {
                                                                        setChoice({ type: VisitChoiceActions.mark_attendence })
                                                                        setVisit(visit)
                                                                    }}
                                                                >
                                                                    <Edit />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </STableCell>}
                                                        <STableCell>
                                                            {visit.created_at && new Date(visit.created_at).toLocaleDateString()}
                                                        </STableCell>
                                                        <STableCell>
                                                            {visit.start_day_credientials.timestamp && moment(new Date(visit.start_day_credientials.timestamp)).format('LT')}
                                                        </STableCell>
                                                        <STableCell>
                                                            {visit.created_by.username}
                                                        </STableCell>
                                                        <STableCell>
                                                            {visit.is_present ? "Present" : ""}
                                                        </STableCell>

                                                        <STableCell>
                                                            {visit.start_day_credientials.address}
                                                        </STableCell>
                                                    </STableRow>
                                                )
                                            })
                                        }
                                    </React.Fragment>
                                )
                            })

                        }
                    </STableBody>
                </STable>
            </Box >
            {visit && <ToogleAttendenceDialog visit={visit} />}
            {text && <ViewTextDialog text={text} setText={setText} />}
        </>
    )
}

export default AttendenceTable