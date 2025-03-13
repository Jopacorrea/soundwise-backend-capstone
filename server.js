// server.js
// npm libraries
import axios from "axios";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import queryString from "query-string";

// local libraries
import appleMusicRouter from "./routes/apple-music-route.js";
import appleAuthMiddleware from "./middleware/apple-auth.js";
import generateAppleToken from "./utils/generateAppleToken.js";
import spotifyRouterFactory from "./routes/spotify-route.js";

console.log(generateAppleToken());

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());

// ✅ Generate Apple JWT Token
const appleToken = generateAppleToken();

// ✅ Middleware to handle Apple Music authentication
app.use("/apple", appleAuthMiddleware);

// ✅ Load Routes
app.use("/apple", appleMusicRouter);
app.use("/spotify", spotifyRouterFactory());

// 🔹 **Spotify Authentication - Redirect to Spotify Login**
app.get("/login", (req, res) => {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${queryString.stringify(
    {
      client_id: process.env.SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      scope: "user-library-read user-read-private user-read-email",
    }
  )}`;

  res.redirect(spotifyAuthUrl);
});

// 🔹 **Spotify OAuth Callback**
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  console.log("Authorization code received:", code);

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      queryString.stringify({
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    console.log("Access Token:", access_token);

    // Store tokens temporarily for the session
    global.spotifyTokens = { access_token, refresh_token };

    res.json({
      message: "Spotify authentication successful",
      access_token,
      refresh_token,
    });
  } catch (error) {
    console.error(
      "Error exchanging token:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to authenticate");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});