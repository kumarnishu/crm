import { Link, Outlet } from 'react-router-dom';
import { Stack } from '@mui/system';
import styled from '@emotion/styled';
import { Avatar, Box, IconButton, Tooltip } from '@mui/material';
import { useContext } from 'react';
import { MenuContext, TaskMenuActions, UserMenuActions } from '../../contexts/menuContext';
import { UserContext } from '../../contexts/userContext';
import { paths } from '../../Routes';
import ResetPasswordSendMailDialog from '../dialogs/users/ResetPasswordSendMailDialog';
import SignUpDialog from '../dialogs/users/SignUpDialog';
import AgarsonLogo from '../logo/Agarson';
import ProfileMenu from '../menu/ProfileMenu';
import TaskMenu from '../menu/TaskMenu';
import { Menu } from '@mui/icons-material';

export const StyledLink = styled(Link)`
    text-decoration: none;
    color:white;
`
export default function TaskNavBar() {
    const { setMenu } = useContext(MenuContext)
    const { user } = useContext(UserContext)
    return (
        <>
            <Box sx={{ bgcolor: '#0039a6', width: '100%', p: 0.6 }}>
                {/* parent stack */}
                <Stack direction="row" sx={{
                    justifyContent: "space-between", alignItems: "center"
                }}
                >
                    {/* child stack1 */}
                    <Stack direction="column" gap={2} pl={1}>
                        <StyledLink to={paths.dashboard}>
                            <AgarsonLogo width={35} height={35} title='Go To Dashboard' />
                        </StyledLink>
                    </Stack>
                    {/* child stack2 */}
                    <Stack direction="row"
                        justifyContent={"center"}
                        alignItems="center"
                    >
                        {user ?
                            <>
                                {/* stack1 nav links*/}
                                <Stack
                                    direction="row"
                                    gap={2}
                                    px={2}
                                    sx={{
                                        display: { xs: 'none', md: 'flex' }
                                    }}
                                >

                                    <StyledLink to={paths.tasks}>Tasks</StyledLink>
                                    {user.is_admin && <StyledLink to={paths.task_admin_page}>Task Admin</StyledLink>}
                                    <StyledLink to={paths.task_help_page}>Help</StyledLink>
                                </Stack>

                                {/* stack2 right icons*/}
                                <Stack
                                    direction="row"
                                    justifyContent={"center"}
                                    alignItems="center"
                                    gap={2}
                                >
                                    <Tooltip title="open menu">
                                        <IconButton
                                            onClick={(e) => setMenu({ type: TaskMenuActions.task_menu, anchorEl: e.currentTarget })
                                            }
                                            sx={{
                                                color: "white",
                                                display: {
                                                    xs: 'block', md: 'none'
                                                }
                                            }}>
                                            <Menu />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={user.username || "open settings"}>
                                        <IconButton
                                            onClick={(e) => setMenu({ type: UserMenuActions.profile_menu, anchorEl: e.currentTarget })
                                            }
                                        >
                                            <Avatar
                                                sx={{ width: 30, height: 30 }}
                                                alt="img1" src={user.dp?.public_url} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </>
                            :
                            null
                        }
                    </Stack >
                </Stack>
            </Box >
            <Outlet />
            <TaskMenu />
            <ProfileMenu />
            <ResetPasswordSendMailDialog />
            <SignUpDialog />
        </>
    )
}