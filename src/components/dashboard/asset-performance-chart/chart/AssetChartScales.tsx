
import * as d3 from 'd3';

interface AssetData {
  name: string;
  pnl: number;
  trades: number;
  winRate: number;
}

interface ScaleResult {
  x: d3.ScaleBand<string>;
  y: d3.ScaleLinear<number, number>;
}

export const createScales = (data: AssetData[], width: number, height: number): ScaleResult => {
  // X scale
  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.4);
  
  // Find min and max profit for Y scale
  const maxPnl = d3.max(data, d => d.pnl) || 0;
  const minPnl = d3.min(data, d => d.pnl) || 0;
  const padding = Math.max(Math.abs(maxPnl), Math.abs(minPnl)) * 0.1;
  
  // Y scale (ensure 0 is included)
  const y = d3.scaleLinear()
    .domain([Math.min(0, minPnl - padding), Math.max(0, maxPnl + padding)])
    .range([height, 0]);
  
  return { x, y };
};
