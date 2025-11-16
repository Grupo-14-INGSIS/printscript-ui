import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // Reutilizar estilos

export const SignupForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/dbconnections/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
                    email: email,
                    password: password,
                    connection: 'User-Pass-Auth', // Tu conexión
                    name: name,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.description || 'Signup failed');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <h2> Account Created!</h2>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Create Account</h2>
                <p className="login-subtitle">Sign up for Printscript</p>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            ️ {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your-email@example.com"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                        <small style={{ color: '#666', fontSize: '0.85rem' }}>
                            Min 8 characters, including uppercase, lowercase, and numbers
                        </small>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="login-button"
                    >
                        {isLoading ? 'Creating account...' : 'Sign Up'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
                        Already have an account?{' '}
                        <a href="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
                            Log in
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};