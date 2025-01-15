import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import "aos/dist/aos.css";
import AOS from "aos";
import "./Home.css";

import Taco from "../Images/taco.jpg";
import Baguette from "../Images/baguette.jpg";
import Dumplings from "../Images/dumplings.jpg";

import SpanishAnalysis from '../Images/SpanishAnalysis.png'
import SpecialChengyu from '../Images/SpecialChengyu.png'
import FrenchVerb from '../Images/FrenchVerb.png'

export default function Home() {
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const getMessage = async () => {
        await fetch("/api/hello")
            .then((res) => res.json())
            .then((data) => {
                setMsg(data.message);
                console.log(data.message);
            });
    };

    useEffect(() => {
        AOS.init({duration: 1000});
        // getMessage();
    }, []);

    return (
        <div className="home-container">
            {/* Navbar */}
            <Navbar/>

            {/* Hero Section */}
            <div className="hero-section" data-aos="fade-up">
                <h1 className="hero-title">Welcome to Language Analyzer</h1>
                <p className="hero-subtitle">Improve your language skills today</p>
            </div>

            {/* Language Menu */}
            <div className="menu-container">
                <div className="menu-card" data-aos="fade-right">
                    <img
                        src={Taco}
                        alt="Spanish"
                        className="menu-image"
                    />
                    <button onClick={() => navigate("/language/es/")}>Spanish</button>
                </div>
                <div className="menu-card" data-aos="fade-up">
                    <img
                        src={Baguette}
                        alt="French"
                        className="menu-image"
                    />
                    <button onClick={() => navigate("/language/fr")}>French</button>
                </div>
                <div className="menu-card" data-aos="fade-left">
                    <img
                        src={Dumplings}
                        alt="Mandarin"
                        className="menu-image"
                        style={{objectPosition: '100% 100%'}}
                    />
                    <button onClick={() => navigate("/language/zh")}>Mandarin</button>
                </div>
            </div>

            <div id="info">
                <div className="mockPic" data-aos="fade-right">
                    <img src={SpanishAnalysis} style={{width: '550px', height: '550px'}} id="catMock"
                         alt="Device mockup for categories"/>

                </div>
                <div className="mockText" data-aos="fade-right">
                    <h2>Advanced Sentence Comprehension</h2>
                    <p>Language Analyzer utilizes cutting-edge AI-powered NLP techniques to deconstruct and interpret
                        every component of your sentence.</p>
                </div>

                <div className="mockText" data-aos="fade-right">
                    <h2>Multilingual support</h2>
                    <p>All 3 languages offered here at BCA: Spanish, French, and Mandarin are supported with unique
                        features for each</p>
                </div>
                <div className="mockPic" data-aos="fade-right">
                    <img src={SpecialChengyu} style={{width: '550px', height: '550px'}} id="catMock"
                         alt="Device mockup for categories"/>
                </div>

                <div className="mockPic" data-aos="fade-right">
                    <img src={FrenchVerb} style={{width: '550px', height: '550px'}} id="catMock"
                         alt="Device mockup for categories"/>
                </div>
                <div className="mockText" data-aos="fade-right">
                    <h2>In-depth explanations</h2>
                    <p>Never struggle again with verb tenses, conjugations, etc with our built-in conjugation and reference lookup. </p>
                </div>

            </div>
            {/* Sidebar */}
            <Sidebar/>
        </div>
    );
}
