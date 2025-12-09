import { createRoute, type AnyRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default (parent: AnyRoute) => createRoute({
    path: '/logout',
    getParentRoute: () => parent,
    component: LogoutPage,
})

function LogoutPage() {
    const { logout } = useAuth();
    useEffect(() => {
        logout();
        window.location.href = '/';
    }, [logout]);
    return null;
}