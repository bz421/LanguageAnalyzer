import React, {useState, useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import './styles.css'

export default function Language() {
    const { lang } = useParams()
    const [msg, setMsg] = useState('')
    const [translation, setTranslation] = useState('')
    // const [lang, setLang] = useState('')
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
        getObjs()
        getTrees()
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

    const getTrees = async () => {
        const response = await fetch('/api/getTree', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        console.log('Trees: ' + data)
    }

    const getObjs = async () => {
        const response = await fetch('/api/getObj', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        console.log('Objs: ' + JSON.stringify(data.objects))
        let out = ''
        for (let i = 0; i < data.objects.length; i++) {
            const key = data.objects[i]['key']
            const value = data.objects[i]['value']
            out += key + ': ' + value + "    "
        }
        // out += data.objects[data.objects.length-1]
        setObjs(out)
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
        <div class="page">
            <div class="instruction">
                Enter a {lang} text to analyze!
            </div>
            <form  onSubmit={handleSubmit}>
                <input class="text-box"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter a message"
                />
                <button type="submit">Analyze</button>
            </form>
            <p>English Translation: {translation}</p>
            <p>Detected Subjects: <b>{subjs}</b></p>
            <p>Detected Verb Phrases: <b>{verbs}</b></p>
            <p>Detected Adjectival Phrases: <b>{adjs}</b></p>
        </div>

        
    )
}