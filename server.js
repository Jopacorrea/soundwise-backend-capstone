// server.js
// npm libraries
import axios from "axios";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import queryString from "query-string";

// local libraries
import appleMusicRouter from "./routes/apple-music-route.js"; // Route for Apple Music API
import appleAuthMiddleware from "./middleware/apple-auth.js"; // Apple Auth Middleware
import generateAppleToken from "./utils/generateAppleToken.js"; // Function to generate Apple Music JWT token
import spotifyRouterFactory from "./routes/spotify-route.js"; // Spotify Routes

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware setup
app.use(cors({
  origin: "https://soundwise-capstone.onrender.com",  // Ensure this is your React frontend URL
  credentials: true  // Allow credentials for session-based cookies
}));

app.use(express.json());  // Parse JSON bodies

// Generate Apple JWT Token
let appleToken = generateAppleToken();
//console.log("Apple Music Developer Token:", appleToken);

// Middleware for Apple Music authentication
app.use("/apple", appleAuthMiddleware);  // This will authenticate users for Apple Music

// Load Routes
app.use("/apple", appleMusicRouter); // Define Apple Music routes
app.use("/spotify", spotifyRouterFactory()); // Define Spotify routes

// 🔹 **Spotify Authentication - Redirect to Spotify Login**
app.get("/spotify/login", (req, res) => {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${queryString.stringify(
    {
      client_id: process.env.SPOTIFY_CLIENT_ID, // Spotify client ID from .env
      response_type: "code",  // Get authorization code
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI, // Callback URL
      scope: "user-library-read user-read-private user-read-email", // Permissions
    }
  )}`;

  res.redirect(spotifyAuthUrl); // Redirect to Spotify login page
});

// 🔹 **Spotify OAuth Callback**
app.get("/spotify/callback", async (req, res) => {
  const code = req.query.code || null;  // Get authorization code from query params
  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  console.log("Authorization code received:", code);

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      queryString.stringify({
        code: code,  // Authorization code
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,  // Callback URL
        grant_type: "authorization_code",  // Grant type for exchange
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`  // Encode client ID and secret
          ).toString("base64")}`,  // Base64-encoded credentials
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    console.log("Access Token:", access_token);

    // Store tokens temporarily (you can store them in a session or database in production)
    global.spotifyTokens = { access_token, refresh_token };

    // Redirect to frontend with access token in URL
    res.redirect(`https://soundwise-capstone.onrender.com/auth?access_token=${access_token}`);
  } catch (error) {
    console.error("Error exchanging token:", error.response?.data || error.message);
    res.status(500).send("Failed to authenticate with Spotify");
  }
});

// 🔹 **Endpoint to handle Transfer to Apple Music**
app.post("/apple/transfer", async (req, res) => {
  const { playlist, tracks } = req.body; // Playlist and tracks from the frontend

  if (!playlist || !tracks || tracks.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid playlist or tracks data." });
  }

  try {
    // Create playlist in Apple Music
    const appleMusicPlaylist = await createAppleMusicPlaylist(playlist);

    // Add tracks to the Apple Music playlist
    const addTracksResponse = await addTracksToAppleMusicPlaylist(
      appleMusicPlaylist.id,
      tracks
    );

    if (addTracksResponse.success) {
      res.json({ success: true, message: "Transfer successful." });
    } else {
      res.status(500).json({ success: false, message: "Failed to add tracks to Apple Music." });
    }
  } catch (error) {
    console.error("Error during transfer to Apple Music:", error);
    res.status(500).json({ success: false, message: "Error during transfer." });
  }
});

// Function to create a playlist in Apple Music
const createAppleMusicPlaylist = async (playlist) => {
  const response = await axios.post(
    "https://api.music.apple.com/v1/me/library/playlists",
    {
      attributes: {
        name: playlist.name,
        description: playlist.description || "No description",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${appleToken}`,  // Use the Apple Music Developer Token
        "Content-Type": "application/json",
      },
    }
  );

  const data = response.data.data[0]; // Assuming the response data contains the playlist
  return data;
};

// Function to add tracks to the Apple Music playlist
const addTracksToAppleMusicPlaylist = async (playlistId, tracks) => {
  // Map tracks to Apple Music URIs (you might need to search for the track on Apple Music first)
  const trackIds = tracks.map(track => track.uri);  // Ensure track URIs are correctly formatted

  const response = await axios.post(
    `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`,
    {
      data: trackIds.map(uri => ({ id: uri, type: "songs" })),
    },
    {
      headers: {
        Authorization: `Bearer ${appleToken}`,  // Apple Music Developer Token
        "Content-Type": "application/json",
      },
    }
  );

  const data = response.data;
  return data;
};

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at https://soundwise-capstone.onrender.com`);
});