import './App.css';
import {RouterProvider} from "react-router";
import {createBrowserRouter} from "react-router-dom";
import HomeScreen from "./screens/Home.tsx";
import {QueryClient, QueryClientProvider} from "react-query";
import RulesScreen from "./screens/Rules.tsx";
import LoginScreen from "./screens/Login.tsx"; // Import LoginScreen
import ProtectedRoute from "./components/common/ProtectedRoute.tsx"; // Import ProtectedRoute

export const queryClient = new QueryClient()

const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedRoute><HomeScreen /></ProtectedRoute> // Wrap with ProtectedRoute
    },
    {
        path: '/rules',
        element: <ProtectedRoute><RulesScreen /></ProtectedRoute> // Wrap with ProtectedRoute
    },
    {
        path: '/snippets/:id',
        element: <ProtectedRoute><HomeScreen /></ProtectedRoute> // Wrap with ProtectedRoute
    },
    {
        path: '/login', // New login route
        element: <LoginScreen />
    }
]);

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    );
}

export default App;
