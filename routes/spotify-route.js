import { Router } from "express";
import axios from "axios";

export default function spotifyRouterFactory(getSpotifyTokens) {
  const router = Router();

  router.get("/playlists", async (req, res) => {
    const tokens = await getSpotifyTokens();

    if (!tokens.access_token) {
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

      res.json(response.data);
    } catch (error) {
      console.error(
        "Error fetching Spotify playlists:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to fetch Spotify playlists" });
    }
  });

  return router;
}
