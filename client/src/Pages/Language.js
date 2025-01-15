import React, {useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom';
import './styles.css'

import SentenceWrapper from '../Components/SentenceWrapper'

export default function Page() {
    const [msg, setMsg] = useState('')
    const [translation, setTranslation] = useState('')
    const [input, setInput] = useState('')

    // const [subjs, setSubjs] = useState([])
    // const [verbs, setVerbs] = useState([])
    // const [adjs, setAdjs] = useState('')
    // const [objs, setObjs] = useState('')

    const [data, setData] = useState([])
    const [correction, setCorrection] = useState('')


    // const [pinyin, setPinyin] = useState([])
    // const [chengyu, setChengyu] = useState([])
    // const [baConstructions, setBaConstructions] = useState([])
    // const [beiConstructions, setBeiConstructions] = useState([])
    // const [particles, setParticles] = useState([])

    const {lang} = useParams()

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const trimmedInput = input.trim()
        setInput(trimmedInput)

        getTranslation(trimmedInput)
        getData(trimmedInput)
        checkGrammar(trimmedInput)
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

    const checkGrammar = async (trimmedInput) => {
        const response = await fetch(`/api/${lang}/checkGrammar`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'q': trimmedInput
            })
        })
        const data = await response.json();
        console.log('Fixed sentence: ' + JSON.stringify(data.corrected, null, 2))
        setCorrection(data.corrected)
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


                {correction && correction.length > 0 && (
                    <div style={{textAlign: 'center'}}>
                        <h1>Perhaps you meant this?</h1>
                        <p>{correction}</p>
                    </div>
                )}

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