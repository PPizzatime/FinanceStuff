import React, { useState, useMemo, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, LineChart } from 'lucide-react';
import type { ProjectionRow } from '../types/finance';

interface ProjectionChartProps {
  rows: ProjectionRow[];
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ rows }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 100% fit (no scrollbar), >1 = zoomed in (scrollbar appears)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sample or downsample rows if there are thousands, or plot all rows
  const dataPoints = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    // If there are too many daily data points (e.g. > 500), sample them evenly for smooth SVG rendering
    if (rows.length <= 365) return rows;
    const step = Math.ceil(rows.length / 365);
    const sampled: ProjectionRow[] = [];
    for (let i = 0; i < rows.length; i += step) {
      sampled.push(rows[i]);
    }
    // Always include the final row
    if (sampled[sampled.length - 1] !== rows[rows.length - 1]) {
      sampled.push(rows[rows.length - 1]);
    }
    return sampled;
  }, [rows]);

  // Compute Min and Max Y for Y-axis autoscaling
  const { minY, maxY } = useMemo(() => {
    if (dataPoints.length === 0) return { minY: 0, maxY: 1000 };

    let min = 0;
    let max = 0;

    dataPoints.forEach((r) => {
      min = Math.min(min, r.netFinancialBalance, r.cashBalance, r.totalCreditCardDebt);
      max = Math.max(max, r.netFinancialBalance, r.cashBalance, r.totalCreditCardDebt);
    });

    if (min === max) {
      min = 0;
      max = max > 0 ? max * 1.2 : 1000;
    } else {
      const padding = (max - min) * 0.1;
      min = Math.floor(min - padding);
      max = Math.ceil(max + padding);
    }

    return { minY: min, maxY: max };
  }, [dataPoints]);

  const svgBaseWidth = 1000;
  const svgHeight = 320;
  const paddingTop = 25;
  const paddingBottom = 45;
  const paddingLeft = 65;
  const paddingRight = 25;

  const actualSvgWidth = svgBaseWidth * zoomLevel;
  const plotWidth = actualSvgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (dataPoints.length <= 1) return paddingLeft;
    return paddingLeft + (index / (dataPoints.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const range = maxY - minY || 1;
    const normalized = (val - minY) / range;
    return svgHeight - paddingBottom - normalized * plotHeight;
  };

  // Generate SVG path strings
  const netPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.netFinancialBalance).toFixed(1)}`)
      .join(' ');
  }, [dataPoints, zoomLevel, minY, maxY]);

  const cashPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.cashBalance).toFixed(1)}`)
      .join(' ');
  }, [dataPoints, zoomLevel, minY, maxY]);

  const debtPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.totalCreditCardDebt).toFixed(1)}`)
      .join(' ');
  }, [dataPoints, zoomLevel, minY, maxY]);

  // Area fill under net balance
  const areaPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    const firstX = getX(0).toFixed(1);
    const lastX = getX(dataPoints.length - 1).toFixed(1);
    const zeroY = getY(0).toFixed(1);
    return `${netPath} L ${lastX} ${zeroY} L ${firstX} ${zeroY} Z`;
  }, [netPath, dataPoints, zoomLevel, minY, maxY]);

  // Y-axis tick marks
  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    const step = (maxY - minY) / count;
    for (let i = 0; i <= count; i++) {
      const val = minY + i * step;
      ticks.push({
        value: val,
        y: getY(val),
      });
    }
    return ticks;
  }, [minY, maxY, zoomLevel]);

  // X-axis tick labels
  const xTicks = useMemo(() => {
    if (dataPoints.length === 0) return [];
    const count = Math.min(8, dataPoints.length);
    const step = Math.floor((dataPoints.length - 1) / (count - 1 || 1));
    const ticks = [];
    for (let i = 0; i < dataPoints.length; i += step) {
      ticks.push({
        index: i,
        label: dataPoints[i].date,
        x: getX(i),
      });
    }
    return ticks;
  }, [dataPoints, zoomLevel]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(4, prev + 0.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(1, prev - 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    if (mouseX < paddingLeft || mouseX > actualSvgWidth - paddingRight) {
      setHoverIndex(null);
      return;
    }
    const relativeX = mouseX - paddingLeft;
    const ratio = Math.max(0, Math.min(1, relativeX / plotWidth));
    const index = Math.round(ratio * (dataPoints.length - 1));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => setHoverIndex(null);

  const hoveredData = hoverIndex !== null ? dataPoints[hoverIndex] : null;

  if (!rows || rows.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 w-full overflow-hidden">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-600" />
            Financial Balance Projection Chart
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-scaled timeline visualization of Net Worth, Cash Balance, and Credit Card Debt.
          </p>
        </div>

        {/* Legend & Zoom Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Legend */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-indigo-600 rounded-full"></span>
              Net Financial Worth
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded-full"></span>
              Cash Balance
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-rose-500 rounded-full"></span>
              Credit Debt
            </span>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-700 hover:text-indigo-600 hover:bg-white rounded-lg transition"
              title="Zoom In (Enables horizontal scroll bar)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className={`p-1.5 transition rounded-lg ${
                zoomLevel <= 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 hover:text-indigo-600 hover:bg-white'
              }`}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-xs font-bold text-indigo-600 hover:bg-white rounded-lg transition flex items-center gap-1 px-2"
                title="Reset Zoom to fit screen"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset ({Math.round(zoomLevel * 100)}%)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SVG Container - Responsive width & conditional scrollbar on zoom */}
      <div
        ref={containerRef}
        className={`w-full relative transition-all rounded-xl border border-slate-100 bg-slate-50/40 p-2 ${
          zoomLevel > 1 ? 'overflow-x-auto scrollbar-thin' : 'overflow-hidden'
        }`}
      >
        <svg
          width={zoomLevel > 1 ? actualSvgWidth : '100%'}
          height={svgHeight}
          viewBox={`0 0 ${actualSvgWidth} ${svgHeight}`}
          preserveAspectRatio={zoomLevel === 1 ? 'none' : undefined}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair block w-full"
        >
          <defs>
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines & Y-Axis Labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={actualSvgWidth - paddingRight}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 4}
                fill="#64748b"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
              >
                ${Math.round(tick.value).toLocaleString()}
              </text>
            </g>
          ))}

          {/* Zero Y Baseline */}
          {minY < 0 && maxY > 0 && (
            <line
              x1={paddingLeft}
              y1={getY(0)}
              x2={actualSvgWidth - paddingRight}
              y2={getY(0)}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          )}

          {/* Area under Net Balance */}
          <path d={areaPath} fill="url(#netGradient)" />

          {/* Lines */}
          {/* Credit Debt Line */}
          <path d={debtPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          {/* Cash Balance Line */}
          <path d={cashPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
          {/* Net Financial Balance Line */}
          <path d={netPath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />

          {/* X-Axis Tick Labels */}
          {xTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={tick.x}
                y1={svgHeight - paddingBottom}
                x2={tick.x}
                y2={svgHeight - paddingBottom + 5}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={tick.x}
                y={svgHeight - paddingBottom + 18}
                fill="#64748b"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Hover Cursor Line & Points */}
          {hoverIndex !== null && hoveredData && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={svgHeight - paddingBottom}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Point dots */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(hoveredData.netFinancialBalance)}
                r="5"
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(hoveredData.cashBalance)}
                r="4"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(hoveredData.totalCreditCardDebt)}
                r="4"
                fill="#f43f5e"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredData && hoverIndex !== null && (
          <div
            className="absolute z-20 bg-slate-900/90 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs pointer-events-none backdrop-blur-xs transition-all"
            style={{
              left: `${Math.min(
                Math.max(10, getX(hoverIndex) - 90),
                actualSvgWidth - 200
              )}px`,
              top: '15px',
            }}
          >
            <p className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1.5 flex justify-between gap-3">
              <span>Date:</span>
              <span className="text-white font-extrabold">{hoveredData.date}</span>
            </p>
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-indigo-300 font-medium">Net Worth:</span>
                <span className="font-bold">
                  ${hoveredData.netFinancialBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-emerald-400 font-medium">Cash Balance:</span>
                <span className="font-bold">
                  ${hoveredData.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-rose-400 font-medium">Credit Debt:</span>
                <span className="font-bold">
                  ${hoveredData.totalCreditCardDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              {hoveredData.concept && (
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 truncate max-w-[200px]">
                  Event: {hoveredData.concept} (${hoveredData.amount.toLocaleString()})
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
