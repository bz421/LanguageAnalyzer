import React, {useState, useEffect} from 'react'

export default function Home() {
    const [msg, setMsg] = useState('')
    const [translation, setTranslation] = useState('')
    const [lang, setLang] = useState('')
    const [input, setInput] = useState('')

    const handleSubmit = async(e) => {
        e.preventDefault()
        await getTranslation()
    }

    const getTranslation = async () => {
        const response = await fetch('/api/translate', {
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
        </div>
    )
}