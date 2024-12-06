import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { useQuery } from "react-query";
import { BackendError } from "../..";
import { UserContext } from "../../contexts/userContext";
import { GetAllKeyCategoriesForDropdown } from "../../services/KeyServices";
import { DropDownDto } from "../../dtos/dropdown.dto";
import { AssignmentOutlined } from "@mui/icons-material";
import { toTitleCase } from "../../utils/TitleCase";
import { ExcelDbButtons } from "../buttons/ExcelDbButtons";

function ExcelDBDashboard() {
    const [features, setFeatures] = useState<{ feature: string, display_name: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)
    const { data: categoryData } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["key_category_dropdown"], async () => GetAllKeyCategoriesForDropdown({ show_assigned_only: true }))


    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, display_name: string, url: string }[] = []

        if (user && categoryData && categoryData.data) {
            categoryData.data.map((dt) => {
                tmpfeatures.push({ feature: dt.label, display_name: dt.label && dt.label, is_visible: true, url: `ExcelDbReports/${dt.id}` })
            })
        }
       
        setFeatures(tmpfeatures)

    }, [user, categoryData])


    return (
        <>
          {user?.assigned_permissions.includes('grp_excel_create') && <Stack sx={{ width: '100%' }} direction={'row'} p={2} justifyContent={'end'}>
                <ExcelDbButtons />
            </Stack>}
            <Grid container  >
                {features.map((feat, index) => {
                    return (
                        <Grid key={index} item xs={12} md={4} lg={4} sx={{ p: 1 }}>
                            <Link title={feat.display_name} to={feat.url} style={{ textDecoration: 'none' }}>
                                <Paper
                                    sx={{
                                        m: 0,
                                        minHeight: 60,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        backdropFilter: 'blur(10px)', // Blurry effect
                                        backgroundColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent blue
                                        transition: '0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            backgroundColor: 'rgba(70, 130, 180, 0.7)', // Darken on hover
                                        },
                                    }}
                                >
                                    <Stack
                                        flexDirection="row"
                                        gap={2}
                                        sx={{ alignItems: 'center' }}
                                    >
                                        <AssignmentOutlined />
                                        <Typography
                                            variant="h6"
                                            component="div"
                                            sx={{
                                                fontWeight: 'medium', fontSize: 14
                                            }}
                                        >
                                            {toTitleCase(feat.feature || "")}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Link>
                        </Grid>
                    )
                })}
            </Grid>
            <Outlet />
        </>

    )
}


export default ExcelDBDashboard