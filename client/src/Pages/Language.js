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

    const [data, setData] = useState([])

    const [pinyin, setPinyin] = useState([])
    const [chengyu, setChengyu] = useState([])
    const [baConstructions, setBaConstructions] = useState([])
    const [beiConstructions, setBeiConstructions] = useState([])
    const [particles, setParticles] = useState([])

    const {lang} = useParams()

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const trimmedInput = input.trim()
        setInput(trimmedInput)

        getTranslation(trimmedInput)
        // getSubject(trimmedInput)
        // getVerbs(trimmedInput)
        // getAdjs(trimmedInput)

        // IE = indo-european, Spanish and French only
        if (lang !== 'zh') {
            getIEData(trimmedInput)
        }

        if (lang === 'zh') {
            pinyinize(trimmedInput)
            getChengyu(trimmedInput)
            getBaConstructions(trimmedInput)
            getBeiConstructions(trimmedInput)
            getParticles(trimmedInput)
        }
    }

    const getTranslation = async (trimmedInput) => {
        const response = await fetch(`/api/translate`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
        console.log(data.result)
        setTranslation(data.result)
    }

    const getIEData = async (trimmedInput) => {
        const response = await fetch(`/api/${lang}/getData`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
        console.log('Final data: ' + JSON.stringify(data, null, 2))
        setData(data)
    }

    const pinyinize = async (trimmedInput) => {
        const response = await fetch(`/api/zh/pinyin`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
        console.log(data.pinyin)
        setPinyin(data.pinyin)
    }

    /*
        JSON object key name: 'baConstructions'
        @return JSON object with key 'baConstructions' and value as an array of dictionary of tuples
        Each array element is one dictionary in the format of
        {'object': (text, beginIndex, endIndex), 'subject': (text, beginIndex, endIndex), 'verb': (text, beginIndex, endIndex)}

     */
    const getBaConstructions = async (trimmedInput) => {
        console.log('Ba input: ' + input)
        const response = await fetch(`/api/zh/getBaConstructions`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
        let out = ''
        for (let i = 0; i < data.baConstructions.length; i++) {
            out += 'Object: ' + data.baConstructions[i]['object'] + ', '
            out += 'Subject: ' + data.baConstructions[i]['subject'] + ', '
            out += 'Verb: ' + data.baConstructions[i]['verb'] + '\n'
        }
        setBaConstructions(out)
    }

    /*
        JSON object key name: 'beiConstructions'
        @return JSON object with key 'beiConstructions' and value as an array of dictionary of tuples
        Each array element is one dictionary in the format of
        {'object': (text, beginIndex, endIndex), 'subject': (text, beginIndex, endIndex), 'verb': (text, beginIndex, endIndex)}

     */
    const getBeiConstructions = async (trimmedInput) => {
        const response = await fetch(`/api/zh/getBeiConstructions`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
        let out = ''
        for (let i = 0; i < data.beiConstructions.length; i++) {
            out += 'Object: ' + data.beiConstructions[i]['object'] + ', '
            out += 'Subject: ' + data.beiConstructions[i]['subject'] + ', '
            out += 'Verb: ' + data.beiConstructions[i]['verb'] + '\n'
        }
        setBeiConstructions(out)
    }

    const getParticles = async (trimmedInput) => {
        const response = await fetch(`/api/zh/getParticles`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
        let out = ''
        for (let i = 0; i < data.particles.length - 1; i++) {
            out += data.particles[i] + ', '
        }
        out += data.particles[data.particles.length - 1]
        setParticles(out)
    }

    /*
        JSON object key name: 'subjects'
        @return JSON object with key 'subjects' and value as an array of tuples.
                Tuple format: (subject, beginIndex, endIndex)
     */
    const getSubject = async (trimmedInput) => {
        const response = await fetch(`/api/${lang}/getSubj`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
        let out = ''
        for (let i = 0; i < data.subjects.length - 1; i++) {
            out += data.subjects[i] + ', '
        }
        out += data.subjects[data.subjects.length - 1]
        setSubjs(out)
    }

    /*
        JSON object key name: 'verbs'
        @return
        Spanish and French: JSON object (key, value) pair.
              - Each key contains tuple of (verb, index)
              - Each value contains tuple in the format (form, mood, tense, person, number of people)
        Chinese: JSON object with key 'verbs' and value as an array of tuples.
                 Tuple format: (verbPhrase, beginIndex, endIndex)

     */
    const getVerbs = async (trimmedInput) => {
        const response = await fetch(`/api/${lang}/getVerb`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
        let out = ''
        if (lang !== 'zh') {
            for (let i = 0; i < data.verbs.length; i++) {
                const key = data.verbs[i]['key']
                const value = data.verbs[i]['value']
                out += key + ': ' + value + "    "
            }
        } else {
            for (let i = 0; i < data.verbs.length - 1; i++) {
                out += data.verbs[i] + ', '
            }
            out += data.verbs[data.verbs.length - 1]
        }
        setVerbs(out)
    }

    /*
        JSON object key name: 'adjectives'
        @return JSON object with key 'adjectives' and value as an array of tuples.
                Tuple contains: (adjectivePhrase, beginIndex, endIndex)
     */
    const getAdjs = async (trimmedInput) => {
        const response = await fetch(`/api/${lang}/getAdj`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
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
    const getObjs = async (trimmedInput) => {
        const response = await fetch(`/api/${lang}/getObj`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json()
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
    const getChengyu = async (trimmedInput) => {
        const response = await fetch(`/api/zh/getChengyu`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
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
            <div className="page">
                <div className="instruction">
                    Enter a {lang} text to analyze!
                </div>
                <form onSubmit={handleSubmit}>
                    <input className="text-box"
                           type="text"
                           value={input}
                           onChange={(e) => setInput((e.target.value))}
                           placeholder="Enter a message"
                    />
                    <button type="submit">Analyze</button>
                </form>
                <p>English Translation: {translation}</p>
                <p>Detected Language: {lang}</p>
                {(lang === 'zh') && <p>Pinyin: <b>{pinyin}</b></p>}
                <p>Detected Subjects: <b>{subjs}</b></p>
                <p>Detected Verb Phrases: <b>{verbs}</b></p>
                <p>Detected Adjectival/Adverbial Phrases: <b>{adjs}</b></p>
                {(lang !== 'zh') && <p>Detected Object Phrases: <b>{objs}</b></p>}
                {(lang !== 'zh') && <p>Verb format goes <b>verb: (form, mood, tense, person, number of people)</b></p>}

                <h4>Full data(check console)</h4>
                <p>{JSON.stringify(data, null, 2)}</p>
                {(lang === 'zh') &&
                    <>
                        <p>Detected Ba(把) Constructions: <b>{baConstructions}</b></p>
                        <p>Detected Bei(被) Constructions: <b>{beiConstructions}</b></p>
                        <p>Detected Particles: <b>{particles}</b></p>
                        <p>Detected Chengyu: <b>{chengyu}</b></p>

                    </>
                }

                <div className="menu">
                    <button onClick={() => navigate('/')}>Home</button>
                </div>
            </div>
        </div>
    )
}