import React, { useState, useEffect } from "react";

const ThemeSlider = () => {
  //const [hue, setHue] = useState(0);
   const storedHue = localStorage.getItem("themeHue");
   const initialHue = storedHue ? parseInt(storedHue, 10) : 0;
   const [hue, setHue] = useState(initialHue);

  useEffect(() => {
    const root = document.querySelector(":root");
    root.style.setProperty("--primary-color", `oklch(45.12% 0.267 ${hue})`);
    root.style.setProperty("--secondary-color", `oklch(94.45% 0.03 ${hue})`);
    root.style.setProperty("--Default-color", `oklch(70% 0.099 197.36 ${hue})`);
    localStorage.setItem("themeHue", hue.toString());

  }, [hue]);

  const handleSliderChange = (event) => {
    const newHue = event.target.value;
  
    setHue(newHue);
    document.documentElement.style.setProperty("--user-theme-color-hue", newHue);

  };

  return (
    <div>
      <input
        className="theme input"
        type="range"
        min="0"
        max="360"
        step="1"
        value={hue}
        onChange={handleSliderChange}
      />
    </div>
  );
};

export default ThemeSlider;
