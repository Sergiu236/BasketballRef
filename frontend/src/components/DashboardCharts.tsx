// src/components/DashboardCharts.tsx
import React, { useContext, useMemo } from 'react';
import { RefereeContext } from '../context/RefereeContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts';

// Some colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardCharts: React.FC = () => {
  const { referees } = useContext(RefereeContext);

  // 1) Bar Chart: Referees per league
  const leagueData = useMemo(() => {
    // group referees by league
    const leagueCount: Record<string, number> = {};
    referees.forEach((referee) => {
      const league = referee.league;
      if (!leagueCount[league]) {
        leagueCount[league] = 0;
      }
      leagueCount[league]++;
    });
    // convert to array for Recharts
    return Object.entries(leagueCount).map(([league, count]) => ({
      league,
      count,
    }));
  }, [referees]);

  // 2) Pie Chart: Grade distribution (matching your 4-tier logic)
  // For example: best / worst / silver / bronze. We'll just do the counts for each.
  // If you want to replicate the EXACT logic, you can do that. This example uses simpler categories.

  const { bestCount, worstCount, silverCount, bronzeCount } = useMemo(() => {
    if (referees.length === 0) {
      return { bestCount: 0, worstCount: 0, silverCount: 0, bronzeCount: 0 };
    }

    const bestGrade = Math.max(...referees.map((r) => r.grade));
    const worstGrade = Math.min(...referees.map((r) => r.grade));

    let bestCount = 0;
    let worstCount = 0;
    let silverCount = 0;
    let bronzeCount = 0;

    // middle group => top half => silver, bottom half => bronze
    // let's gather the middle folks
    const middle = referees.filter(
      (r) => r.grade !== bestGrade && r.grade !== worstGrade
    );
    // sort descending
    middle.sort((a, b) => b.grade - a.grade);
    const halfIndex = Math.floor(middle.length / 2);

    referees.forEach((r) => {
      if (r.grade === bestGrade) {
        bestCount++;
      } else if (r.grade === worstGrade) {
        worstCount++;
      }
    });

    // now silver & bronze for the middle
    middle.forEach((_, i) => {
      if (i < halfIndex) silverCount++;
      else bronzeCount++;
    });

    return { bestCount, worstCount, silverCount, bronzeCount };
  }, [referees]);

  const gradePieData = useMemo(() => {
    return [
      { name: 'Best', value: bestCount },
      { name: 'Worst', value: worstCount },
      { name: 'Silver', value: silverCount },
      { name: 'Bronze', value: bronzeCount },
    ];
  }, [bestCount, worstCount, silverCount, bronzeCount]);

  // 3) Line Chart: average grade by age
  // We group referees by age and compute average grade per age
  const gradeByAgeData = useMemo(() => {
    const mapAge: Record<number, { sum: number; count: number }> = {};

    referees.forEach((referee) => {
      const age = referee.age;
      if (!mapAge[age]) {
        mapAge[age] = { sum: 0, count: 0 };
      }
      mapAge[age].sum += referee.grade;
      mapAge[age].count++;
    });

    // Convert to array sorted by age
    const dataArray = Object.entries(mapAge).map(([ageStr, obj]) => {
      const ageNum = parseInt(ageStr, 10);
      return {
        age: ageNum,
        avgGrade: obj.sum / obj.count,
      };
    });
    dataArray.sort((a, b) => a.age - b.age);
    return dataArray;
  }, [referees]);

  return (
    <div style={{ padding: '10px' }}>
      <h4 style={{ marginBottom: '8px' }}>Referees per League</h4>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={leagueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="league" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h4 style={{ margin: '20px 0 8px' }}>Grade Distribution</h4>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={gradePieData}
            dataKey="value"
            nameKey="name"
            outerRadius={60}
            fill="#8884d8"
            label
          >
            {gradePieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <h4 style={{ margin: '20px 0 8px' }}>Average Grade by Age</h4>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={gradeByAgeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Line type="monotone" dataKey="avgGrade" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardCharts;
