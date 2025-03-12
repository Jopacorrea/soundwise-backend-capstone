// npm libraries
import axios from "axios";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import queryString from "query-string";
import jwt from "jsonwebtoken";
import fs from "fs";

import spotifyRouterFactory from "./routes/spotify-route.js";
import appleMusicRouterFactory from "./routes/apple-music-route.js";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 8000;

// Spotify API credentials
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// Apple API credentials
const team_id = process.env.APPLE_TEAM_ID;
const key_id = process.env.APPLE_KEY_ID;
const token_key = process.env.APPLE_SECRET_TOKEN_KEY;
const private_key_path = process.env.APPLE_PRIVATE_KEY_PATH;

// Read private key for Apple authentication
const private_key = fs.readFileSync(private_key_path, "utf8").trim();

// Generate Apple JWT token
const appleToken = jwt.sign({}, private_key, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: team_id,
  header: { alg: "ES256", kid: key_id },
});

// Store the Spotify token and refresh token in memory for now
let spotifyTokens = {};

// Enable CORS
app.use(cors());
app.use(express.json()); // To handle JSON requests

// 🔹 **Step 1: Redirect to Spotify's Authorization Page**
app.get("/login", (req, res) => {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${queryString.stringify(
    {
      client_id: client_id,
      response_type: "code",
      redirect_uri: redirect_uri,
      scope: "user-library-read user-read-private user-read-email",
    }
  )}`;

  res.redirect(spotifyAuthUrl);
});

// 🔹 **Step 2: Handle Spotify OAuth Callback**
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  console.log("Authorization code received:", code);

  const authOptions = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${client_id}:${client_secret}`
      ).toString("base64")}`,
    },
    data: queryString.stringify({
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    }),
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
  };

  try {
    const response = await axios(authOptions);
    const { access_token, refresh_token, expires_in } = response.data;

    console.log("Access token received:", access_token);
    console.log("Refresh token received:", refresh_token);

    // Save tokens (for now, in memory)
    spotifyTokens = {
      access_token,
      refresh_token,
      expires_in,
      receivedAt: Date.now(),
    };

    res.json({
      message: "Authentication successful",
      access_token,
      refresh_token,
    });
  } catch (error) {
    console.error(
      "Error during token exchange:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to authenticate");
  }
});

// 🔹 **Step 3: Implement Spotify Token Refresh Endpoint**
app.get("/refresh_token", async (req, res) => {
  if (!spotifyTokens.refresh_token) {
    return res.status(400).json({ error: "No refresh token stored" });
  }

  console.log("Refreshing Spotify token...");

  const refreshOptions = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${client_id}:${client_secret}`
      ).toString("base64")}`,
    },
    data: queryString.stringify({
      grant_type: "refresh_token",
      refresh_token: spotifyTokens.refresh_token,
    }),
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
  };

  try {
    const response = await axios(refreshOptions);
    const { access_token, expires_in } = response.data;

    console.log("New access token received:", access_token);

    // Update the stored token
    spotifyTokens.access_token = access_token;
    spotifyTokens.expires_in = expires_in;
    spotifyTokens.receivedAt = Date.now();

    res.json({ access_token });
  } catch (error) {
    console.error(
      "Error refreshing token:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to refresh token");
  }
});

// 🔹 **Step 4: Provide Apple JWT Token**
app.get("/token", (req, res) => {
  res.json({ token: appleToken });
});

// 🔹 **Step 5: Apple Music User Authentication**
app.post("/apple-auth", (req, res) => {
  const { userToken } = req.body;
  if (!userToken) {
    return res.status(400).json({ error: "User token missing" });
  }

  console.log("Apple Music user token received:", userToken);

  // Store user token (for now, in memory)
  global.appleUserToken = userToken;

  res.json({ message: "User authenticated successfully" });
});

// 🔹 **Step 6: Fetch Apple Music Playlists**
app.get("/apple-playlists", async (req, res) => {
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

// Pass tokens to routes
const getSpotifyTokens = async () => {
  if (
    spotifyTokens.access_token &&
    Date.now() - spotifyTokens.receivedAt < spotifyTokens.expires_in * 1000
  ) {
    return spotifyTokens;
  }

  // If expired, refresh the token
  console.log("Spotify token expired, refreshing...");

  try {
    const refreshOptions = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${client_id}:${client_secret}`
        ).toString("base64")}`,
      },
      data: queryString.stringify({
        grant_type: "refresh_token",
        refresh_token: spotifyTokens.refresh_token,
      }),
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
    };

    const response = await axios(refreshOptions);
    const { access_token, expires_in } = response.data;

    spotifyTokens = {
      ...spotifyTokens,
      access_token,
      expires_in,
      receivedAt: Date.now(),
    };

    return spotifyTokens;
  } catch (error) {
    console.error(
      "Error refreshing token:",
      error.response?.data || error.message
    );
    return spotifyTokens; // Return stale tokens in case of failure
  }
};

const spotifyRouter = spotifyRouterFactory(getSpotifyTokens);
const appleMusicRouter = appleMusicRouterFactory(appleToken);

app.use("/spotify", spotifyRouter);
app.use("/apple-music", appleMusicRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
