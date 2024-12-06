import Home from './Pages/Home'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import {Router} from "express";

export default function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path='/' exact element={<Home />} />
                </Routes>
            </Router>
        </div>
    )
}