import Login from '../Components/Login'

export const Loginpage = ({setJwt} : {setJwt : (jwt : string) => void}) => {
    return <>
        <Login setJwt={setJwt}/>
  </>
}