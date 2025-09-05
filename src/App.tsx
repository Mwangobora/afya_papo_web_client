import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ThemeProvider } from "./context/ThemeContext.tsx";

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className=" ">

          <AppRoutes />
        </div>
      </Router>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;