import '../Styles/Login.css'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'


function Login(): ReactElement {

    return (
        <div className='login-page'>
            <div className="login-box">
                <h1 className='logo-login'>MyPlace</h1>
                <h1 className='login-text'>Welcome back.</h1>
                <form>
                    <input 
                            type="email" 
                            placeholder="Email"
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Password"
                            required 
                        />
                        <button type="submit">Login</button>
                </form>
                <div className="signup-section">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;