import React, {useState, useEffect, useRef} from 'react';
import {Box, Grid2, Modal, Tooltip} from '@mui/material';
import CurlyBrace from './CurlyBrace';

// import {ArcherContainer, ArcherElement} from 'react-archer'

function tagToInt(tag) {
    switch (tag) {
        case 'subject':
            return 0;
        case 'baSubject':
            return 1;
        case 'beiSubject':
            return 2;
        case 'implicit subject':
            return 3;
        case 'verb':
            return 4;
        case 'baVerb':
            return 5;
        case 'adjective':
            return 6;
        case 'object':
            return 7;
        case 'baObject':
            return 8;
        case 'beiObject':
            return 9;
        case 'particles':
            return 10;
        case 'chengyu':
            return 11;
        default:
            return -1;
    }
}

function intToTag(int) {
    switch (int) {
        case 0:
            return 'subject phrase';
        case 1:
            return 'baSubject';
        case 2:
            return 'beiSubject';
        case 3:
            return 'implicit subject';
        case 4:
            return 'verb phrase';
        case 5:
            return 'baVerb';
        case 6:
            return 'adjectival phrase';
        case 7:
            return 'object';
        case 8:
            return 'baObject';
        case 9:
            return 'beiObject';
        case 10:
            return 'particles';
        case 11:
            return 'chengyu';
        default:
            return '';
    }
}

function calculateCurlyBraceRanges(data, tokenRefs) {
    const tags = Array.from({length: 12}, () => []);

    for (let i = 0; i < data.tokens.length; i++) {
        for (const tag of data.tokens[i].tags) {
            if (tag === 'implicit subject') continue
            const tagIdx = tagToInt(tag);
            if (tagIdx !== -1) {
                tags[tagIdx].push(i);
            }
        }
    }
    console.log(tags)

    const ranges = tags.flatMap((indices, tagIdx) => {
        const layerRanges = [];
        let start = -1;
        let end = -1;

        for (let i = 0; i < indices.length; i++) {
            if (start === -1) {
                start = indices[i];
                end = indices[i];
            } else if (indices[i] === end + 1) {
                end = indices[i];
            } else {
                layerRanges.push({start, end});
                start = indices[i];
                end = indices[i];
            }
        }
        if (start !== -1) {
            layerRanges.push({start, end});
        }

        return layerRanges.map(({start, end}) => ({start, end, tagIdx}));
    });

    const leftBound = tokenRefs.current[0]?.getBoundingClientRect().x || 0;

    const curlyBraces = [];
    ranges.forEach(({start, end, tagIdx}) => {
        const coord1 = tokenRefs.current[start]?.getBoundingClientRect();
        const coord2 = tokenRefs.current[end]?.getBoundingClientRect();

        if (!coord1 || !coord2) return;

        const x1 = coord1.x - leftBound;
        const x2 = coord2.right - leftBound;
        const centerX1 = (coord1.right - coord1.x) / 2 + coord1.x - leftBound;
        const centerX2 = (coord2.right - coord2.x) / 2 + coord2.x - leftBound;

        curlyBraces.push({
            x1: start === end ? coord1.x - leftBound : centerX1,
            x2: start === end ? coord1.right - leftBound : centerX2,
            width: 20,
            y1: 0,
            y2: 0,
            q: 0.5,
            annotation: intToTag(tagIdx),
            range: [start, end],
            layer: 0, // Initialize layer
        });
    });

    // Adjust layers to account for braces two tokens away
    curlyBraces.forEach((current, i) => {
        let layer = 0;

        while (
            curlyBraces.some((other, j) => {
                if (i === j) return false;

                const overlap = current.layer === other.layer;
                const isTooClose =
                    Math.abs(current.range[0] - other.range[1]) <= 1 ||
                    Math.abs(current.range[1] - other.range[0]) <= 1;

                return overlap && isTooClose;
            })
            ) {
            layer++;
            current.layer = layer;
        }
    });

    // Adjust vertical positioning based on layers
    curlyBraces.forEach((brace) => {
        brace.y1 = brace.layer * 40; // Offset each layer by 30 pixels
        brace.y2 = brace.layer * 40;
    });

    return curlyBraces;
}


