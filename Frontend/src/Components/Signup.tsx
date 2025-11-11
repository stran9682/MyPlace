import '../Styles/Signup.css'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react'

const header = import.meta.env.VITE_API_URL;

function Signup(): ReactElement {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        Email: '',
        Password: '',
        FirstName: '',
        LastName: '',
        UserName: '',
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
            const response = await fetch(header+'/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'There was a problem with signing up. Please try again.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='signup-page'>
            <div className="signup-box">
                <h1 className='logo-signup'>MyPlace</h1>
                <h1 className='signup-text'>Find a roommate today.</h1>
                <form onSubmit={handleSubmit}>
                    <div className="name-container">
                        <div className="firstNameInput">
                            <input 
                                placeholder="First Name"
                                name="FirstName"
                                value={formData.FirstName}
                                onChange={handleChange}
                                required 
                            /> 
                        </div>
                        <div className="lastNameInput">
                            <input
                                placeholder="Last Name"
                                name="LastName"
                                value={formData.LastName}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>
                    <input className="usernameInput"
                        placeholder="Username"
                        name="UserName"
                        value={formData.UserName}
                        onChange={handleChange}
                        required 
                    />
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
                        {isLoading ? 'Creating Account...' : 'Join MyPlace'}
                    </button>
                </form>
                
                <div className="login-section">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;