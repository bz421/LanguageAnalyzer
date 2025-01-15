import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import './styles.css';

import Sidebar from '../Components/Sidebar';
import SentenceWrapper from '../Components/SentenceWrapper';
import Alert from '@mui/material/Alert';
import {IconButton} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear';

export default function Page() {
    const [msg, setMsg] = useState('');
    const [translation, setTranslation] = useState('');
    const [input, setInput] = useState('');
    const [hasInput, setHasInput] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [data, setData] = useState([]);
    const [correction, setCorrection] = useState('')
    const [syns, setSyns] = useState('')


    const [loading, setLoading] = useState(false); // Add loading state
    const [wrongLang, setWrongLang] = useState(false);
    const [actualLang, setActualLang] = useState('');
    const {lang} = useParams();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedInput = input.trim();
        setInput(trimmedInput);

        setLoading(true); // Set loading to true when data is being fetched

        await getTranslation(trimmedInput);
        await getData(trimmedInput);

        setShowResult(true);
        setLoading(false); // Set loading to false once data is fetched
        checkGrammar(trimmedInput)
        getSyn(trimmedInput)
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

    const checkGrammar = async (trimmedInput) => {
        const response = await fetch(`/api/${lang}/checkGrammar`, {
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
        if (data.corrected !== trimmedInput) {
            setCorrection(data.corrected);
        }
        console.log(correction)
    };

    const getSyn = async(trimmedInput) => {
        const response = await fetch(`/api/${lang}/getSyn`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                q: trimmedInput,
            }),
        });
        const syns = await response.json();
        console.log('Synonyms: ' + JSON.stringify(syns, null, 2));
        setSyns(syns);
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

    const mapUpper = {es: 'Spanish', fr: 'French', zh: 'Chinese'};
    const mapLower = {es: 'spanish', fr: 'french', zh: 'chinese'}
    return (
        <div>
            <Sidebar/>
            <div className="page">
                {wrongLang && (['es', 'fr', 'zh'].includes(actualLang)
                    ? (<Alert severity="warning">Wrong language detected. Did you mean <a
                        href={`/language/${actualLang}`}>{mapUpper[actualLang]}</a>?</Alert>)
                    : (<Alert severity="warning">Wrong language detected.</Alert>))
                }
                {hasInput && showResult ? (
                    <div className="centered-container">
                        <div className="text-display">{input}
                            {/*<button className="clear-button" onClick={clearInput}>*/}
                            {/*    X*/}
                            {/*</button>*/}
                            <IconButton style={{marginLeft: 'auto'}} className="clear-button" onClick={clearInput}>
                                <ClearIcon/>
                            </IconButton>

                        </div>
                        {correction && correction.length > 0 && (
                            <div style={{textAlign: 'center'}}>
                                <h1>Perhaps you meant this?</h1>
                                <p>{correction}</p>
                            </div>
                        )}
                        <div className="result centered-container">
                            <p style={{color : '#ab5620', fontWeight : '500', fontSize : '1.1rem'}}>{translation}</p>
                            <SentenceWrapper data={data} lang={lang}/>
                            {/*<h4>Full data(check console)</h4>*/}
                        </div>

                        {/* {syns && Object.keys(syns).length > 0 && (
                            Object.keys(syns).map(adj => 
                                <p>{adj}: {syns[adj][0]}</p>
                            )
                        )} */}
                    </div>
                ) : (
                    <div className="centered-container">
                        <div className="instruction">
                            {mapUpper[lang]} Sentence Analyzer
                            <p/>
                            Enter a {mapLower[lang]} text to analyze!
                        </div>

                        <div className="text-box-container">
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    className="text-box"
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Enter a message"
                                    onFocus={(e) => e.target.placeholder = ''}
                                    onBlur={(e) => e.target.placeholder = 'Enter a message'}
                                    onKeyUp={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                ></textarea>
                                {loading ? (
                                    <div className="loader"></div>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!hasInput}
                                        style={{
                                            backgroundColor: hasInput
                                                ? 'rgb(239, 185, 79)'
                                                : 'rgb(244, 215, 157)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Analyze
                                    </button>
                                )}
                            </form>
                        </div>

                        
                        {(lang === 'es') ? 
                        (
                            <div className="sample">
                                <h3>Or you can try one of these:</h3>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>Hola, ¿cómo estás?</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>A mí me gusta nadar en la piscina con mi hermana</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>Nosotros preferimos el café al té.</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>A lo mejor, leerá en su clase de inglés.</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>Podemos quedar en mi casa para tomar una merienda hoy.</p>
                            </div>
                        ) : (
                            (lang === 'fr') ?
                            (<div className="sample">
                                <h3>Or you can try one of these:</h3>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>Bonjour, comment ça va?</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>J'aime nager dans la piscine avec ma sœur.</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>Nous préférons le café au thé.</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>Peut-être qu'il lira dans son cours d'anglais.</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>Nous pouvons nous retrouver chez moi pour un goûter aujourd'hui.</p>
                            </div>
                            ) : (
                                <div className="sample">
                                <h3>Or you can try one of these:</h3>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>你好，你好嗎？</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>我的姐姐很马马虎虎，经常丢三落四。</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>我们更喜欢喝茶。</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>或許他會在英文課上閱讀。</p>
                                <p onClick={handleSampleClick} style={{cursor: 'pointer'}}>我們今天可以在我家見面，一起吃點心。</p>

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