import { Router } from "express";
import axios from "axios";

export default function appleMusicRouterFactory(appleToken) {
  const router = Router();

  router.get("/playlists", async (req, res) => {
    if (!global.appleUserToken) {
      return res
        .status(401)
        .json({ error: "User not authenticated with Apple Music" });
    }

    try {
      const response = await axios.get(
        "https://api.music.apple.com/v1/me/library/playlists",
        {
          headers: {
            Authorization: `Bearer ${appleToken}`,
            "Music-User-Token": global.appleUserToken,
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error(
        "Error fetching Apple Music playlists:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to fetch Apple playlists" });
    }
  });

  return router;
}
