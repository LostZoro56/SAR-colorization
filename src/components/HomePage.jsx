import { useState } from "react";
import video from "../assets/homepagevideo.mp4";
import "./HomePage.css";
import Navbar from "./Navbar";

function HomePage() {
  const [isClicked, setIsClicked] = useState(false); // Track button click state

  const handleButtonClick = () => {
    setIsClicked(true); // Set to true when the button is clicked
  };

  return (
    <div className="home-page">
      <Navbar />

      <video
        className="background-video"
        autoPlay
        loop
        muted
        style={{
          filter: isClicked ? "grayscale(0%)" : "grayscale(100%)", // Change grayscale based on button click
        }}
      >
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="dark-overlay"></div>
      <div className="corner-text mt-11">SAR IMAGE COLORIZATION</div>

      <div className="description">
        <p className="text-font-title">What is SAR Image Colorization?</p>
        <p className="text-font">
          SAR (Synthetic Aperture Radar) images provide detailed surface
          information, even in challenging weather or lighting conditions.
          However, they lack color, making interpretation less intuitive. Our
          platform bridges this gap by applying deep learning techniques to
          transform grayscale SAR images into vibrant, colorized versions that
          highlight meaningful features.
        </p>
        <p className="text-font">
          Upload a SAR image, let our AI work its magic, and download the
          enhanced colorized version.
        </p>
        <button
          className="call-to-action"
          onMouseEnter={handleButtonClick} // Set grayscale to color on button click
        >
          <span>Start your colorization now!</span>
        </button>
      </div>
    </div>
  );
}

export default HomePage;
