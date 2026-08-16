import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import PathopiaLogin from './components/PathopiaLogin';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<PathopiaLogin />} />
                <Route path="/register" element={<PathopiaLogin />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;