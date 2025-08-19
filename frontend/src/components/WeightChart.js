// frontend/src/components/WeightChart.js

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registreer de onderdelen die Chart.js nodig heeft
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function WeightChart({ weightData }) {
  if (!weightData || weightData.length === 0) {
    return <p>Nog geen gewichtsdata om een grafiek te tonen. Log je gewicht om te beginnen!</p>;
  }

  // Bereid de data voor op de grafiek
  const chartData = {
    labels: weightData.map(log => new Date(log.datum).toLocaleDateString('nl-NL')), // Datums op de X-as
    datasets: [
      {
        label: 'Gewicht (kg)',
        data: weightData.map(log => log.gewicht), // Gewichten op de Y-as
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Jouw Gewichtsverloop',
      },
    },
  };

  return <Line options={options} data={chartData} />;
}

export default WeightChart;
