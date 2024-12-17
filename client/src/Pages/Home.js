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

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter a message"
                />
                <button type="submit">Send</button>
            </form>
            <p>English Translation: {translation}</p>
            <p>Detected Language: {lang}</p>
            <p>Detected Subjects: <b>{subjs}</b></p>
            <p>Detected Verb Phrases: <b>{verbs}</b></p>
            <p>Detected Adjectival Phrases: <b>{adjs}</b></p>
        </div>
    )
}