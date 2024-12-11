import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import './styles.css'

export default function Home() {
    const [msg, setMsg] = useState('')
    const [translation, setTranslation] = useState('')
    const [lang, setLang] = useState('')
    const [input, setInput] = useState('')
    const [subjs, setSubjs] = useState([])
    const [verbs, setVerbs] = useState([])
    const [adjs, setAdjs] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async(e) => {
        e.preventDefault()
        getTranslation()
        getSubject()
        getVerbs()
        getAdjs()
    }

    const getTranslation = async () => {
        const response = await fetch('api/translate', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        console.log(data.result)
        setTranslation(data.result)
        setLang(data.language)
    }

    const getSubject = async () => {
        const response = await fetch('api/getSubj', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        console.log('Subjects: ' + data.subjects)
        let out = ''
        for (let i=0; i<data.subjects.length-1; i++) {
            out += data.subjects[i] + ', '
        }
        out += data.subjects[data.subjects.length-1]
        setSubjs(out)
    }

    const getVerbs = async () => {
        const response = await fetch('api/getVerb', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        console.log('Verbs: ' + data.verbs)
        let out = ''
        for (let i=0; i<data.verbs.length-1; i++) {
            out += data.verbs[i] + ', '
        }
        out += data.verbs[data.verbs.length-1]
        setVerbs(out)
    }

    const getAdjs = async () => {
        const response = await fetch('api/getAdj', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        console.log('Adjs: ' + data.adjectives)
        let out = ''
        for (let i=0; i<data.adjectives.length-1; i++) {
            out += data.adjectives[i] + ', '
        }
        out += data.adjectives[data.adjectives.length-1]
        setAdjs(out)
    }

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

            <div class="menu">
                <button onClick={() => navigate('/spanish/')}>Spanish</button>
                <button onClick={() => navigate('/french/')}>French</button>
                <button onClick={() => navigate('/mandarin/')}>Mandarin</button>


            </div>
        </div>
    )
}