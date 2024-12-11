import Home from './Pages/Home'
import Spanish from './Pages/Spanish'
import French from './Pages/French'
import Mandarin from './Pages/Mandarin'
import Navbar from './Pages/Navbar'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import {Router} from "express";

export default function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path='/' exact element={<Home />} />
                    <Route path='/spanish/' element={<Spanish />} />
                    <Route path='/french/' element={<French />}/>
                    <Route path='/mandarin/' element={<Mandarin />}/>
                </Routes>
            </Router>
        </div>
    )
}