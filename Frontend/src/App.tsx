import { Route, Routes, useNavigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Loginpage } from './pages/Login-page'
import { Signuppage } from './pages/Signup-page'
import { Matchespage } from './pages/Matches-page'
import { Profilepage } from './pages/ProfileImageUpload-page'
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'
import Header from './Components/Header'
import Headermain from './Components/Header-main'


import './App.css' 
import type { ReactElement } from 'react'

function App(): ReactElement {
  const [jwt, setJwt] = useState<string | null>(localStorage.getItem('jwtToken'));
  const navigate = useNavigate();

  // clearing out any expired cookies
  useEffect(() => {
    if (jwt == null) {
      return;
    } 

    const decodedToken = jwtDecode(jwt);

    if (decodedToken.exp! <  Date.now() / 1000){
      localStorage.removeItem('jwtToken');
      setJwt(null)
    }
  }, []);

  const handleLogout = () => {
    navigate("/");
    localStorage.removeItem('jwtToken');
    setJwt(null);
  };

  return(
    <>
      {!jwt ? <Header/> : <Headermain handleLogout={handleLogout}/>}

      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Loginpage setJwt={setJwt}/>} />
          <Route path="/signup" element={<Signuppage/>} />
          <Route path="/matches" element={<Matchespage/>} />
          <Route path="/upload" element={<Profilepage/>} />
        </Routes>
      </main>
    </>
  );
}

export default App