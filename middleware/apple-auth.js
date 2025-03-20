// // middleware/apple-auth.js
import { Router } from "express";

const router = Router();

// Store tokens in memory or database based on session management
const userTokens = {}; // Replace with a proper session store or DB

router.post("/apple-auth", async (req, res) => {
  console.log("Apple Auth Request Body:", req.body);

  const { userToken, userId } = req.body; // Expecting a userId for better tracking

  if (!userToken || !userId) {
    return res.status(400).json({ error: "User token or User ID missing" });
  }

  try {
    // Store the token for a specific user (userId)
    userTokens[userId] = userToken;  // Replace with actual session or DB storage

    console.log("Apple Music user token received for user:", userId);
    res.json({ message: "User authenticated successfully" });
  } catch (error) {
    console.error("Error storing Apple Music user token:", error);
    res.status(500).json({ error: "Failed to authenticate user with Apple Music" });
  }
});

export default router;