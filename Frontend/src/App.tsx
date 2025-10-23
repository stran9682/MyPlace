import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './pages/home'

import signalRService from "../services/SignalRService";
await signalRService.StartConnection()

function App() {

  return <>
    <nav>
      {/*Nav goes here*/}
    </nav>

    <main>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </main>

  </>
}

export default App
