// DashboardCharts.js
// Visual dashboard: line chart, bar chart, progress ring
import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, BarElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend);

export function CycleTrendChart({ data }) {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      label: 'Cycle Trend',
      data: data.map(d => d.value),
      borderColor: '#4F8EF7',
      backgroundColor: 'rgba(79,142,247,0.1)',
      tension: 0.4,
      fill: true,
    }],
  };
  return <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
}

export function SymptomsBarChart({ data }) {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      label: 'Symptoms Frequency',
      data: data.map(d => d.value),
      backgroundColor: '#F7B731',
    }],
  };
  return <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
}

export function HealthScoreRing({ score }) {
  // Progress ring using SVG
  const radius = 40;
  const stroke = 8;
  const normalizedScore = Math.max(0, Math.min(score, 100));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;
  return (
    <svg width="100" height="100">
      <circle cx="50" cy="50" r={radius} stroke="#eee" strokeWidth={stroke} fill="none" />
      <circle cx="50" cy="50" r={radius} stroke="#4F8EF7" strokeWidth={stroke} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s' }} />
      <text x="50" y="55" textAnchor="middle" fontSize="28" fill="#222">{score}%</text>
    </svg>
  );
}
