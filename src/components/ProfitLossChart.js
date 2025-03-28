import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Cell,
  } from 'recharts';
import '../styles/ProfitLossChart.css';
//sample data until we send api

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const products = [
    { id: 1, name: "Air Jordan 1", price: 199 },
    { id: 2, name: "Nike Dunk", price: 150 },
    { id: 3, name: "Yeezy 350 Boost", price: 320 },
    { id: 4, name: "Yeezy Slide", price: 130 },
];
  
const monthlyData = months.map(month => {
    let net = 0;
  
    products.forEach(product => {
      let unitssold = Math.floor(Math.random() * 150) + 50;
      let cost = (product.price / 2) * 200; //each shoe has fixed 200 stock
      let revenue = unitssold * product.price;
      net += revenue - cost;
    });
  
    return {
      month,
      net,
    };
});

const ProfitLossChart = () => {
    return (
        <div className="chart-container">
            <h2>Monthly Net Income</h2>
            <ResponsiveContainer width="102%" height={450}>
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}/>
                    <Tooltip formatter={val => `$${val.toLocaleString()}`}   wrapperStyle={{ transition: 'none' }} contentStyle={{ transition: 'none' }}/>
                    <Bar dataKey="net" name="Net Income" isAnimationActive={false}>
                        {monthlyData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.net >= 0 ? "green" : "red"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div> 
    );
  };
export default ProfitLossChart;