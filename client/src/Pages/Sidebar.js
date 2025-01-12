import {Navigate, useNavigate} from "react-router-dom"
import china from '../Images/china.png';
import france from '../Images/france.png';
import spain from '../Images/spain.png';

export default function Sidebar() {

    const navigate = useNavigate()

    return (
        <div class="sidebar">
            <button onClick={() => navigate('/language/es')}>
                <img src={spain} style={{'width': '50px', 'height': '50px'}}/>
                Spanish
            </button>

            <button onClick={() => navigate('/language/fr')}>
                <img src={france} style={{'width': '50px', 'height': '50px'}}/>
                French
            </button>

            <button onClick={() => navigate('/language/zh')}>
                <img src={china} style={{'width': '50px', 'height': '50px'}}/>
                Mandarin
            </button>
        </div>
    )
}