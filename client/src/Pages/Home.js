import React, {useState, useEffect} from 'react'

export default function Home() {
    const [msg, setMsg] = useState('')
    const [translation, setTranslation] = useState('')
    const [lang, setLang] = useState('')
    const [input, setInput] = useState('')
    const [subjs, setSubjs] = useState([])
    const [verbs, setVerbs] = useState([])
    const [adjs, setAdjs] = useState('')

    const handleSubmit = async(e) => {
        e.preventDefault()
        await testspacy()
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

    const testspacy = async () => {
        const response = await fetch('api/testspacy', {
            method: 'POST',
            
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        console.log(data.tokens)
        setTranslation(data.tokens.tokenPos)
        // setLang(data.language)
    }

<<<<<<< HEAD
    const getSubject = async () => {
        const response = await fetch('api/getSubj', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
=======
    const testspacy = async () => {
        const response = await fetch('api/testspacy', {
            method: 'POST',
            
>>>>>>> ac0fdf1 (Stashing)
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
<<<<<<< HEAD
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
=======
        console.log(data.tokens)
        setTranslation(data.tokens.tokenPos)
        // setLang(data.language)
>>>>>>> ac0fdf1 (Stashing)
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
<<<<<<< HEAD
            {/* <p>English Translation: {translation}</p>
            <p>Detected Language: {lang}</p> */}

            {/* {console.log(tokens['tokenText'])}/ */}
            <p>Detected Subjects: <b>{subjs}</b></p>
            <p>Detected Verb Phrases: <b>{verbs}</b></p>
            <p>Detected Adjectival Phrases: <b>{adjs}</b></p>
=======
            {/* <p>English Translation: {translation}</p>
            <p>Detected Language: {lang}</p> */}

            {/* {console.log(tokens['tokenText'])}/ */}
>>>>>>> ac0fdf1 (Stashing)
        </div>
    )
}