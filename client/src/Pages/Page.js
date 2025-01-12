import React, {useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom';
import './styles.css'

export default function Page() {
    const [msg, setMsg] = useState('')
    const [translation, setTranslation] = useState('')
    const [input, setInput] = useState('')
    const [subjs, setSubjs] = useState([])
    const [verbs, setVerbs] = useState([])
    const [adjs, setAdjs] = useState('')
<<<<<<<< HEAD:client/src/Pages/Page.js
========
    const [objs, setObjs] = useState('')

    const {lang} = useParams()

>>>>>>>> ea4548e87b1ef6e782aa110113b400c80d5ac592:client/src/Pages/Language.js
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        getTranslation()
        getSubject()
        getVerbs()
        getAdjs()
<<<<<<<< HEAD:client/src/Pages/Page.js
    }

    const getTranslation = async () => {
        const response = await fetch('api/translate', {
========
        getObjs()
        getTrees()
    }

    const getTranslation = async () => {
        const response = await fetch(`/api/translate`, {
>>>>>>>> ea4548e87b1ef6e782aa110113b400c80d5ac592:client/src/Pages/Language.js
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
<<<<<<<< HEAD:client/src/Pages/Page.js
        const response = await fetch('api/getSubj', {
========
        const response = await fetch(`/api/${lang}/getSubj`, {
>>>>>>>> ea4548e87b1ef6e782aa110113b400c80d5ac592:client/src/Pages/Language.js
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
        for (let i = 0; i < data.subjects.length - 1; i++) {
            out += data.subjects[i] + ', '
        }
        out += data.subjects[data.subjects.length - 1]
        setSubjs(out)
    }

    const getVerbs = async () => {
<<<<<<<< HEAD:client/src/Pages/Page.js
        const response = await fetch('api/getVerb', {
========
        const response = await fetch(`/api/${lang}/getVerb`, {
>>>>>>>> ea4548e87b1ef6e782aa110113b400c80d5ac592:client/src/Pages/Language.js
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
<<<<<<<< HEAD:client/src/Pages/Page.js
        for (let i=0; i<data.verbs.length-1; i++) {
            out += data.verbs[i] + ', '
========
        for (let i = 0; i < data.verbs.length; i++) {
            const key = data.verbs[i]['key']
            const value = data.verbs[i]['value']
            out += key + ': ' + value + "    "
>>>>>>>> ea4548e87b1ef6e782aa110113b400c80d5ac592:client/src/Pages/Language.js
        }
        out += data.verbs[data.verbs.length-1]
        setVerbs(out)
    }

    const getAdjs = async () => {
<<<<<<<< HEAD:client/src/Pages/Page.js
        const response = await fetch('api/getAdj', {
========
        const response = await fetch(`/api/${lang}/getAdj`, {
>>>>>>>> ea4548e87b1ef6e782aa110113b400c80d5ac592:client/src/Pages/Language.js
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
        for (let i = 0; i < data.adjectives.length - 1; i++) {
            out += data.adjectives[i] + ', '
        }
        out += data.adjectives[data.adjectives.length - 1]
        setAdjs(out)
    }

<<<<<<<< HEAD:client/src/Pages/Page.js
========
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
        const response = await fetch(`/api/${lang}/getObj`, {
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

>>>>>>>> ea4548e87b1ef6e782aa110113b400c80d5ac592:client/src/Pages/Language.js
    const getMessage = async () => {
        await fetch(`/api/hello`).then(
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
<<<<<<<< HEAD:client/src/Pages/Page.js

    return (
        <div class="page">
            <div class="instruction">
                Enter a Spanish text to analyze!
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
            <p>Detected Language: {lang}</p>
            <p>Detected Subjects: <b>{subjs}</b></p>
            <p>Detected Verb Phrases: <b>{verbs}</b></p>
            <p>Detected Adjectival Phrases: <b>{adjs}</b></p>

            <p>hola este es Español</p>
========

    return (
        <div>
            <p>{msg}</p>
            <div class="page">
                <div class="instruction">
                    Enter a {lang} text to analyze!
                </div>
                <form onSubmit={handleSubmit}>
                    <input class="text-box"
                           type="text"
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                           placeholder="Enter a message"
                    />
                    <button type="submit">Analyze</button>
                </form>
                <p>English Translation: {translation}</p>
                <p>Detected Language: {lang}</p>
                <p>Detected Subjects: <b>{subjs}</b></p>
                <p>Detected Verb Phrases: <b>{verbs}</b></p>
                <p>Detected Adjectival/Adverbial Phrases: <b>{adjs}</b></p>
                <p>Detected Object Phrases: <b>{objs}</b></p>
                <p>Verb format goes <b>verb: (form, mood, tense, person, number of people)</b></p>

                <div class="menu">
                    <button onClick={() => navigate('/')}>Home</button>
                </div>
            </div>
>>>>>>>> ea4548e87b1ef6e782aa110113b400c80d5ac592:client/src/Pages/Language.js
        </div>
    )
}