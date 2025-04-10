
import React from 'react';
import { mockServerStats } from '@/lib/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const TrafficChart = () => {
  // Combine traffic data from all servers
  const combinedData = mockServerStats[0]?.trafficData.map((item, index) => {
    // Sum up traffic from all servers for each timestamp
    const timestamp = item.timestamp;
    const inbound = mockServerStats.reduce((sum, server) => {
      return sum + (server.trafficData[index]?.inbound || 0);
    }, 0);
    
    const outbound = mockServerStats.reduce((sum, server) => {
      return sum + (server.trafficData[index]?.outbound || 0);
    }, 0);
    
    return {
      timestamp: timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      inbound: inbound / (1024 * 1024), // Convert to MB
      outbound: outbound / (1024 * 1024), // Convert to MB
    };
  }) || [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={combinedData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="timestamp"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value.toFixed(0)} MB`}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(2)} MB`, undefined]}
          labelFormatter={(label) => `时间: ${label}`}
        />
        <Legend 
          formatter={(value) => (value === 'inbound' ? '入站流量' : '出站流量')}
        />
        <Area 
          type="monotone" 
          dataKey="inbound" 
          stackId="1"
          stroke="hsl(var(--primary))" 
          fill="hsl(var(--primary)/30)" 
          name="inbound"
        />
        <Area 
          type="monotone" 
          dataKey="outbound" 
          stackId="2"
          stroke="hsl(var(--secondary))" 
          fill="hsl(var(--secondary)/30)"
          name="outbound"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
