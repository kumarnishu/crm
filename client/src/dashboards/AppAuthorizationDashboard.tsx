import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { ButtonLogo } from "../components/logo/Agarson";
import { toTitleCase } from "../utils/TitleCase";

function AppAuthorizationDashboard() {
    const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)

    //process feature and access
    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []
        user?.assigned_permissions.includes('states_view') && tmpfeatures.push({ feature: 'states', is_visible: true, url: "CrmStatesPage" })
        user?.assigned_permissions.includes('city_view') && tmpfeatures.push({ feature: 'cities', is_visible: true, url: "CitiesPage" })
        user?.assigned_permissions.includes('key_view') && tmpfeatures.push({ feature: 'Keys ', is_visible: true, url: "KeysPage" })
        user?.assigned_permissions.includes('key_category_view') && tmpfeatures.push({ feature: 'Key Categories ', is_visible: true, url: "KeysCategoriesPage" })
        user?.assigned_permissions.includes('user_assignment_view') && tmpfeatures.push({ feature: 'User Assignement ', is_visible: true, url: "UserAssignementPage" })


        tmpfeatures.sort((a, b) => a.feature.localeCompare(b.feature));

        setFeatures(tmpfeatures)

    }, [user])

    return (
        <>  <Grid container sx={{ pt: 2 }} >
            {features.map((feat, index) => {
                return (
                    <Grid key={index} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                        <Link to={feat.url} style={{ textDecoration: 'none' }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    m: 0,
                                    height: 60,
                                    borderRadius: 4,
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
                                    <ButtonLogo title="" height={20} width={20} />
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        sx={{
                                            fontWeight: 'medium', fontSize: 14
                                        }}
                                    >
                                        {toTitleCase(feat.feature)}
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Link>
                    </Grid>
                )
            })}
        </Grid>
        </>
    )
}


export default AppAuthorizationDashboard