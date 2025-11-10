import '../Styles/Signup.css'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import {useState} from 'react'


function Signup(): ReactElement {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 

        try {
            const response = await fetch('http://localhost:8080/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const text = await response.text();

            if (response.ok) {
                setMessage('✅ Signup successful!');
            } else {
                setMessage(`❌ Signup failed: ${text}`);
            }
        } catch (err) {
            console.error('Signup error:', err);
            setMessage('⚠️ Could not connect to the server.');
        }
    };
    
    
    
    
    return (
        <div className='signup-page'>
            <div className="signup-box">
                <h1 className='logo-signup'>MyPlace</h1>
                <h1 className='signup-text'>Find a roommate today.</h1>
                
                <form onSubmit={handleSubmit}>
                    <input 
                            type="email" 
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        <button type="submit">Join MyPlace</button>
                </form>
                {message && <p className="signup-message">{message}</p>}
                
                <div className="login-section">
                        Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;