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
    const [objs, setObjs] = useState('')

    const [pinyin, setPinyin] = useState([])
    const [chengyu, setChengyu] = useState([])
    const [ba, setBa] = useState([])
    const [bei, setBei] = useState([])
    const [particles, setParticles] = useState([])

    const {lang} = useParams()

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        getTranslation()
        getSubject()
        getVerbs()
        getAdjs()

        if (lang !== 'zh') {
            getObjs()
        }
        if (lang === 'zh') {
            pinyinize()
            getChengyu()
            // getBa()
            // getBei()
            // getParticles()
        }
    }

    const getTranslation = async () => {
        const response = await fetch(`/api/translate`, {
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

    const pinyinize = async () => {
        const response = await fetch(`/api/zh/pinyin`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        console.log(data.pinyin)
        setPinyin(data.pinyin)
    }

    /*
        JSON object key name: 'subjects'
        @return JSON object with key 'subjects' and value as an array of tuples.
                Tuple format: (subject, beginIndex, endIndex)
     */
    const getSubject = async () => {
        const response = await fetch(`/api/${lang}/getSubj`, {
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

    /*
        JSON object key name: 'verbs'
        @return JSON object (key, value) pair.
              - Each key contains tuple of (verb, index)
              - Each value contains tuple in the format (form, mood, tense, person, number of people)
     */
    const getVerbs = async () => {
        const response = await fetch(`/api/${lang}/getVerb`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        console.log('Verbs: ' + JSON.stringify(data.verbs))
        let out = ''
        for (let i = 0; i < data.verbs.length; i++) {
            const key = data.verbs[i]['key']
            const value = data.verbs[i]['value']
            out += key + ': ' + value + "    "
        }
        setVerbs(out)
    }

    /*
        JSON object key name: 'adjectives'
        @return JSON object with key 'adjectives' and value as an array of tuples.
                Tuple contains: (adjectivePhrase, beginIndex, endIndex)
     */
    const getAdjs = async () => {
        const response = await fetch(`/api/${lang}/getAdj`, {
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

    /*
        JSON object key name: 'objects'
        @return JSON object (key, value) pair.
              - Each key contains tuple of (verb, index)
              - Each value contains list of tuples of (object, beginIndex, endIndex)
     */
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

    /*
        @return JSON object with key 'chengyu' and value as an array of dicts. Dict contains:
                'chengyu_sim': string, 'Pinyin': string, 'Meaning': string
     */
    const getChengyu = async () => {
        const response = await fetch(`/api/zh/getChengyu`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': input
            })
        })
        const data = await response.json()
        let out = ''
        for (let i = 0; i < data.chengyu.length; i++) {
            out += data.chengyu[i]['chengyu_sim'] + ' ' + data.chengyu[i]['Pinyin'] + ' ' + data.chengyu[i]['Meaning'] + '\n'
        }
        setChengyu(out)
    }

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
                { (lang === 'zh') && <p>Pinyin: <b>{pinyin}</b></p> }
                <p>Detected Subjects: <b>{subjs}</b></p>
                <p>Detected Verb Phrases: <b>{verbs}</b></p>
                <p>Detected Adjectival/Adverbial Phrases: <b>{adjs}</b></p>
                { (lang !== 'zh') && <p>Detected Object Phrases: <b>{objs}</b></p> }
                { (lang !== 'zh') && <p>Verb format goes <b>verb: (form, mood, tense, person, number of people)</b></p> }

                { (lang === 'zh') &&
                    <p>Detected Chengyu: <p>{chengyu}</p></p>
                }

                <div class="menu">
                    <button onClick={() => navigate('/')}>Home</button>
                </div>
            </div>
        </div>
    )
}