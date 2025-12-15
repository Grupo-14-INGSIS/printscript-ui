import {AppBar, Box, Button, Container, Toolbar, Typography, Avatar} from "@mui/material";
import {Code, Rule, Login, Logout, BugReport} from "@mui/icons-material";
import {ReactNode} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";

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
    const { user, isAuthenticated, logout, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    const handleLogout = () => {
        logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    };

    const handleShowToken = async () => {
        try {
            const token = await getAccessTokenSilently({
                authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                    scope: "openid profile email read:snippets write:snippets delete:snippets",
                }
            });
            console.log("Access Token:", token);
            alert("El token de acceso se ha impreso en la consola de desarrollador (F12).");
        } catch (e) {
            console.error(e);
            alert("No se pudo obtener el token. Revisa la consola para ver el error.");
        }
    };

    return (
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
                            <Button onClick={handleShowToken} sx={{my: 2, color: 'white'}} startIcon={<BugReport/>}>
                                Show Token
                            </Button>
                        )}
                    </Box>

                    {/* Sección de autenticación */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {!isAuthenticated ? (
                            <Button
                                startIcon={<Login />}
                                onClick={() => loginWithRedirect()}
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
    );
}