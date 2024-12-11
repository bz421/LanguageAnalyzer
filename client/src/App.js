import Home from './Pages/Home'
import Spanish from './Pages/Spanish'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import {Router} from "express";

export default function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path='/' exact element={<Home />} />
                    <Route path='/spanish' element={<Spanish />} />
                </Routes>
            </Router>
        </div>
    )
}