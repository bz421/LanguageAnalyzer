import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import './styles.css';
// import ClearIcon from '@mui/icons-material/Clear';


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

    const clearInput = (e) => {
        setInput(null);
        setHasInput(false);
        setShowResult(false);
    };

    const handleSampleClick = (e) => {
        setInput(e.target.innerText);
        setHasInput(true);
    }

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
                        <div className="text-display">{input}
                            <button className="close" onClick={clearInput}>
                                X
                            </button>
                        </div>
                        <div className="result centered-container">
                            <p style={{color : '#ab5620', fontWeight : '500', fontSize : '1.1rem'}}>{translation}</p>
                            <SentenceWrapper data={data} lang={lang}/>
                            {/*<h4>Full data(check console)</h4>*/}
                        </div>
                    </div>
                ) : (
                    <div className="centered-container">
                        <div className="instruction">
                            {map[lang]} Sentence Analyzer
                            <p/>
                            Enter a {map[lang]} text to analyze!
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

                        
                        {(lang === 'es') ? 
                        (
                            <div className="sample">
                                <h3>Or you can try one of these:</h3>
                                <p onClick={handleSampleClick}>Hola, ¿cómo estás?</p>
                                <p onClick={handleSampleClick}>A mí me gusta nadar en la piscina con mi hermana</p>
                                <p onClick={handleSampleClick}>Nosotros preferimos el café al té.</p>
                                <p onClick={handleSampleClick}>A lo mejor, leerá en su clase de inglés.</p>
                                <p onClick={handleSampleClick}>Podemos quedar en mi casa para tomar una merienda hoy.</p>
                            </div>
                        ) : (
                            (lang === 'fr') ?
                            (<div className="sample">
                                <h3>Or you can try one of these:</h3>
                                <p onClick={handleSampleClick}>Bonjour, comment ça va?</p>
                                <p onClick={handleSampleClick}>J'aime nager dans la piscine avec ma sœur.</p>
                                <p onClick={handleSampleClick}>Nous préférons le café au thé.</p>
                                <p onClick={handleSampleClick}>Peut-être qu'il lira dans son cours d'anglais.</p>
                                <p onClick={handleSampleClick}>Nous pouvons nous retrouver chez moi pour un goûter aujourd'hui.</p>
                            </div>
                            ) : (
                                <div className="sample">
                                <h3>Or you can try one of these:</h3>
                                <p onClick={handleSampleClick}>你好，你好嗎？</p>
                                <p onClick={handleSampleClick}>wǒ xǐ huān hé jiě jiě yī qǐ zài yóu yǒng chí lǐ yóu yǒng 。</p>
                                <p onClick={handleSampleClick}>bǐ qǐ chá ， wǒ mén gēng xǐ huān kā fēi 。</p>
                                <p onClick={handleSampleClick}>或許他會在英文課上閱讀。</p>
                                <p onClick={handleSampleClick}>我們今天可以在我家見面，一起吃點心。</p>

                                </div> 
                            )
                        )


                        }

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