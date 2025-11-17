const express = require("express");
const axios = require("axios");
const router = express.Router();

// GET /api/surf/forecast – מביא תחזית עם המרות והמלצות (כמו ב-component)
router.get("/forecast", async (req, res) => {
  const { lat = 32.08, lng = 34.78 } = req.query; // פרמטרים למיקום

  try {
    const apiRes = await axios.get(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wind_speed,wind_direction`
    );
    const hourly = apiRes.data.hourly;

    // עיבוד עם אותן פונקציות (העתק directionToText, kmhToKnots, getSurfRecommendation מ-WaveForecast)
    const processedData = hourly.time.slice(0, 6).map((time, index) => {
      const waveHeight = Math.round(hourly.wave_height[index] * 10) / 10;
      const windSpeedKmh = hourly.wind_speed[index];
      const windSpeedKnots = kmhToKnots(windSpeedKmh);
      const windDirDegrees = hourly.wind_direction[index];
      const windDirText = directionToText(windDirDegrees);
      const rec = getSurfRecommendation(
        waveHeight,
        windSpeedKnots,
        windDirText
      );
      const formattedTime = new Date(time).toLocaleString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
      });

      return {
        time: formattedTime,
        waveHeight,
        windSpeedKnots,
        windDirection: `${windDirText} (${windDirDegrees}°)`,
        recommendation: { ...rec },
      };
    });

    res.json({ location: { lat, lng }, forecast: processedData });
  } catch (error) {
    res.status(500).json({ error: "שגיאה בטעינת תחזית" });
  }
});

module.exports = router;
