import '../Styles/Login.css'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react'
import Cookies from 'js-cookie';

const header = import.meta.env.VITE_API_URL;

// Helper to decode JWT and extract user ID
function decodeJWT(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);

        // Log the entire decoded token to see what claims we have
        console.log('Decoded JWT:', decoded);

        return decoded;
    } catch (e) {
        console.error('Failed to decode JWT:', e);
        return null;
    }
}

function Login(): ReactElement {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        Email: '',
        Password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(header+'/Profile/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const token = await response.text();

                // Decode JWT to get user ID
                const decoded = decodeJWT(token);

                if (!decoded) {
                    setError('Failed to decode token');
                    return;
                }

                // Check for user ID in various possible claim names
                const userId = decoded.nameid ||
                    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                    decoded.sub ||
                    decoded.userId;

                console.log('Found user ID:', userId);

                if (userId) {
                    // Store in cookies
                    Cookies.set('token', token, {
                        expires: 1/48,
                        sameSite: 'strict',
                        secure: true
                    });

                    // ALSO store in localStorage for components that use it
                    localStorage.setItem('jwt_token', token);
                    localStorage.setItem('user_id', userId);

                    console.log('✅ Login successful. User ID:', userId);
                    navigate('/matches');
                } else {
                    console.error('No user ID found in token. Available claims:', Object.keys(decoded));
                    setError('Invalid token: No user ID found');
                }
            } else {
                setError('There was a problem logging in. Please try again.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='login-page'>
            <div className="login-box">
                <h1 className='logo-login'>MyPlace</h1>
                <h1 className='login-text'>Welcome back.</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="Password"
                        value={formData.Password}
                        onChange={handleChange}
                        required
                    />
                    <div className="error-container">
                        {error && <p style={{ color: 'red', fontSize: '14px'}}>{error}</p>}
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="signup-section">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;