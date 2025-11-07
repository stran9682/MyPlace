import '../Styles/Signup.css'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'


function Signup(): ReactElement {

    return (
        <div className='signup-page'>
            <div className="signup-box">
                <h1 className='logo-signup'>MyPlace</h1>
                <h1 className='signup-text'>Find a roommate today.</h1>
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
                        <button type="submit">Join MyPlace</button>
                </form>
                <div className="login-section">
                        Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;