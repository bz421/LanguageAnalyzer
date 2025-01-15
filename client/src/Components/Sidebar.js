import {Navigate, useNavigate} from "react-router-dom"
import china from '../Images/china.png';
import france from '../Images/france.png';
import spain from '../Images/spain.png';
import '../Pages/styles.css';

export default function Sidebar() {
    const navigate = useNavigate()
    const reload = (path) => {
        navigate(path);
        window.location.reload();
    }
    return (
        <div className="sidebar">
            <button className="flag-button" onClick={() => reload('/language/es')}>
                <img className="flag-icon" src={spain} />
                Spanish
            </button>

            <button className="flag-button" onClick={() => reload('/language/fr')}>
                <img className="flag-icon" src={france} />
                French
            </button>

            <button className="flag-button" onClick={() => reload('/language/zh')}>
                <img className="flag-icon" src={china} />
                Mandarin
            </button>
        </div>
    )
}