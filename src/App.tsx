import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes';
import { ScrollToTop } from './components/common/ScrollToTop';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;