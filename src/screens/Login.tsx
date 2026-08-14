import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginScreen = () => {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    // Automatically redirect to Auth0's universal login page.
    loginWithRedirect();
  }, [loginWithRedirect]);

  return <div>Redirecting to login...</div>;
};

export default LoginScreen;
