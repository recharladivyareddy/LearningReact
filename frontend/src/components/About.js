import React from "react";
import Typewriter from "./TypeWriter";
// import './About.css';

function About() {
  return (
    <div className="about-container"  >
    
      <div className="text">
        <p>
        
         <Typewriter text=" Hi, I am Divya. I am a passionate Computer Science Engineer interested in coding and problem-solving.
          I have done two major projects and gained practical knowledge." delay={100} />
      
        </p>
       
      </div>
    </div>
  );
}

export default About;
