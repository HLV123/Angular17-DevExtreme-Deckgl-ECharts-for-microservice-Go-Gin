import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'app-correlation-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="matrix-wrapper">
      <div #matrixChart class="matrix-chart"></div>
    </div>
  `,
  styles: [`
    .matrix-wrapper { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
    .matrix-chart { width: 100%; height: 100%; min-height: 400px; position: relative; }
    ::ng-deep .d3-tooltip {
      position: absolute;
      text-align: center;
      padding: 8px;
      font: 12px "DM Sans", sans-serif;
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      border-radius: 6px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 10;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
  `]
})
export class CorrelationMatrixComponent implements OnInit {
  @ViewChild('matrixChart', { static: true }) chartContainer!: ElementRef;
  @Input() data: any[] = [];

  private resizeListener = () => this.drawChart();

  ngOnInit() {
    this.generateMockData();
    setTimeout(() => this.drawChart(), 100);
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  }

  generateMockData() {
    const vars = ['PM2.5', 'PM10', 'CO', 'NO2', 'SO2', 'O3', 'Temp', 'Hum', 'Wind'];
    this.data = [];

    // Create symmetric matrix
    for (let i = 0; i < vars.length; i++) {
      for (let j = 0; j < vars.length; j++) {
        let val = 1; // diagonal
        if (i !== j) {
          // some logic for mock correlations
          if ((vars[i].includes('PM') && vars[j].includes('PM')) ||
            (vars[i] === 'CO' && vars[j] === 'NO2')) {
            val = 0.7 + Math.random() * 0.2; // High positive
          } else if (vars[i] === 'Wind' && vars[j].includes('PM')) {
            val = -0.5 - Math.random() * 0.4; // High negative
          } else if (vars[i] === 'Hum' && vars[j] === 'PM2.5') {
            val = 0.4 + Math.random() * 0.3;
          } else {
            val = (Math.random() * 1.4) - 0.7; // Random between -0.7 and 0.7
          }
        }
        this.data.push({ x: vars[i], y: vars[j], value: val });
      }
    }
  }

  drawChart() {
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const width = element.clientWidth - margin.left - margin.right || 500 - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom || 500 - margin.top - margin.bottom;

    // Use smaller of width/height to make it square
    const size = Math.min(width, height);

    const svg = d3.select(element)
      .append('svg')
      .attr('width', size + margin.left + margin.right)
      .attr('height', size + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const vars = Array.from(new Set(this.data.map(d => d.x)));

    // Build X scales and axis:
    const x = d3.scaleBand()
      .range([0, size])
      .domain(vars)
      .padding(0.05);

    svg.append('g')
      .attr('transform', `translate(0,${size})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select('.domain').remove();

    // Build Y scales and axis:
    const y = d3.scaleBand()
      .range([size, 0]) // Reverse so it starts from bottom or top as needed
      .domain(vars.reverse())
      .padding(0.05);

    svg.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain').remove();

    // Color scale for -1 to 1 correlation
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateRdBu) // Red to Blue, 0 is white
      .domain([1, -1]); // 1 is Blue, -1 is Red in RdBu, but we want 1=Red, -1=Blue. Wait, RdBu: 0=Red, 1=Blue. So domain [1, -1] makes 1=Red, -1=Blue. Let's use RdYlGn or custom.
    // Usually correlation: 1 is Red (or dark blue), -1 is Blue (or dark red).
    // Let's use d3.interpolateRdBu where 0 is Red, 1 is Blue. 
    // If we want 1 to be Red and -1 to be Blue, use domain [-1, 1] with d3.interpolateBuRd (not standard).

    // Custom diverging color scale:
    const myColor = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(["#3b82f6", "#1e293b", "#ef4444"]); // Blue for negative, dark for 0, Red for positive

    // create a tooltip
    const tooltip = d3.select(element)
      .append('div')
      .attr('class', 'd3-tooltip');

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (this: any, event: any, d: any) {
      tooltip.style('opacity', 1);
      d3.select(this)
        .style('stroke', '#fff')
        .style('stroke-width', 2)
        .style('opacity', 1);
    }

    const mousemove = function (event: any, d: any) {
      const containerRect = element.getBoundingClientRect();
      const left = event.clientX - containerRect.left + 15;
      const top = event.clientY - containerRect.top - 20;

      tooltip
        .html(`${d.x} & ${d.y}<br>Correlation: <b>${d.value.toFixed(2)}</b>`)
        .style('left', left + 'px')
        .style('top', top + 'px');
    }

    const mouseleave = function (this: any, event: any, d: any) {
      tooltip.style('opacity', 0);
      d3.select(this)
        .style('stroke', 'none')
        .style('opacity', 0.8);
    }

    // add the squares
    svg.selectAll()
      .data(this.data, function (d: any) { return d.x + ':' + d.y; })
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.x) as number)
      .attr('y', (d: any) => y(d.y) as number)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', (d: any) => { return d.x === d.y ? '#64748b' : myColor(d.value); })
      .style('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);

    // add values text inside rectangles (only if size allows)
    if (x.bandwidth() > 30) {
      svg.selectAll()
        .data(this.data)
        .enter()
        .append('text')
        .attr('x', (d: any) => (x(d.x) as number) + x.bandwidth() / 2)
        .attr('y', (d: any) => (y(d.y) as number) + y.bandwidth() / 2)
        .text((d: any) => d.x === d.y ? '-' : d.value.toFixed(1))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .style('fill', '#fff')
        .style('font-size', '10px')
        .style('font-family', 'DM Sans')
        .style('pointer-events', 'none'); // don't block mouse events
    }

    // format axis text
    svg.selectAll('.tick text')
      .style('fill', '#94a3b8')
      .style('font-family', 'DM Sans')
      .style('font-size', '11px');
  }
}
