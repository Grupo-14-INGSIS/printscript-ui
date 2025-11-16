import './App.css';
import {RouterProvider} from "react-router";
import {createBrowserRouter} from "react-router-dom";
import HomeScreen from "./screens/Home.tsx";
import {QueryClient, QueryClientProvider} from "react-query";
import RulesScreen from "./screens/Rules.tsx";
import {LoginForm} from "./components/common/LoginForm.tsx";
import {ProtectedRoute} from "./components/common/ProtectedRoute.tsx";
import {AuthProvider} from "./contexts/authContext.tsx";
// import {withAuthenticationRequired} from "@auth0/auth0-react";

const router = createBrowserRouter([
    {
        path: "/login",
        element : <LoginForm />
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <HomeScreen />
            </ProtectedRoute>
        )

    },
    {
        path: '/rules',
        element: (
            <ProtectedRoute>
                <RulesScreen />
            </ProtectedRoute>
        )

    }
    //agregamos el resto de nuestras rutas
]);

export const queryClient = new QueryClient()
const App = () => {
    return (
        <AuthProvider>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
            </AuthProvider>
    );
}

// To enable Auth0 integration change the following line
export default App;
// for this one:
// export default withAuthenticationRequired(App);
