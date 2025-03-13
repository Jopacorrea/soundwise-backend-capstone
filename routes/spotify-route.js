// routes/spotify-route.js
import { Router } from "express";
import axios from "axios";

export default function spotifyRouterFactory() {
  const router = Router();

  // Mock function to get stored Spotify tokens. Replace with real storage method.
  const getSpotifyTokens = () => {
    if (global.spotifyTokens && global.spotifyTokens.access_token) {
      return global.spotifyTokens; // Return stored tokens
    }
    return null; // Return null if no tokens are found
  };

  router.get("/playlists", async (req, res) => {
    const tokens = getSpotifyTokens();

    if (!tokens) {
      return res.status(401).json({ error: "User not authenticated with Spotify" });
    }

    try {
      const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      res.json(response.data); // Respond with Spotify playlists data
    } catch (error) {
      console.error("Error fetching Spotify playlists:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch Spotify playlists" });
    }
  });

  return router;
}