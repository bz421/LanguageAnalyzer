import React, {useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom';
import './styles.css'

import Sidebar from '../Components/Sidebar'
import SentenceWrapper from '../Components/SentenceWrapper'
import Alert from '@mui/material/Alert'

export default function Page() {
    const [msg, setMsg] = useState('')
    const [translation, setTranslation] = useState('')
    const [input, setInput] = useState('')

    // const [subjs, setSubjs] = useState([])
    // const [verbs, setVerbs] = useState([])
    // const [adjs, setAdjs] = useState('')
    // const [objs, setObjs] = useState('')

    const [data, setData] = useState([])

    // const [pinyin, setPinyin] = useState([])
    // const [chengyu, setChengyu] = useState([])
    // const [baConstructions, setBaConstructions] = useState([])
    // const [beiConstructions, setBeiConstructions] = useState([])
    // const [particles, setParticles] = useState([])

    const [wrongLang, setWrongLang] = useState(false)
    const [actualLang, setActualLang] = useState('')
    const {lang} = useParams()

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const trimmedInput = input.trim()
        setInput(trimmedInput)

        getTranslation(trimmedInput)
        getData(trimmedInput)
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
        if (data.language === 'zh-CN' || data.language === 'zh-TW') data.language = 'zh'
        console.log(data)
        setTranslation(data.result)
        setActualLang(data.language)
        setWrongLang(data.language !== lang)
    }

    const getData = async (trimmedInput) => {
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

    const map = {'es': 'Spanish', 'fr': 'French', 'zh': 'Chinese'}
    return (
        <div>
            <Sidebar />
            {/*<p>{msg}</p>*/}
            <div className="page">
                <div className="instruction">
                    Enter a {lang} text to analyze!
                    {wrongLang && ['es', 'fr', 'zh'].includes(actualLang) ? (
                        <Alert sx={{marginTop: '10px'}} severity="warning">Wrong language detected. Did you mean to check out our <a href={`/language/${actualLang}`}>{map[actualLang]}</a> tool?</Alert>
                    ) : (
                        <></>
                    )}
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

                {data && Object.keys(data).length > 0 && (
                    <div style={{textAlign: 'center'}}>
                        <h1>Wrapper</h1>
                        <SentenceWrapper data={data} lang={lang}></SentenceWrapper>
                    </div>
                )}

                <h4>Full data(check console)</h4>
                {/*<p>{JSON.stringify(data, null, 2)}</p>*/}

                <div className="menu">
                    <button onClick={() => navigate('/')}>Home</button>
                </div>
            </div>
        </div>
    )
}