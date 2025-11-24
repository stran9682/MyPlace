import Header from '../Components/Header'
import LandingContent from '../Components/LandingContent'

import signalRService from "../../services/SignalRService";
//await signalRService.StartConnection()

export const Home = () => {
    return <>
      <Header />
      <LandingContent />
  </>
}
