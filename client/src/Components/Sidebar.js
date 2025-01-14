import {Navigate, useNavigate} from "react-router-dom"
import china from '../Images/china.png';
import france from '../Images/france.png';
import spain from '../Images/spain.png';
import '../Pages/styles.css';

export default function Sidebar() {
    const navigate = useNavigate()

    return (
        <div className="sidebar">
            <button className="flag-button" onClick={() => {
                navigate('/language/es')
                window.location.reload()
            }}>
                <img className="flag-icon" src={spain} />
                Spanish
            </button>

            <button className="flag-button" onClick={() => {
                navigate('/language/fr')
                window.location.reload()
            }}>
                <img className="flag-icon" src={france} />
                French
            </button>

            <button className="flag-button" onClick={() => {
                navigate('/language/zh')
                window.location.reload()
            }}>
                <img className="flag-icon" src={china} />
                Mandarin
            </button>
        </div>
    )
}