import React, { useState, useEffect } from 'react';
import TenderSummary from './components/TenderSummary';
import TenderDetails from './components/TenderDetails';
import TenderRegistration from './components/TenderRegistration';
import ProductManagement from './components/ProductManagement';
import MarginChart from './components/MarginChart';
import { TenderSummary as TenderSummaryType } from './types';
import { tenderApi } from './api';

type View = 'summary' | 'details' | 'registration' | 'products' | 'charts';

function App() {
  const [currentView, setCurrentView] = useState<View>('summary');
  const [selectedTenderId, setSelectedTenderId] = useState<number | null>(null);
  const [tenders, setTenders] = useState<TenderSummaryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentView === 'summary') {
      loadTenders();
    }
  }, [currentView]);

  const loadTenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tenderApi.getTendersSummary();
      setTenders(data);
    } catch (err: any) {
      setError('Failed to load tenders: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTenderSelect = (tenderId: number) => {
    setSelectedTenderId(tenderId);
    setCurrentView('details');
  };

  const handleTenderCreated = () => {
    setCurrentView('summary');
    loadTenders();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'summary':
        return (
          <TenderSummary
            tenders={tenders}
            loading={loading}
            error={error}
            onTenderSelect={handleTenderSelect}
            onRefresh={loadTenders}
          />
        );
      case 'details':
        return selectedTenderId ? (
          <TenderDetails tenderId={selectedTenderId} />
        ) : (
          <div className="error">No tender selected</div>
        );
      case 'registration':
        return <TenderRegistration onTenderCreated={handleTenderCreated} />;
      case 'products':
        return <ProductManagement />;
      case 'charts':
        return <MarginChart tenders={tenders} />;
      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Bid Management System</h1>
        <p>Commercial Tender Management Platform</p>
      </div>

      <div className="container">
        <div className="navigation">
          <div className="nav-buttons">
            <button
              className={`nav-button ${currentView === 'summary' ? 'active' : ''}`}
              onClick={() => setCurrentView('summary')}
            >
              Tender Summary
            </button>
            <button
              className={`nav-button ${currentView === 'registration' ? 'active' : ''}`}
              onClick={() => setCurrentView('registration')}
            >
              Register Tender
            </button>
            <button
              className={`nav-button ${currentView === 'products' ? 'active' : ''}`}
              onClick={() => setCurrentView('products')}
            >
              Manage Products
            </button>
            <button
              className={`nav-button ${currentView === 'charts' ? 'active' : ''}`}
              onClick={() => setCurrentView('charts')}
            >
              Margin Analysis
            </button>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

export default App;
