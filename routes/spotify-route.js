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
      return res
        .status(401)
        .json({ error: "User not authenticated with Spotify" });
    }

    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/playlists",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      res.json(response.data); // Respond with Spotify playlists data
    } catch (error) {
      console.error(
        "Error fetching Spotify playlists:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to fetch Spotify playlists" });
    }
  });

  router.get("/playlists/tracks", async (req, res) => {
    const tokens = getSpotifyTokens();
    if (!tokens) {
      return res.status(401).json({ error: "User not authenticated with Spotify" });
    }
  
    const { playlistId } = req.query;  // Get playlistId from query
    try {
      // Fetch playlist details first to get the tracks URL
      const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
      const playlistResponse = await axios.get(playlistUrl, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });
  
      // Extract the tracks URL from the playlist response
      const tracksUrl = playlistResponse.data.tracks.href;
  
      // Fetch the actual tracks from the extracted URL
      const tracksResponse = await axios.get(tracksUrl, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });
  
      res.json({
        items: tracksResponse.data.items,  // Return the tracks
      });
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
      res.status(500).json({ error: "Failed to fetch playlist tracks" });
    }
  });
  return router;
}

