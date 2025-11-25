import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Loginpage } from './pages/Login-page'
import { Signuppage } from './pages/Signup-page'
import { Matchespage } from './pages/Matches-page'
import { Profilepage } from './pages/ProfileImageUpload-page'
import { Messagespage } from './pages/Messages-page'
import {Userspage } from './pages/Users-page.tsx'


import './App.css' 
import type { ReactElement } from 'react'

function App(): ReactElement {
  
  return(
    <>
      <main>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Loginpage/>} />
        <Route path="/signup" element={<Signuppage/>} />
        <Route path="/matches" element={<Matchespage/>} />
        <Route path="/upload" element={<Profilepage/>} />
          <Route path="/messages" element={<Messagespage/>} />
          <Route path="/users" element={<Userspage/>} />
      </Routes>
    </main>
    </>
  );
}

export default App