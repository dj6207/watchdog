import React from "react";
import { Link } from "react-router-dom";
import { NavBarProps } from "../../../types";
import '../assets/navBar.css'

export const NavBar: React.FC<NavBarProps> = ({userRoutes}: NavBarProps) => {
    return (
        <nav>
            <ul className="navbar">
                {userRoutes.map((routes) => (
                    <li className="nav-item" key={routes.label}>
                        <Link key={routes.label} to={routes.path}>
                            {routes.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}