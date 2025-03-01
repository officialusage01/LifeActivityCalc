import React, { useState, useEffect, useRef } from 'react';
import { PieChart, BarChart2, Clock, Download } from 'lucide-react';

interface ResultsDisplayProps {
  results: Record<string, number>;
  age: number;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, age }) => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'chart' | 'percentage'
  >('summary');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barCanvasRef = useRef<HTMLCanvasElement>(null);

  const activityLabels: Record<string, string> = {
    sleep: 'Sleep',
    eating: 'Eating',
    miscellaneous: 'Miscellaneous',
    learning: 'Learning',
    sports: 'Sports',
    screenTime: 'Screen Time',
    work: 'Work',
    travel: 'Travel',
  };

  const activityColors: Record<string, string> = {
    sleep: '#4F46E5', // indigo-600
    eating: '#EC4899', // pink-600
    miscellaneous: '#8B5CF6', // violet-600
    learning: '#10B981', // emerald-600
    sports: '#F59E0B', // amber-600
    screenTime: '#3B82F6', // blue-600
    work: '#6366F1', // indigo-500
    travel: '#EF4444', // red-600
  };

  const activityIcons: Record<string, string> = {
    sleep: '😴',
    eating: '🍽️',
    miscellaneous: '🔄',
    learning: '📚',
    sports: '🏃',
    screenTime: '📱',
    work: '💼',
    travel: '🚗',
  };

  // Format hours to a readable format
  const formatHours = (hours: number): string => {
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days < 365) {
      return `${days} days, ${remainingHours.toFixed(1)} hours`;
    }

    const years = Math.floor(days / 365);
    const remainingDays = Math.floor(days % 365);

    return `${years} years, ${remainingDays} days`;
  };

  // Calculate percentages of total time
  const calculatePercentages = (): Record<string, number> => {
    const total = Object.values(results).reduce((sum, val) => sum + val, 0);
    const percentages: Record<string, number> = {};

    Object.entries(results).forEach(([key, value]) => {
      percentages[key] = (value / total) * 100;
    });

    return percentages;
  };

  // Draw pie chart
  useEffect(() => {
    if (!canvasRef.current || !results) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const total = Object.values(results).reduce((sum, val) => sum + val, 0);
    let startAngle = 0;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    Object.entries(results).forEach(([key, value]) => {
      const portion = value / total;
      const endAngle = startAngle + portion * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = activityColors[key] || '#CCCCCC';
      ctx.fill();

      // Add label for segments that are large enough
      if (portion > 0.05) {
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${(portion * 100).toFixed(1)}%`, labelX, labelY);
      }

      startAngle = endAngle;
    });

    // Add a white circle in the center for better aesthetics
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Add a title in the center
    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Time Distribution', centerX, centerY);
  }, [results, activeTab]);

  // Draw bar chart
  useEffect(() => {
    if (!barCanvasRef.current || !results || activeTab !== 'chart') return;

    const ctx = barCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const sortedActivities = Object.entries(results)
      .sort(([, a], [, b]) => b - a)
      .filter(([, value]) => value > 0);

    const canvasWidth = barCanvasRef.current.width;
    const canvasHeight = barCanvasRef.current.height;
    const barWidth = canvasWidth / sortedActivities.length - 20;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Find the maximum value for scaling
    const maxValue = Math.max(...Object.values(results));

    // Draw title
    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Activity Comparison', canvasWidth / 2, 20);

    // Draw bars
    sortedActivities.forEach(([key, value], index) => {
      const barHeight = (value / maxValue) * (canvasHeight - 80); // Leave space for labels
      const x = index * (barWidth + 20) + 20;
      const y = canvasHeight - barHeight - 40;

      // Draw bar
      ctx.fillStyle = activityColors[key] || '#CCCCCC';
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = '#333333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      const displayValue =
        value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0);
      ctx.fillText(displayValue, x + barWidth / 2, y - 5);

      // Draw label
      ctx.fillStyle = '#333333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';

      // Rotate labels if there are many activities
      if (sortedActivities.length > 5) {
        ctx.save();
        ctx.translate(x + barWidth / 2, canvasHeight - 15);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(activityLabels[key], 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(activityLabels[key], x + barWidth / 2, canvasHeight - 15);
      }
    });
  }, [results, activeTab]);

  // Calculate interesting facts
  const calculateFacts = () => {
    if (!results) return [];

    const facts = [];
    const totalHours = Object.values(results).reduce(
      (sum, val) => sum + val,
      0
    );
    const percentages = calculatePercentages();

    // Sleep fact
    if (results.sleep) {
      const sleepYears = (results.sleep / 24 / 365).toFixed(1);
      facts.push(
        `You've spent approximately ${sleepYears} years sleeping in your life.`
      );
    }

    // Screen time fact
    if (results.screenTime && age > 3) {
      const screenDays = Math.floor(results.screenTime / 24);
      facts.push(`You've spent about ${screenDays} days looking at screens.`);
    }

    // Work vs leisure fact
    if (results.work && results.sports) {
      const workToSportsRatio = (results.work / results.sports).toFixed(1);
      facts.push(
        `For every hour of sports/exercise, you've spent ${workToSportsRatio} hours working.`
      );
    }

    // Highest percentage activity
    const highestActivity = Object.entries(percentages).sort(
      ([, a], [, b]) => b - a
    )[0];

    if (highestActivity) {
      facts.push(
        `Your most time-consuming activity is ${
          activityLabels[highestActivity[0]]
        }, taking up ${highestActivity[1].toFixed(1)}% of your tracked time.`
      );
    }

    // Add a comparison to average lifespan
    const totalYears = totalHours / 24 / 365;
    const averageLifespan = 79; // Average global lifespan in years
    const percentOfAvgLife = (totalYears / averageLifespan) * 100;

    facts.push(
      `The ${totalYears.toFixed(
        1
      )} years you've tracked represents approximately ${percentOfAvgLife.toFixed(
        1
      )}% of an average human lifespan.`
    );

    return facts;
  };

  const downloadCSV = () => {
    let csvContent = 'Activity,Hours,Percentage\n';
    const percentages = calculatePercentages();

    Object.entries(results).forEach(([key, value]) => {
      csvContent += `${activityLabels[key]},${value.toFixed(2)},${percentages[
        key
      ].toFixed(2)}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'life_activity_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fadeIn">
      <h2 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
        <Clock className="mr-2" size={24} /> Your Life in Hours
      </h2>

      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            activeTab === 'summary'
              ? 'bg-white shadow-md text-indigo-700 font-medium'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            activeTab === 'chart'
              ? 'bg-white shadow-md text-indigo-700 font-medium'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('chart')}
        >
          Charts
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            activeTab === 'percentage'
              ? 'bg-white shadow-md text-indigo-700 font-medium'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('percentage')}
        >
          Percentages
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results)
              .filter(([, value]) => value > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{activityIcons[key]}</span>
                    <h3 className="font-medium text-gray-800">
                      {activityLabels[key]}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-indigo-700">
                    {formatHours(value)}
                  </p>
                </div>
              ))}
          </div>

          <div className="mt-8 bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-3">
              Interesting Facts
            </h3>
            <ul className="space-y-2">
              {calculateFacts().map((fact, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={downloadCSV}
            className="flex items-center mt-4 bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Download Data as CSV
          </button>
        </div>
      )}

      {activeTab === 'chart' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <PieChart size={18} className="mr-2 text-indigo-600" />
                Time Distribution
              </h3>
              <div className="flex justify-center">
                <canvas ref={canvasRef} width={300} height={300}></canvas>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <BarChart2 size={18} className="mr-2 text-indigo-600" />
                Activity Comparison
              </h3>
              <div className="flex justify-center">
                <canvas ref={barCanvasRef} width={400} height={300}></canvas>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(activityLabels)
                .filter(([key]) => results[key] > 0)
                .map(([key, label]) => (
                  <div key={key} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: activityColors[key] }}
                    ></div>
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'percentage' && (
        <div>
          <p className="text-gray-600 mb-4">
            Here's how your time is distributed as a percentage of your total
            tracked time:
          </p>

          <div className="space-y-4">
            {Object.entries(calculatePercentages())
              .filter(([, value]) => value > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([key, percentage]) => (
                <div key={key} className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="mr-2">{activityIcons[key]}</span>
                      {activityLabels[key]}
                    </span>
                    <span className="text-sm font-medium text-indigo-700">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: activityColors[key],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Time Perspective</h3>
            <p className="text-gray-600">
              {Object.values(results)
                .reduce((sum, val) => sum + val, 0)
                .toFixed(0)}{' '}
              total hours tracked, which is approximately{' '}
              {(
                Object.values(results).reduce((sum, val) => sum + val, 0) /
                24 /
                365
              ).toFixed(1)}{' '}
              years of your {age.toFixed(1)} years of life.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
