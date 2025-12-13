import {AppBar, Box, Button, Container, Toolbar, Typography, Avatar, Dialog} from "@mui/material";
import {Code, Rule, Login, Logout, Science} from "@mui/icons-material";
import {ReactNode, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../../contexts/authContext";
import RunnerTest from "../RunnerTest.tsx";

type PageType = {
    title: string;
    path: string;
    icon: ReactNode;
}

const pages: PageType[] = [{
    title: 'Snippets',
    path: '/',
    icon: <Code/>
}, {
    title: 'Rules',
    path: '/rules',
    icon: <Rule/>
}];

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [isTestOpen, setIsTestOpen] = useState(false);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <AppBar position="static" elevation={0}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{display: "flex", gap: "24px"}}>
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            sx={{
                                display: {xs: 'none', md: 'flex'},
                                fontWeight: 700,
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            Printscript
                            yes
                        </Typography>
                        <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}, gap: '4px'}}>
                            {isAuthenticated && pages.map((page) => (
                                <Button
                                    key={page.title}
                                    onClick={() => navigate(`${page.path}`)}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'flex',
                                        justifyContent: "center",
                                        gap: "4px",
                                        backgroundColor: location.pathname === page.path ? 'primary.light' : 'transparent',
                                        "&:hover": {
                                            backgroundColor: 'primary.dark'
                                        }
                                    }}
                                >
                                    {page.icon}
                                    <Typography>{page.title}</Typography>
                                </Button>
                            ))}
                            {isAuthenticated && (
                                <Button
                                    onClick={() => setIsTestOpen(true)}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'flex',
                                        justifyContent: "center",
                                        gap: "4px",
                                        backgroundColor: 'transparent',
                                        "&:hover": {
                                            backgroundColor: 'primary.dark'
                                        }
                                    }}
                                >
                                    <Science />
                                    <Typography>Test Runner</Typography>
                                </Button>
                            )}
                        </Box>

                        {/* Sección de autenticación */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {!isAuthenticated ? (
                                <Button
                                    startIcon={<Login />}
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        color: 'white',
                                        borderColor: 'white',
                                        "&:hover": {
                                            backgroundColor: 'primary.dark',
                                            borderColor: 'white',
                                        }
                                    }}
                                    variant="outlined"
                                >
                                    Log In
                                </Button>
                            ) : (
                                <>
                                    {user?.picture && (
                                        <Avatar
                                            src={user.picture}
                                            alt={user.name}
                                            sx={{ width: 32, height: 32 }}
                                        />
                                    )}
                                    <Typography sx={{ color: 'white', display: { xs: 'none', sm: 'block' } }}>
                                        {user?.name || user?.email}
                                    </Typography>
                                    <Button
                                        startIcon={<Logout />}
                                        onClick={handleLogout}
                                        sx={{
                                            color: 'white',
                                            borderColor: 'white',
                                            "&:hover": {
                                                backgroundColor: 'primary.dark',
                                                borderColor: 'white',
                                            }
                                        }}
                                        variant="outlined"
                                    >
                                        Log Out
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <Dialog open={isTestOpen} onClose={() => setIsTestOpen(false)}>
                <RunnerTest />
            </Dialog>
        </>
    );
}