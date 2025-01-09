import React, {useState, useEffect} from 'react'
import {Box, Grid2, Tooltip} from '@mui/material'
import CurlyBrace from './CurlyBrace'

function tagToInt(tag) {
    switch (tag) {
        case 'subject':
            return 0
        case 'baSubject':
            return 1
        case 'beiSubject':
            return 2
        case 'implicit subject':
            return 3
        case 'verb':
            return 4
        case 'baVerb':
            return 5
        case 'adjective':
            return 6
        case 'object':
            return 7
        case 'baObject':
            return 8
        case 'beiObject':
            return 9
        case 'particles':
            return 10
        case 'chengyu':
            return 11
        default:
            return -1
    }
}

export default function SentenceWrapper({data, lang}) {
    const [hoverIndex, setHoverIndex] = useState(null)

    const handleMouseEnter = (index) => {
        setHoverIndex(index)
    }

    const handleMouseLeave = () => {
        setHoverIndex(null)
    }

    /*
     * subject
     * baSubject
     * beiSubject
     * implicit subject
     * verb
     * baVerb
     * adjective
     * object
     * baObject
     * beiObject
     * particles
     * chengyu
     */
    let tags = [[], [], [], [], [], [], [], [], [], [], [], []]

    function getTaggedRanges() {
        for (let i = 0; i < data.tokens.length; i++) {
            for (const tag of data.tokens[i].tags) {
                if (tagToInt(tag) !== -1) {
                    tags[tagToInt(tag)].push(i)
                }
            }
        }

        // Combine ranges
        for (let i = 0; i < tags.length; i++) {
            let ranges = []
            let start = -1
            let end = -1
            for (let j = 0; j < tags[i].length; j++) {
                if (start === -1) {
                    start = tags[i][j]
                    end = tags[i][j]
                } else if (tags[i][j] === end + 1) {
                    end = tags[i][j]
                } else {
                    ranges.push([start, end])
                    start = tags[i][j]
                    end = tags[i][j]
                }
            }
            if (start !== -1) {
                ranges.push([start, end])
            }
            tags[i] = ranges
        }
    }


    getTaggedRanges()
    console.log(tags)

    return (
        <>
            {/*<CurlyBrace x1={50} y1={50} x2={150} y2={50} width={20} q={0.5}/>*/}
            <Grid2 container spacing={2} justifyContent="space-evenly" flexWrap='wrap'>
                {data.tokens.map((token, index) => (
                    <Grid2 item key={index}>
                        <Box
                            sx={{
                                textAlign: 'center',
                                padding: '8px',
                                border: '2px solid #0f0',
                                borderRadius: '4px',
                                backgroundColor: hoverIndex === index ? '#e0e0e0' : 'transparent',
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
                                    backgroundColor: hoverIndex === index ? '#e0e0e0' : 'transparent',
                                    marginTop: '4px', // Add some space between text and pinyin
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

            {tags.map((token, index) => (
                token[0] === token[1] ? <p key={index}></p> : null
            ))}

        </>
    )
}