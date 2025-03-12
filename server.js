// npm libraries
import axios from "axios";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import queryString from "query-string";
import jwt from "jsonwebtoken";
import fs from "fs";

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

// Enable CORS
app.use(cors());

// 🔹 **Step 1: Redirect to Spotify's Authorization Page**
app.get("/login", (req, res) => {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${queryString.stringify({
    client_id: client_id,
    response_type: "code",
    redirect_uri: redirect_uri,
    scope: "user-library-read user-read-private user-read-email",
  })}`;

  res.redirect(spotifyAuthUrl);
});

// 🔹 **Step 2: Handle Spotify OAuth Callback**
app.get("/callback", async (req, res) => {
  // Get the authorization code from the query parameters
  const code = req.query.code || null;
  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  console.log("Authorization code received:", code);

  // Exchange authorization code for an access token
  const authOptions = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
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
    const { access_token } = response.data;

    console.log("Access token received:", access_token);

    // Fetch the user profile using the access token
    const userOptions = {
      headers: { Authorization: `Bearer ${access_token}` },
      method: "GET",
      url: "https://api.spotify.com/v1/me",
    };

    const userResponse = await axios(userOptions);
    const user = userResponse.data;

    res.json(user);
  } catch (error) {
    console.error("Error during token exchange:", error.response || error);
    res.status(500).send("Failed to authenticate");
  }
});

// 🔹 **Step 3: Provide Apple JWT Token**
app.get("/token", (req, res) => {
  res.json({ token: appleToken });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});