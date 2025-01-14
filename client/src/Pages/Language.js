import React, {useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom';
import './styles.css'

export default function Page() {
    const [msg, setMsg] = useState('')
    const [translation, setTranslation] = useState('')
    const [input, setInput] = useState('')
    const [hasInput, setHasInput] = useState(false)
    const [showResult, setShowResult] = useState(false);


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

    const {lang} = useParams()

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const trimmedInput = input.trim()
        setInput(trimmedInput)

        getTranslation(trimmedInput)
        getData(trimmedInput)

        setShowResult(true);
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

    const handleInputChange = (e) => {
        const value = e.target.value
        setInput(value)
        if(value.trim().length == 0) {
            setHasInput(false)
            setShowResult(false)
        } else {
            setHasInput(true)
        }
        
    }

    useEffect(() => {
        getMessage()
    }, [])

    return (
        <div>
            <p>{msg}</p>
            <div className="page">
                
                
                {/* <p>Detected Language: {lang}</p> */}

                {
                    (hasInput & showResult) ?
                    (   
                        <div
                            style={{justifyContent : 'center'}}
                        >
                            <div class="text-display">
                                {input}
                            </div>
                            <div class="result">
                                <p>English Translation: {translation}</p>
                                <h4>Full data(check console)</h4>
                                <p>{JSON.stringify(data, null, 2)}</p>
                            </div>
                            
                        </div>
                    )
                    :
                    (
                        <div
                        style={{alignItems : 'center'}}>
                            <div class="instruction">
                                Spanish Sentence Analyzer
                                <p/>
                                Enter a {lang} text to analyze!
                                
                            </div>

                            <div class="text-box-container">
                                <form onSubmit={handleSubmit}>
                                    <textarea className="text-box"
                                        type="text"
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Enter a message"
                                    ></textarea>
                                    <button
                                        type="submit"
                                        style={{
                                            backgroundColor : hasInput
                                                ? 'rgb(239, 185, 79)'
                                                : 'rgb(244, 215, 157)',
                                        }}
                                    >Analyze</button>
                                </form>
                            </div>
                        </div>
                    )

                }
                

                <div className="menu">
                    <button onClick={() => navigate('/')}>Home</button>
                </div>
            </div>
        </div>
    )
}