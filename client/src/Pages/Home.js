import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import './styles.css'

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
        <div style={{'display': 'flex', 'flexDirection': 'column', 'justifyContent': 'center', 'alignItems': 'center'}}>
            <h1>Backend says</h1>
            <p>{msg}</p>

            <div class="menu">
                <button onClick={() => navigate('/spanish/')}>Spanish</button>
                <button onClick={() => navigate('/french/')}>French</button>
                <button onClick={() => navigate('/mandarin/')}>Mandarin</button>
            </div>
        </div>
    )
}