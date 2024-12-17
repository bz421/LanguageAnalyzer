import { Navigate, useNavigate } from "react-router-dom"

export default function Sidebar() {

    const navigate = useNavigate()

    return (
        <div class="sidebar">
            <button onClick={() => navigate('/language/es')}>
                <img src="client/src/Images/spain.png"/>
                Spanish
            </button>

            <button onClick={() => navigate('/language/fr')}>
                <img src="client/src/Images/french.png"/>
                French
            </button>

            <button onClick={() => navigate('/language/zh')}>
                <img src="client/src/Images/china.png"/>
                Mandarin
            </button>

        </div>
    )
}