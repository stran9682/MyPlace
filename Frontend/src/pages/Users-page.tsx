import Headermain from '../Components/Header-main'
import UserList from '../Components/UserList'

export const Userspage = () => {
    return (
        <div className="users-page">
            <Headermain />
            <UserList />
        </div>
    );
}