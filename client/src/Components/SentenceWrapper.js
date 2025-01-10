import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid2 } from '@mui/material';
import CurlyBrace from './CurlyBrace';

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
    switch(int) {
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
    // Calculate tagged ranges
        let tags = [[], [], [], [], [], [], [], [], [], [], [], []];
        for (let i = 0; i < data.tokens.length; i++) {
            for (const tag of data.tokens[i].tags) {
                if (tagToInt(tag) !== -1) {
                    tags[tagToInt(tag)].push(i);
                }
            }
        }

        for (let i = 0; i < tags.length; i++) {
            let ranges = [];
            let start = -1;
            let end = -1;
            for (let j = 0; j < tags[i].length; j++) {
                if (start === -1) {
                    start = tags[i][j];
                    end = tags[i][j];
                } else if (tags[i][j] === end + 1) {
                    end = tags[i][j];
                } else {
                    ranges.push([start, end]);
                    start = tags[i][j];
                    end = tags[i][j];
                }
            }
            if (start !== -1) {
                ranges.push([start, end]);
            }
            tags[i] = ranges;
        }

        const leftBound = tokenRefs.current[0]?.getBoundingClientRect().x || 0;
        // const rightBound = tokenRefs.current[tokenRefs.current.length - 1]?.getBoundingClientRect().right || 0;

        // Calculate curly brace ranges only after refs are available
        return tags.flatMap((arr, tagIdx) =>
            arr
                .filter((range) => range[0] !== range[1] && tokenRefs.current[range[0]] && tokenRefs.current[range[1]])
                .map((range) => {
                    const coordInfo1 = tokenRefs.current[range[0]]?.getBoundingClientRect();
                    const coordInfo2 = tokenRefs.current[range[1]]?.getBoundingClientRect();

                    if (!coordInfo1 || !coordInfo2) return null;

                    const X1 = (coordInfo1.right - coordInfo1.x) / 2 + coordInfo1.x - leftBound;
                    // const Y1 = (coordInfo1.bottom - coordInfo1.y) / 2 + coordInfo1.y;
                    const X2 = (coordInfo2.right - coordInfo2.x) / 2 + coordInfo2.x - leftBound;
                    // const Y2 = (coordInfo2.bottom - coordInfo2.y) / 2 + coordInfo2.y;

                    return { x1: X1, y1: 0, x2: X2, y2: 0, width: 20, q: 0.5, annotation: intToTag(tagIdx), range };
                })
                .filter((range) => range !== null)
        );
}

export default function SentenceWrapper({ data, lang }) {
    const [hoverIndex, setHoverIndex] = useState(null);
    const [curlyBraceRanges, setCurlyBraceRanges] = useState([]); // State to store curly brace data
    const [hoveredCurlyBraceIndex, setHoveredCurlyBraceIndex] = useState(null); // State to track hovered curly brace
    const tokenRefs = useRef([]);

    const handleMouseEnter = (index) => {
        setHoverIndex(index);
    };

    const handleMouseLeave = () => {
        setHoverIndex(null);
    };

    useEffect(() => {
        const updateCurlyBranceRanges = () => {
            const ranges = calculateCurlyBraceRanges(data, tokenRefs)
            setCurlyBraceRanges(ranges);
        }

        // schedule updating ranges for after tokens have loaded(might not work)
        const timeoutId = requestAnimationFrame(updateCurlyBranceRanges)
        return () => cancelAnimationFrame(timeoutId)

    }, [data]); // Recalculate when tokens change

    return (
        <>
            <Grid2 container spacing={2} justifyContent="space-evenly" flexWrap='wrap'>
                {data.tokens.map((token, index) => (
                    <Grid2 item key={index}>
                        <Box
                            ref={(el) => tokenRefs.current[index] = el}
                            sx={{
                                textAlign: 'center',
                                padding: '8px',
                                border: '2px solid #0f0',
                                borderRadius: '4px',
                                backgroundColor: hoverIndex === index || (hoveredCurlyBraceIndex !== null && (curlyBraceRanges[hoveredCurlyBraceIndex]?.range[0] <= index && index <= curlyBraceRanges[hoveredCurlyBraceIndex]?.range[1])) ? '#e0e0e0' : 'transparent',
                            }}
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
                                    backgroundColor: hoverIndex === index || (hoveredCurlyBraceIndex !== null && (curlyBraceRanges[hoveredCurlyBraceIndex]?.range[0] <= index && index <= curlyBraceRanges[hoveredCurlyBraceIndex]?.range[1])) ? '#e0e0e0' : 'transparent',
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

            {/* Render the CurlyBrace component with the calculated ranges */}
            {curlyBraceRanges.length > 0 && (
                <CurlyBrace
                    curlyBraces={curlyBraceRanges}
                    widthSVG={tokenRefs.current.length > 0 ? tokenRefs.current[tokenRefs.current.length - 1]?.getBoundingClientRect().right - tokenRefs.current[0].getBoundingClientRect().x : 0}
                    heightSVG={50}
                    onHover={setHoveredCurlyBraceIndex} // Pass the hover handler
                />
            )}
        </>
    );
}