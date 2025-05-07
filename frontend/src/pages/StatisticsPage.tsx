// src/pages/StatisticsPage.tsx
import React, { useState, useContext, useMemo } from 'react';
import { RefereeContext } from '../context/RefereeContext';
// Import the useWebSocket hook from your websocket folder
import { useWebSocket } from '../websocket/useWebSocket';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import {
  getLeagueBarData,
  getTierPieData,
  getGradeByAgeData
} from '../utils/chartUtils';
import './StatisticsPage.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

type ChartType = 'bar' | 'pie' | 'line';

const StatisticsPage: React.FC = () => {
  const { referees } = useContext(RefereeContext);
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Precompute data from referees stored in context
  const barData = useMemo(() => getLeagueBarData(referees), [referees]);
  const pieData = useMemo(() => getTierPieData(referees), [referees]);
  const lineData = useMemo(() => getGradeByAgeData(referees), [referees]);

  // Subscribe to real-time updates for referee creation
  useWebSocket({
    eventName: 'refereeCreated',
    onMessage: (newReferee) => { 
      // Here you may update local state or simply log the new referee.
      // If the RefereeContext already updates state via a separate subscription,
      // this extra update might be optional.
      console.log('New referee received via WebSocket:', newReferee);
    }
  });

  return (
    <div className="statistics-page-container">
      <h2 className="stats-title">Referee Statistics</h2>

      {/* Chart buttons */}
      <div className="chart-buttons">
        <button
          className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`}
          onClick={() => setChartType('bar')}
        >
          Bar Chart
        </button>
        <button
          className={`chart-btn ${chartType === 'pie' ? 'active' : ''}`}
          onClick={() => setChartType('pie')}
        >
          Pie Chart
        </button>
        <button
          className={`chart-btn ${chartType === 'line' ? 'active' : ''}`}
          onClick={() => setChartType('line')}
        >
          Line Chart
        </button>
      </div>

      {/* Chart container */}
      <div className="chart-wrapper">
        {chartType === 'bar' && (
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="league" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'pie' && (
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartType === 'line' && (
          <ResponsiveContainer>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="avgGrade" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
