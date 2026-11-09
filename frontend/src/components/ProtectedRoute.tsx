import {Navigate, Outlet, useLocation} from "react-router-dom";
import {useAuth} from "../context/AuthContext"

interface Props {
    roles?: string[];
}

export default function ProtectedRoute({roles}: Props) {
    const {user} = useAuth();
    const location = useLocation();

    if(!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname}} />
    }

    if(roles && !roles.some((r) => user.roles.includes(r))) {
        return <p>Nemate pravo pristupa ovoj stranici</p>
    }

    return <Outlet />
}
