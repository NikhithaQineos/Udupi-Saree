import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './pages/AdminPage';
import './App.css'; // import global CSS
import 'bootstrap/dist/css/bootstrap.min.css'; // optional: if you're using Bootstrap

const App = () => {
  return (
    <div className="App"> {/* Apply consistent class name */}
      <Router>
        <Routes>
          <Route path="/" element={<AdminPanel />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