export default function SentenceWrapper({data, lang}) {
    const [hoverIndex, setHoverIndex] = useState(null);
    const [curlyBraceRanges, setCurlyBraceRanges] = useState([]);
    const [hoveredCurlyBraceIndex, setHoveredCurlyBraceIndex] = useState(null);
    const [clickedCurlyBraceIndex, setClickedCurlyBraceIndex] = useState(null);
    const [popupInfo, setPopupInfo] = useState(null);

    const tokenRefs = useRef([]);

    const handleMouseEnter = (index) => setHoverIndex(index);
    const handleMouseLeave = () => setHoverIndex(null);

    useEffect(() => {
        const updateCurlyBraces = () => {
            const ranges = calculateCurlyBraceRanges(data, tokenRefs);
            setCurlyBraceRanges(ranges);
        }

        const timeoutId = setTimeout(() => {
            requestAnimationFrame(updateCurlyBraces)
        }, 0)

        return () => clearTimeout(timeoutId)
    }, [data]);

    const handleTokenClick = (token) => {
        if (token.tags.includes('implicit subject') && lang !== 'zh') {
            const form = token.info[0][0][0] === "Fin" ? "finite" : "infinitive";
            const mood = token.info[0][1][0] === "Ind" ? 'indicative' : token.info[0][1][0] === 'Sub' ? 'subjunctive' : token.info[0][1][0] === 'Imp' ? 'imperative' : token.info[0][1][0] === 'Cnd' ? 'conditional' : 'N/A';
            const tense = token.info[0][2][0] === "Pres" ? 'present' : token.info[0][2][0] === 'Past' ? 'past' : token.info[0][2][0] === 'Imp' ? 'imperfect' : token.info[0][2][0] === 'Fut' ? 'future' : token.info[0][2][0] === 'Cnd' ? 'conditional' : 'N/A';
            const person = token.info[0][3][0] ?? 'N/A';
            const number = token.info[0][4][0] === "Sing" ? 'singular' : token.info[0][4][0] === 'Plur' ? 'plural' : 'N/A';
            let objects = [];
            for (const range of token.objectReference) {
                const arr = data.tokens.slice(range[0], range[1]);
                let stmnt = '';
                for (const token of arr) {
                    if (!['.', ',', '，', '。'].includes(token.text)) {
                        stmnt += token.text + ' ';
                    }
                }
                objects.push(stmnt.trim());
            }
            console.log(objects)
            let objectStmnt = data.sentence;
            for (const obj of objects) {
                objectStmnt = objectStmnt.replace(obj, `<b style="color: blue;">${obj}</b>`);
            }
            objectStmnt = objectStmnt.replace(token.text, `<b style="color: red;">${token.text}</b>`);

            token.details = `Form: ${form}, Mood: ${mood}, Tense: ${tense}, Person: ${person}, Number: ${number}`;

            const objectDescriptions = objects.map(obj => `<b style="color: blue;">${obj}</b> is an object of <b style="color: red;">${token.text}</b> in this sentence`).join('<br/>');

            setPopupInfo({
                title: token.text,
                sentence: objectStmnt,
                description: `<b style"color: red;">${token.text}</b> serves as the implicit subject of this sentence.`,
                details: token.details,
                objects: objectDescriptions,
                end: lang === 'es' ? `See more on <a target="_blank" href="https://www.spanishdict.com/conjugate/${token.text}">SpanishDict</a>` : lang === 'fr' ? `See more on <a href="https://wordreference.com/conj/frverbs.aspx?v=${token.text}">WordReference</a>` : null
            });
        } else if (token.tags.includes('verb') && lang !== 'zh') {
            const form = token.info[0][0][0] === "Fin" ? "finite" : "infinitive";
            const mood = token.info[0][1][0] === "Ind" ? 'indicative' : token.info[0][1][0] === 'Sub' ? 'subjunctive' : token.info[0][1][0] === 'Imp' ? 'imperative' : token.info[0][1][0] === 'Cnd' ? 'conditional' : 'N/A';
            const tense = token.info[0][2][0] === "Pres" ? 'present' : token.info[0][2][0] === 'Past' ? 'past' : token.info[0][2][0] === 'Imp' ? 'imperfect' : token.info[0][2][0] === 'Fut' ? 'future' : token.info[0][2][0] === 'Cnd' ? 'conditional' : 'N/A';
            const person = token.info[0][3][0] ?? 'N/A';
            const number = token.info[0][4][0] === "Sing" ? 'singular' : token.info[0][4][0] === 'Plur' ? 'plural' : 'N/A';

            let objects = [];
            for (const range of token.objectReference) {
                const arr = data.tokens.slice(range[0], range[1]);
                let stmnt = '';
                for (const token of arr) {
                    if (!['.', ',', '，', '。'].includes(token.text)) {
                        stmnt += token.text + ' ';
                    }
                }
                objects.push(stmnt.trim());
            }

            let objectStmnt = data.sentence;
            for (const obj of objects) {
                objectStmnt = objectStmnt.replace(obj, `<b style="color: blue;">${obj}</b>`);
            }
            objectStmnt = objectStmnt.replace(token.text, `<b style="color: red;">${token.text}</b>`);

            token.details = `Form: ${form}, Mood: ${mood}, Tense: ${tense}, Person: ${person}, Number: ${number}`;

            const objectDescriptions = objects.map(obj => `<b style="color: blue;">${obj}</b> is an object of <b style="color: red;">${token.text}</b> in this sentence`).join('<br/>');
            setPopupInfo({
                title: token.text,
                sentence: objectStmnt,
                description: `<b style="color: red;">${token.text}</b> is a verb in this sentence.`,
                details: objectDescriptions,
                end: lang === 'es' ? `See more on <a target="_blank" href="https://www.spanishdict.com/conjugate/${token.text}">SpanishDict</a>` : lang === 'fr' ? `See more on <a href="https://wordreference.com/conj/frverbs.aspx?v=${token.text}">WordReference</a>` : null
            });
        }

        // Handle ba and bei constructions
        if (lang === 'zh') {
            let subjects = []
            let verbs = []
            let objects = []
            if (token.tags.includes('baParticle')) {
                for (const subj of token.baSubjects) {
                    const arr = data.tokens.slice(subj[0], subj[1]);
                    let stmnt = '';
                    for (const token of arr) {
                        if (!['。', '，', '.', ','].includes(token.text)) {
                            stmnt += token.text;
                        }
                    }
                    subjects.push(stmnt.trim());
                }

                for (const verb of token.baVerbs) {
                    const arr = data.tokens.slice(verb[0], verb[1]);
                    let stmnt = '';
                    for (const token of arr) {
                        if (!['。', '，', '.', ','].includes(token.text)) {
                            stmnt += token.text;
                        }
                    }
                    verbs.push(stmnt.trim());
                }

                for (const obj of token.baObjects) {
                    const arr = data.tokens.slice(obj[0], obj[1]);
                    let stmnt = '';
                    for (const token of arr) {
                        if (!['。', '，', '.', ','].includes(token.text)) {
                            stmnt += token.text;
                        }
                    }
                    objects.push(stmnt.trim());
                }


                let stmnt = data.sentence;
                for (const subj of subjects) {
                    stmnt = stmnt.replace(subj, `<b style="color: orange;">${subj}</b>`);
                }
                for (const verb of verbs) {
                    stmnt = stmnt.replace(verb, `<b style="color: green;">${verb}</b>`);
                }
                for (const obj of objects) {
                    stmnt = stmnt.replace(obj, `<b style="color: blue;">${obj}</b>`);
                }
                stmnt = stmnt.replace(token.text, `<b style="color: violet">${token.text}</b>`)


                const baDescription = subjects.map(subj => `<b style="color: orange;">${subj}</b> is the subject of in this sentence`).join('<br/>') + '<br/>' +
                    verbs.map(verb => `<b style="color: green;">${verb}</b> is the verb of in this sentence`).join('<br/>') + '<br/>' +
                    objects.map(obj => `<b style="color: blue;">${obj}</b> is an object in this sentence`).join('<br/>');

                setPopupInfo({
                    title: '把(ba) Construction',
                    sentence: stmnt,
                    description: `<b style="color: violet;">${token.text}</b> signifies a Subject-Object-Verb(SOV) construction. Learn more about it <a href="https://en.wikipedia.org/wiki/B%C7%8E_construction">here</a>`,
                    details: baDescription,
                });
            } else if (token.tags.includes('beiParticle')) {
                for (const subj of token.beiSubjects) {
                    const arr = data.tokens.slice(subj[0], subj[1]);
                    let stmnt = '';
                    for (const token of arr) {
                        if (!['。', '，', '.', ','].includes(token.text)) {
                            stmnt += token.text;
                        }
                    }
                    subjects.push(stmnt.trim());
                }

                for (const verb of token.beiVerbs) {
                    const arr = data.tokens.slice(verb[0], verb[1]);
                    let stmnt = '';
                    for (const token of arr) {
                        if (!['。', '，', '.', ','].includes(token.text)) {
                            stmnt += token.text;
                        }
                    }
                    verbs.push(stmnt.trim());
                }

                for (const obj of token.beiObjects) {
                    const arr = data.tokens.slice(obj[0], obj[1]);
                    let stmnt = '';
                    for (const token of arr) {
                        if (!['。', '，', '.', ','].includes(token.text)) {
                            stmnt += token.text;
                        }
                    }
                    objects.push(stmnt.trim());
                }

                let stmnt = data.sentence;
                for (const subj of subjects) {
                    stmnt = stmnt.replace(subj, `<b style="color: orange;">${subj}</b>`);
                }
                for (const verb of verbs) {
                    stmnt = stmnt.replace(verb, `<b style="color: green;">${verb}</b>`);
                }
                for (const obj of objects) {
                    stmnt = stmnt.replace(obj, `<b style="color: blue;">${obj}</b>`);
                }
                stmnt = stmnt.replace(token.text, `<b style="color: violet">${token.text}</b>`)

                const beiDescription = subjects.map(subj => `<b style="color: orange;">${subj}</b> is the subject of in this sentence`).join('<br/>') + '<br/>' +
                    verbs.map(verb => `<b style="color: green;">${verb}</b> is the verb of in this sentence`).join('<br/>') + '<br/>' +
                    objects.map(obj => `<b style="color: blue;">${obj}</b> is an object in this sentence`).join('<br/>');

                console.log(beiDescription)
                setPopupInfo({
                    title: '被(bei) Construction',
                    sentence: stmnt,
                    description: `<b style="color: violet;">${token.text}</b> signifies a <b>passive</b> Subject-Object-Verb(SOV) construction. Learn more about it <a href="https://www.bing.com/search?q=bei+construction+wiki+chinese&qs=n&form=QBRE&sp=-1&ghc=1&lq=0&pq=bei+construction+wiki+c&sc=12-23&sk=&cvid=1248233E1AB04B8B83ADDC5CD1445974&ghsh=0&ghacc=0&ghpl=">here</a>`,
                    details: beiDescription,
                })
            } else if (token.tags.includes('chengyu')) {
                setPopupInfo({
                    title: '成语(chéngyǔ)',
                    sentence: data.sentence.replace(token.text, `<b style="color: purple;">${token.text}</b>`),
                    description: `<b style="color: purple;">${token.text}</b> is a <a href="https://www.bing.com/ck/a?!&&p=8fd66e3172d2d3702fba04d1498771cda9cd229b04956b4b384623048f9b7451JmltdHM9MTczNjcyNjQwMA&ptn=3&ver=2&hsh=4&fclid=3f2c7d78-a302-662e-3bcc-6e02a22b671b&psq=chengyu+wiki&u=a1aHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2hlbmd5dQ&ntb=1">chengyu</a>, or Chinese idiom. `,
                    details: `<b style="color: purple">${token.text}</b> means ${token.chengyuDetails}`
                })
            }
        }
    }
    const handleClosePopup = () => setPopupInfo(null);

    const exclude = ['baSubject', 'beiSubject', 'baObject', 'beiObject', 'baVerb', 'chengyu'];
    const filteredBasBeis = curlyBraceRanges.filter(
        (range) => !exclude.includes(range.annotation)
    );

    const handleCurlyBraceClick = (index) => {
        setClickedCurlyBraceIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    return (
        <>
            <Grid2 container spacing={2} justifyContent="space-evenly" flexWrap="wrap">
                {data.tokens.map((token, index) => (
                    <Grid2 item key={index}>
                        {<Box
                            sx={{
                                textAlign: 'center',
                                padding: '8px',
                                borderRadius: '4px',
                                margin: '8px',
                                marginBottom: '4px',
                                color: '#129799',
                                fontWeight: '500',
                            }}
                        >
                            {token.tags.includes('particle') || token.tags.includes('baParticle') || token.tags.includes('beiParticle') ? (
                                <a href={`https://en.wiktionary.org/wiki/${token.text}`} target="_blank"
                                   rel="noopener noreferrer">
                                    {token.text}
                                </a>
                            ) : (
                                token.translation ?? token.text
                            )}
                        </Box>}
                        <Box
                            ref={(el) => (tokenRefs.current[index] = el)}
                            sx={{
                                fontWeight: '700',
                                textAlign: 'center',
                                padding: '8px',
                                border:
                                    token.tags.includes('chengyu')
                                        ? '2px solid purple'
                                        : token.tags.includes('implicit subject')
                                            ? '2px solid red'
                                            : token.tags.includes('verb')
                                                ? '2px solid blue'
                                                : token.tags.includes('baParticle') || token.tags.includes('beiParticle')
                                                    ? '2px solid violet'
                                                    : '2px solid #0f0',
                                borderRadius: '4px',
                                margin: '8px',
                                backgroundColor:
                                    hoverIndex === index ||
                                    (hoveredCurlyBraceIndex !== null &&
                                        filteredBasBeis[hoveredCurlyBraceIndex]?.range[0] <= index &&
                                        index <= filteredBasBeis[hoveredCurlyBraceIndex]?.range[1]) ||
                                    (clickedCurlyBraceIndex !== null &&
                                        filteredBasBeis[clickedCurlyBraceIndex]?.range[0] <= index &&
                                        index <= filteredBasBeis[clickedCurlyBraceIndex]?.range[1])
                                        ? '#e0e0e0'
                                        : 'transparent',
                                cursor: token.tags.includes('implicit subject') || token.tags.includes('verb') || token.tags.includes('baParticle') || token.tags.includes('beiParticle') || token.tags.includes('chengyu')
                                    ? 'pointer'
                                    : 'default'
                            }}
                            onClick={() => handleTokenClick(token)}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {token.text}
                        </Box>
                        {lang === 'zh' && (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    backgroundColor:
                                        hoverIndex === index ||
                                        (hoveredCurlyBraceIndex !== null &&
                                            filteredBasBeis[hoveredCurlyBraceIndex]?.range[0] <= index &&
                                            index <= filteredBasBeis[hoveredCurlyBraceIndex]?.range[1]) ||
                                        (clickedCurlyBraceIndex !== null &&
                                            filteredBasBeis[clickedCurlyBraceIndex]?.range[0] <= index &&
                                            index <= filteredBasBeis[clickedCurlyBraceIndex]?.range[1])
                                            ? '#e0e0e0'
                                            : 'transparent',
                                    margin: '8px',
                                    marginTop: '4px',
                                }}
                                onMouseEnter={() => handleMouseEnter(index)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {token.pinyin}
                            </Box>
                        )}
                    </Grid2>
                ))}
            </Grid2>

            {filteredBasBeis.length > 0 && (
                <CurlyBrace
                    curlyBraces={filteredBasBeis}
                    widthSVG={
                        tokenRefs.current.length > 0
                            ? tokenRefs.current[tokenRefs.current.length - 1]?.getBoundingClientRect().right -
                            tokenRefs.current[0].getBoundingClientRect().x
                            : 0
                    }
                    heightSVG={100} // Adjust height to account for multiple rows
                    onHover={setHoveredCurlyBraceIndex}
                    onClick={handleCurlyBraceClick}
                />

            )}

            <Modal open={Boolean(popupInfo)} onClose={handleClosePopup}>
                <Box
                    sx={{
                        position: 'absolute',
                        margin: 'auto',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <h2>{popupInfo?.title}</h2>
                    <p dangerouslySetInnerHTML={{__html: popupInfo?.sentence}}></p>
                    <p dangerouslySetInnerHTML={{__html: popupInfo?.description}}></p>
                    <p dangerouslySetInnerHTML={{__html: popupInfo?.details.replace(/, /g, '<br/>')}}></p>
                    <p dangerouslySetInnerHTML={{__html: popupInfo?.objects}}></p>
                    {popupInfo?.end && <p dangerouslySetInnerHTML={{__html: popupInfo?.end}}></p>}
                    <button onClick={handleClosePopup}>Close</button>
                </Box>
            </Modal>
        </>
    );
}