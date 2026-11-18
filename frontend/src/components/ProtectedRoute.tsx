import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card, EmptyState } from "./ui";
import { buttonClass } from "./styles";

interface Props {
    roles?: string[];
}

export default function ProtectedRoute({ roles }: Props) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (roles && !roles.some((r) => user.roles.includes(r))) {
        return (
            <Card className="mx-auto max-w-lg">
                <EmptyState
                    icon={ShieldAlert}
                    title="Nemate pravo pristupa"
                    description="Ova stranica je dostupna samo korisnicima sa odgovarajućom ulogom."
                    action={<Link to="/" className={buttonClass("secondary")}>Nazad na početnu</Link>}
                />
            </Card>
        );
    }

    return <Outlet />;
}
