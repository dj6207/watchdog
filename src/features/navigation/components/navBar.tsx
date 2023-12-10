import React from "react";
import { Link } from "react-router-dom";
import { NavBarProps } from "../../../types";

export const NavBar: React.FC<NavBarProps> = ({userRoutes}: NavBarProps) => {
    return (
        <nav>
            <ul>
                {userRoutes.map((routes) => (
                    <li key={routes.label}>
                        <Link key={routes.label} to={routes.path}>
                            {routes.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}