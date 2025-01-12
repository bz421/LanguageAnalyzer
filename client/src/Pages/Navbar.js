import { Navigate, useNavigate } from "react-router-dom"

export default function Navbar(props) {
    const navigate = useNavigate();

    return (
        <div class="navbar" style={props.style}>
            <p>Language Analyzer</p>
        </div>
    )
}