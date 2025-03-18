//Routes/aplle-music-route.js
import axios from "axios";
import express from "express";
import generateAppleToken from "../utils/generateAppleToken.js";

const router = express.Router();

// ✅ Fetch Apple Music Playlists
router.get("/apple-playlists", async (req, res) => {
  if (!global.appleUserToken) {
    console.error("❌ Error: Apple Music user token is missing.");
    return res.status(401).json({ error: "User not authenticated with Apple Music" });
  }

  const appleToken = generateAppleToken(); // Generate fresh token before request
  console.log("✅ Apple Token:", appleToken);
  console.log("✅ Apple User Token:", global.appleUserToken);

  try {
    const response = await axios.get("https://api.music.apple.com/v1/me/library/playlists", {
      headers: {
        Authorization: `Bearer ${appleToken}`,
        "Music-User-Token": global.appleUserToken,
      },
    });

    console.log("✅ Apple Music API Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching Apple Music playlists:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch Apple playlists" });
  }
});

router.get("/token", (req, res) => {
  try {
    const appleToken = generateAppleToken();
    res.json({ appleToken });
  } catch (error) {
    console.error("Error generating Apple token:", error.message);
    res.status(500).json({ error: "Failed to generate Apple Music token" });
  }
});

export default router;
