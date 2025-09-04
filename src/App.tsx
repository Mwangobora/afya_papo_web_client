import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { RoleBasedRoute } from './components/rbac/RoleBasedRoute';
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";



const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public routes */}
            <Route path='/dashboard' element = {<AppLayout />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <RoleBasedRoute requiredRole="HOSPITAL_ADMIN">
                  <div>Hospital Dashboard</div>
                </RoleBasedRoute>
              }
            />
            
            <Route
              path="/bed-management"
              element={
                <RoleBasedRoute 
                  requiredRole="HOSPITAL_ADMIN" 
                  requiredPermission="canManageBeds"
                >
                  <div>Bed Management</div>
                </RoleBasedRoute>
              }
            />
            
            <Route
              path="/ambulance-fleet"
              element={
                <RoleBasedRoute 
                  requiredRole="HOSPITAL_ADMIN"
                  requiredPermission="canManageAmbulances"
                >
                  <div>Ambulance Fleet</div>
                </RoleBasedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;