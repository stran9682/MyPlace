import { Route, Routes } from 'react-router-dom'
import Header from './Components/Header'
import { Home } from './pages/Home'
import './App.css'
import type { ReactElement } from 'react'

function App(): ReactElement {
  
  return(
    <>
      <Header />
      
      <main>
      <Routes>
        <Route path="/" element={<Home/>} />
      </Routes>
    </main>
    </>
  );
}

export default App