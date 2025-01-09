import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export default function CurlyBrace({ x1, y1, x2, y2, width, q }) {
  const svgRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Function to generate the path for the curly brace
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

  // Function to render the curly brace
  function renderCurlyBrace() {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    svg
      .append('path')
      .attr('d', makeCurlyBrace(x1, y1, x2, y2, width, q))
      .attr('class', 'curlyBrace')
      .style('stroke', (isHovered ? '#f00' : '#000000'))
      .style('stroke-width', '3px')
      .style('fill', 'none')
      .on('mouseover', () => setIsHovered(true))
      .on('mouseout', () => setIsHovered(false));
  }

  useEffect(() => {
    renderCurlyBrace();
  }, [x1, y1, x2, y2, width, q, isHovered])

  return <svg ref={svgRef} width="200" height="200"></svg>;
}
