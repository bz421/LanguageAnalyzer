import React, { useState } from "react";
import { ArcherContainer, ArcherElement } from "react-archer";
import { Box, Grid, Tooltip } from "@mui/material";

export default function SentenceWrapperTest({ data, lang }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const handleMouseEnter = (index) => {
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const getBracket = (tags) => {
    if (tags.includes("subject")) return "Subject";
    if (tags.includes("verb")) return "Verb";
    if (tags.includes("baObject")) return "Object";
    if (tags.includes("baParticle")) return "Particle";
    return null;
  };

  return (
    <ArcherContainer strokeColor="blue">
      <Box>
        {/* Token Display */}
        <Grid container spacing={2} justifyContent="center" flexWrap="wrap">
          {data.tokens.map((token, index) => (
            <Grid item key={index}>
              <ArcherElement
                id={`token-${index}`}
                relations={
                  token.tags.includes("baParticle") && token.baObjects.length > 0
                    ? token.baObjects.map((obj) => ({
                        targetId: `token-${obj[0]}`, // Connect to the first token of the baObject
                        targetAnchor: "top",
                        sourceAnchor: "bottom",
                        style: { strokeColor: "green", strokeWidth: 2 },
                      }))
                    : token.tags.includes("baVerb") && token.baSubjects.length > 0
                    ? token.baSubjects.map((subj) => ({
                        targetId: `token-${subj[0]}`, // Connect to the first token of the baSubject
                        targetAnchor: "top",
                        sourceAnchor: "bottom",
                        style: { strokeColor: "red", strokeWidth: 2 },
                      }))
                    : []
                }
              >
                <Tooltip title={token.tags.join(", ")} arrow>
                  <Box
                    sx={{
                      textAlign: "center",
                      padding: "8px",
                      border: "2px solid #0f0",
                      borderRadius: "4px",
                      backgroundColor: hoverIndex === index ? "#e0e0e0" : "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {token.text}
                  </Box>
                </Tooltip>
              </ArcherElement>
            </Grid>
          ))}
        </Grid>

        {/* Pinyin Display (for Chinese language only) */}
        {lang === "zh" && (
          <Grid container spacing={2} justifyContent="center" flexWrap="wrap" mt={2}>
            {data.tokens.map((token, index) => (
              <Grid item key={index}>
                <Box
                  sx={{
                    textAlign: "center",
                    padding: "8px",
                    borderRadius: "4px",
                    backgroundColor: hoverIndex === index ? "#e0e0e0" : "transparent",
                    fontSize: "0.9em",
                    fontStyle: "italic",
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  {token.pinyin.map((p) => p.join(" ")).join(", ")}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Brackets Display */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 3,
          }}
        >
          {data.tokens.map((token, index) => (
            <Box
              key={index}
              sx={{
                textAlign: "center",
                width: `${token.text.length * 15}px`, // Adjust width based on token length
                borderTop: hoverIndex === index ? "3px solid #000" : "2px solid #aaa",
                marginX: "5px",
              }}
            >
              <Box
                sx={{
                  fontSize: "0.75em",
                  color: hoverIndex === index ? "#000" : "#666",
                  mt: 0.5,
                }}
              >
                {getBracket(token.tags)}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </ArcherContainer>
  );
}
