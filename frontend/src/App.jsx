import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import PathopiaLogin from './components/PathopiaLogin';
import CareerSelection from './pages/CareerSelection/CareerSelection';
import Dashboard from './pages/Dashboard/Dashboard';
import About from './pages/About/About';
import Simulation from './pages/Simulation/Simulation';
import Reflection from './pages/Reflection/Reflection';
import History from './pages/History/History';
import ProtectedRoute from './components/ProtectedRoute';
import AudioProvider from './components/AudioProvider.jsx';

function App() {
    return (
        <BrowserRouter>
            <AudioProvider>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<PathopiaLogin />} />
                    <Route path="/register" element={<PathopiaLogin />} />
                    <Route path="/about" element={<About />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/career-selection" element={<CareerSelection />} />
                        <Route path="/simulation" element={<Simulation />} />
                        <Route path="/reflection" element={<Reflection />} />
                        <Route path="/history" element={<History />} />
                    </Route>
                </Routes>
            </AudioProvider>
        </BrowserRouter>
    );
}

export default App;