import React, { useState } from 'react';
// Import the components correctly
import SalesList from './SalesList';
import ProfitLossChart from './ProfitLossChart';
import PendingProductsPrice from './PendingProductsPrice';
import '../styles/SalesManagerMenu.css';

const SalesManagerMenu = () => {
    const [activeTab, setActiveTab] = useState('chart');

    return(
        <div className='container'>
            <h1>Sales Manager Menu</h1>

            <div className='tabs'>
                <button
                    className={activeTab === 'chart' ? 'active' : ''}
                    onClick={() => setActiveTab('chart')}
                >
                    Sales Chart
                </button>
                <button
                    className={activeTab === 'products' ? 'active' : ''}
                    onClick={() => setActiveTab('products')}
                >
                    Manage Prices
                </button>
                <button
                    className={activeTab === 'pending' ? 'active' : ''}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Products
                </button>
            </div>
            <div className='tab-content'>
                {activeTab === 'chart' && <ProfitLossChart />}
                {activeTab === 'products' && <SalesList />}
                {activeTab === 'pending' && <PendingProductsPrice />}
            </div>
        </div>
    );
};

export default SalesManagerMenu;