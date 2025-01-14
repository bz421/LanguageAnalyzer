import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import './styles.css';

import Sidebar from '../Components/Sidebar';
import SentenceWrapper from '../Components/SentenceWrapper';
import Alert from '@mui/material/Alert';

export default function Page() {
    const [msg, setMsg] = useState('');
    const [translation, setTranslation] = useState('');
    const [input, setInput] = useState('');
    const [hasInput, setHasInput] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [data, setData] = useState([]);
    const [wrongLang, setWrongLang] = useState(false);
    const [actualLang, setActualLang] = useState('');
    const {lang} = useParams();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedInput = input.trim();
        setInput(trimmedInput);

        await getTranslation(trimmedInput);
        await getData(trimmedInput);

        setShowResult(true);
    };

    const getTranslation = async (trimmedInput) => {
        const response = await fetch(`/api/translate`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                q: trimmedInput,
            }),
        });
        const data = await response.json();
        if (data.language === 'zh-CN' || data.language === 'zh-TW') data.language = 'zh';
        console.log(data);
        setTranslation(data.result);
        setActualLang(data.language);
        setWrongLang(data.language !== lang);
    };

    const getData = async (trimmedInput) => {
        const response = await fetch(`/api/${lang}/getData`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                q: trimmedInput,
            }),
        });
        const data = await response.json();
        console.log('Final data: ' + JSON.stringify(data, null, 2));
        setData(data);
    };

    const getMessage = async () => {
        await fetch(`/api/hello`)
            .then((res) => res.json())
            .then((data) => {
                setMsg(data.message);
                console.log(data.message);
            });
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);
        if (value.trim().length === 0) {
            setHasInput(false);
            setShowResult(false);
        } else {
            setHasInput(true);
        }
    };

    useEffect(() => {
        getMessage();
    }, []);

    const map = {es: 'Spanish', fr: 'French', zh: 'Chinese'};
    return (
        <div>
            <Sidebar/>
            <div className="page">
                {wrongLang && (['es', 'fr', 'zh'].includes(actualLang)
                    ? (<Alert severity="warning">Wrong language detected. Did you mean <a
                        href={`/language/${actualLang}`}>{map[actualLang]}</a>?</Alert>)
                    : (<Alert severity="warning">Wrong language detected.</Alert>))
                }
                {hasInput && showResult ? (
                    <div className="centered-container">
                        <div className="text-display">{input}</div>
                        <div className="result centered-container">
                            <p>English Translation: {translation}</p>
                            <SentenceWrapper data={data} lang={lang}/>
                            {/*<h4>Full data(check console)</h4>*/}
                        </div>
                    </div>
                ) : (
                    <div className="centered-container">
                        <div className="instruction">
                            {map[lang]} Sentence Analyzer
                            <p/>
                            Enter a {lang} text to analyze!
                        </div>

                        <div className="text-box-container">
                            <form onSubmit={handleSubmit}>

                                <textarea
                                    className="text-box"
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Enter a message"
                                    onKeyUp={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                ></textarea>
                                    <button
                                        type="submit"
                                        disabled={!hasInput}
                                        style={{
                                            backgroundColor: hasInput
                                                ? 'rgb(239, 185, 79)'
                                                : 'rgb(244, 215, 157)',
                                        }}
                                    >
                                        Analyze
                                    </button>
                            </form>
                        </div>
                    </div>
                )}

                {/*<h4>Full data(check console)</h4>*/}

                <div className="menu" style={{marginTop: '60px'}}>
                    <button onClick={() => navigate('/')}>Home</button>
                </div>
            </div>
        </div>
    );
}