import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import PathopiaLogin from './components/PathopiaLogin';
import CareerSelection from './pages/CareerSelection/CareerSelection';
import About from './pages/About/About';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<PathopiaLogin />} />
                <Route path="/register" element={<PathopiaLogin />} />
                <Route path="/career-selection" element={<CareerSelection />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;