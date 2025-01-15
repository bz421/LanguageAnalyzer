import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom';
import './styles.css'
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

export default function Home() {
    const [msg, setMsg] = useState('')
    const navigate = useNavigate()
    const getMessage = async () => {
        await fetch('/api/hello').then(
            res => res.json()
        ).then(
            data => {
                setMsg(data.message)
                console.log(data.message)
            }
        )
    }


    useEffect(() => {
        getMessage()
    }, [])
    return (
        <div>
            {/*<Navbar/>*/}
            <div className="menu">
                <button onClick={() => navigate('/language/es/')}>Spanish</button>
                <button onClick={() => navigate('/language/fr')}>French</button>
                <button onClick={() => navigate('/language/zh')}>Mandarin</button>
            </div>
            {/*<Sidebar/>*/}
        </div>
    )
}