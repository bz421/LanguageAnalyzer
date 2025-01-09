import React, { useState } from 'react'
import { Box, Grid2, Tooltip } from '@mui/material'
import CurlyBrace from './CurlyBrace'

export default function SentenceWrapper({ data, lang }) {
    const [hoverIndex, setHoverIndex] = useState(null)

    const handleMouseEnter = (index) => {
        setHoverIndex(index)
    }

    const handleMouseLeave = () => {
        setHoverIndex(null)
    }

    return (
        <>
            <CurlyBrace x1={50} y1={50} x2={150} y2={50} width={20} q={0.5} />
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
        </>
    )
}