import React from "react";
import Typewriter from "./TypeWriter";
import { useNavigate } from "react-router-dom";
// import './About.css';

function About() {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the Login component
  };
  return (
    <div className="about-container"  >
    
      <div className="text">
        <p>
        
         <Typewriter text=" Hi, I am Divya. I am a passionate Computer Science Engineer interested in coding and problem-solving.
          I have done two major projects and gained practical knowledge." delay={100} />
          <button onClick={handleLoginClick} > Login</button>
        </p>
       
      </div>
    </div>
  );
}

export default About;
