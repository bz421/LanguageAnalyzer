import Home from './Pages/Home'
import Language from './Pages/Language'
import Navbar from './Components/Navbar'
import Sidebar from './Components/Sidebar'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import {Router} from "express";

export default function App() {
    return (
        <div>
            <Router>
                <Navbar />
                {/*<Sidebar />*/}
                <Routes>
                    <Route path='/' exact element={<Home />} />
                    <Route path='/language/:lang' element = {<Language/>}/>

                    <Route path='/language/:lang' element = {<Language/>}/>
                </Routes>
            </Router>
        </div>
    )
}