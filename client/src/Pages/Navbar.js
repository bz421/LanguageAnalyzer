import { Navigate, useNavigate } from "react-router-dom"

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <div class="navbar">
            <p>Language Analyzer</p>
        </div>
    )
}