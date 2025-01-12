import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export default function CurlyBrace({ curlyBraces, widthSVG, heightSVG, onHover, onClick }) {
    const svgRef = useRef(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [clickedIndex, setClickedIndex] = useState(null);

    function makeCurlyBrace(x1, y1, x2, y2, w, q) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        const len = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / len;
        const unitY = dy / len;

        const qx1 = x1 + q * w * unitY;
        const qy1 = y1 - q * w * unitX;
        const qx2 = x1 - 0.25 * len * unitX + (1 - q) * w * unitY;
        const qy2 = y1 - 0.25 * len * unitY - (1 - q) * w * unitX;
        const tx1 = x1 - 0.5 * len * unitX + w * unitY;
        const ty1 = y1 - 0.5 * len * unitY - w * unitX;
        const qx3 = x2 + q * w * unitY;
        const qy3 = y2 - q * w * unitX;
        const qx4 = x1 - 0.75 * len * unitX + (1 - q) * w * unitY;
        const qy4 = y1 - 0.75 * len * unitY - (1 - q) * w * unitX;

        return (
            `M ${x1} ${y1}` +
            ` Q ${qx1} ${qy1} ${qx2} ${qy2}` +
            ` T ${tx1} ${ty1}` +
            ` M ${x2} ${y2}` +
            ` Q ${qx3} ${qy3} ${qx4} ${qy4}` +
            ` T ${tx1} ${ty1}`
        );
    }

    function renderCurlyBraces() {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        curlyBraces.forEach(({ x1, y1, x2, y2, width, q, annotation }, index) => {
            svg
                .append('path')
                .attr('d', makeCurlyBrace(x1, y1, x2, y2, width, q))
                .attr('class', 'curlyBrace')
                .style('stroke', clickedIndex === index ? '#00f' : (hoveredIndex === index ? '#f00' : '#000'))
                .style('stroke-width', '3px')
                .style('fill', 'none')
                .on('mouseover', () => {
                    setHoveredIndex(index);
                    onHover(index);
                })
                .on('mouseout', () => {
                    setHoveredIndex(null);
                    onHover(null);
                })
                .on('click', () => {
                    setClickedIndex((prevIndex) => (prevIndex === index ? null : index));
                    onClick(index);
                });

            svg
                .append('text')
                .attr('x', (x1 + x2) / 2)
                .attr('y', Math.max(y1, y2) + 40)
                .attr('text-anchor', 'middle')
                .style('font-size', '15px')
                .style('fill', '#000')
                .text(annotation);
        });
    }

    useEffect(() => {
        renderCurlyBraces();
    }, [curlyBraces, hoveredIndex, clickedIndex]);

    return <svg ref={svgRef} height={heightSVG} width={widthSVG}></svg>;
}

/*
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
*/