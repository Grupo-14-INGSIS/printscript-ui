import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Alert, Box, Button, Typography } from '@mui/material';

const LoginScreen = () => {
  const { loginWithRedirect, error } = useAuth0();

  useEffect(() => {
    // Si Auth0 rechazó el login (por ejemplo, un usuario de otro ambiente), no se vuelve a redirigir:
    // Auth0 recuerda la sesión, lo rechazaría de nuevo y la pantalla quedaría en un bucle.
    if (!error) {
      loginWithRedirect();
    }
  }, [loginWithRedirect, error]);

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2} p={2}>
        <Typography variant="h5">No se pudo iniciar sesión</Typography>
        <Alert severity="error" sx={{ maxWidth: 520 }}>{error.message}</Alert>
        <Button
          variant="contained"
          // prompt=login: Auth0 pide usuario y contraseña de nuevo, aunque recuerde la sesión anterior
          onClick={() => loginWithRedirect({ authorizationParams: { prompt: 'login' } })}
        >
          Entrar con otra cuenta
        </Button>
      </Box>
    );
  }

  return <div>Redirecting to login...</div>;
};

export default LoginScreen;
