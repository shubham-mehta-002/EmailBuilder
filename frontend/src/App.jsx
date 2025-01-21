import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Templates from './components/Templates';
import EmailBuilder from './components/EmailBuilder';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      {/* <Navbar /> */}
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/templates"
              element={
                <PrivateRoute>
                  <div>
                    <Templates />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/builder/:id"
              element={
                <PrivateRoute>
                  <div>
                    <Navbar />
                    <EmailBuilder />
                  </div>
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/templates" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
