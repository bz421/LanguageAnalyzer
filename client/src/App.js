import Home from './Pages/Home'
import Language from './Pages/Language'
import Navbar from './Pages/Navbar'
import Sidebar from './Pages/Sidebar'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import {Router} from "express";

export default function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path='/' exact element={<Home />} />
                    <Route path='/language/:lang' element = {<Language/>}/>
                </Routes>
            </Router>
        </div>
    )
}