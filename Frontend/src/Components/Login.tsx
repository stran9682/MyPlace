import '../Styles/Login.css'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react'
import signalRService from "../../services/SignalRService";


const header = import.meta.env.VITE_API_URL;

const Login = ({setJwt} : {setJwt : (jwt : string) => void}) => {
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
                localStorage.setItem('jwtToken', token);
                setJwt(token)

                signalRService.StartConnection(token);
                
                navigate('/matches');
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