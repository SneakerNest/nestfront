import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Cell,
    Legend,
} from 'recharts';
import axios from 'axios';
import '../styles/ProfitLossChart.css';

const ProfitLossChart = () => {
    const [financialData, setFinancialData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('month'); // month, quarter, year
    const [customRange, setCustomRange] = useState({
        startDate: '',
        endDate: ''
    });

    // Calculate default date ranges
    const getDefaultDateRange = (range) => {
        const today = new Date();
        let startDate = new Date();
        
        switch(range) {
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(today.getMonth() - 1);
        }
        
        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        };
    };

    useEffect(() => {
        if (dateRange !== 'custom') {
            const dates = getDefaultDateRange(dateRange);
            setCustomRange(dates);
            fetchFinancialData(dates.startDate, dates.endDate);
        }
    }, [dateRange]);

    const fetchFinancialData = async (startDate, endDate) => {
        try {
            setLoading(true);
            const response = await axios.post('/financial/report', {
                startDate,
                endDate
            });
            
            // Transform and prepare data for the chart
            const preparedData = prepareChartData(response.data);
            setFinancialData(preparedData);
            setError(null);
        } catch (err) {
            console.error('Error fetching financial data:', err);
            setError('Failed to load financial data. Please try again.');
            setFinancialData([]);
        } finally {
            setLoading(false);
        }
    };

    const prepareChartData = (data) => {
        // If date grouping is applied on the server side, we can use it directly
        if (Array.isArray(data.timeSeriesData)) {
            return data.timeSeriesData.map(item => ({
                period: item.period,
                revenue: parseFloat(item.revenue),
                cost: parseFloat(item.cost),
                profit: parseFloat(item.profit)
            }));
        }
        
        // Otherwise, return summary data
        return [
            {
                period: 'Total',
                revenue: parseFloat(data.totalRevenue),
                cost: parseFloat(data.totalCost),
                profit: parseFloat(data.totalProfit)
            }
        ];
    };

    const handleCustomRangeChange = (e) => {
        const { name, value } = e.target;
        setCustomRange({
            ...customRange,
            [name]: value
        });
    };

    const handleCustomRangeSubmit = (e) => {
        e.preventDefault();
        fetchFinancialData(customRange.startDate, customRange.endDate);
    };

    // Format currency for tooltips and summaries
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    // Calculate summary values
    const calculateSummary = () => {
        if (financialData.length === 0) return { revenue: 0, cost: 0, profit: 0 };
        
        return financialData.reduce((acc, curr) => {
            return {
                revenue: acc.revenue + (curr.revenue || 0),
                cost: acc.cost + (curr.cost || 0),
                profit: acc.profit + (curr.profit || 0)
            };
        }, { revenue: 0, cost: 0, profit: 0 });
    };

    const summary = calculateSummary();

    if (loading) {
        return <div className="chart-container loading">Loading financial data...</div>;
    }

    if (error) {
        return <div className="chart-container error">{error}</div>;
    }

    return (
        <div className="chart-container">
            <h2>Financial Performance</h2>
            
            <div className="chart-controls">
                <div className="date-range-selector">
                    <label>Date Range:</label>
                    <select 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                
                {dateRange === 'custom' && (
                    <form onSubmit={handleCustomRangeSubmit} className="custom-date-form">
                        <div className="date-input">
                            <label>Start Date:</label>
                            <input 
                                type="date" 
                                name="startDate"
                                value={customRange.startDate}
                                onChange={handleCustomRangeChange}
                                required
                            />
                        </div>
                        <div className="date-input">
                            <label>End Date:</label>
                            <input 
                                type="date" 
                                name="endDate"
                                value={customRange.endDate}
                                onChange={handleCustomRangeChange}
                                required
                            />
                        </div>
                        <button type="submit">Apply</button>
                    </form>
                )}
            </div>
            
            <div className="financial-summary">
                <div className="summary-card revenue">
                    <h3>Total Revenue</h3>
                    <p>{formatCurrency(summary.revenue)}</p>
                </div>
                <div className="summary-card cost">
                    <h3>Total Cost</h3>
                    <p>{formatCurrency(summary.cost)}</p>
                </div>
                <div className={`summary-card profit ${summary.profit >= 0 ? 'positive' : 'negative'}`}>
                    <h3>{summary.profit >= 0 ? 'Total Profit' : 'Total Loss'}</h3>
                    <p>{formatCurrency(Math.abs(summary.profit))}</p>
                </div>
            </div>
            
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis 
                            tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} 
                        />
                        <Tooltip 
                            formatter={(value) => [`${formatCurrency(value)}`, null]} 
                            labelFormatter={(label) => `Period: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#4CAF50">
                            {financialData.map((entry, index) => (
                                <Cell key={`revenue-${index}`} fill="#4CAF50" />
                            ))}
                        </Bar>
                        <Bar dataKey="cost" name="Cost" fill="#FF9800">
                            {financialData.map((entry, index) => (
                                <Cell key={`cost-${index}`} fill="#FF9800" />
                            ))}
                        </Bar>
                        <Bar dataKey="profit" name="Profit" fill="#2196F3">
                            {financialData.map((entry, index) => (
                                <Cell 
                                    key={`profit-${index}`} 
                                    fill={entry.profit >= 0 ? "#2196F3" : "#F44336"} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProfitLossChart;