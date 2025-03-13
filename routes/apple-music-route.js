// import { Router } from "express";
// import axios from "axios";

// export default function appleMusicRouterFactory(appleToken) {
//   const router = Router();

//   router.get("/playlists", async (req, res) => {
//     if (!global.appleUserToken) {
//       return res
//         .status(401)
//         .json({ error: "User not authenticated with Apple Music" });
//     }

//     try {
//       const response = await axios.get(
//         "https://api.music.apple.com/v1/me/library/playlists",
//         {
//           headers: {
//             Authorization: `Bearer ${appleToken}`,
//             "Music-User-Token": global.appleUserToken,
//           },
//         }
//       );

//       res.json(response.data);
//     } catch (error) {
//       console.error(
//         "Error fetching Apple Music playlists:",
//         error.response?.data || error.message
//       );
//       res.status(500).json({ error: "Failed to fetch Apple playlists" });
//     }
//   });

//   return router;
// }

// import { Router } from "express";
// import axios from "axios";

// export default function appleMusicRouterFactory(appleToken) {
//   const router = Router();

//   router.get("/playlists", async (req, res) => {
//     if (!global.appleUserToken) {
//       console.log('No Apple Music user token found');
//       return res
//         .status(401)
//         .json({ error: "User not authenticated with Apple Music" });
//     }

//     // Log the Apple Music user token and JWT
//     console.log('Apple Music User Token:', global.appleUserToken);
//     console.log('Apple JWT Token:', appleToken);

//     try {
//       // Log the request headers for debugging
//       console.log('Request Headers:', req.headers);

//       const response = await axios.get(
//         "https://api.music.apple.com/v1/me/library/playlists",
//         {
//           headers: {
//             Authorization: `Bearer ${appleToken}`,
//             "Music-User-Token": global.appleUserToken,
//           },
//         }
//       );

//       console.log('Fetched playlists:', response.data);
//       res.json(response.data);
//     } catch (error) {
//       console.error(
//         "Error fetching Apple Music playlists:",
//         error.response?.data || error.message
//       );
//       res.status(500).json({ error: "Failed to fetch Apple playlists" });
//     }
//   });

//   return router;
// }

// import { Router } from "express";
// import axios from "axios";

// export default function appleMusicRouterFactory(appleToken) {
//   const router = Router();

//   router.get("/playlists", async (req, res) => {
//     if (!global.appleUserToken) {
//       console.log("No Apple Music user token found");
//       return res.status(401).json({ error: "User not authenticated with Apple Music" });
//     }

//     console.log("Apple Music User Token:", global.appleUserToken);
//     console.log("Apple JWT Token:", appleToken);

//     try {
//       const response = await axios.get(
//         "https://api.music.apple.com/v1/me/library/playlists",
//         {
//           headers: {
//             Authorization: `Bearer ${appleToken}`,
//             "Music-User-Token": global.appleUserToken,
//           },
//         }
//       );

//       console.log("Fetched playlists:", response.data);
//       res.json(response.data);
//     } catch (error) {
//       console.error("Error fetching Apple Music playlists:", error.response?.data || error.message);
//       res.status(error.response?.status || 500).json({ error: error.response?.data || "Failed to fetch Apple playlists" });
//     }
//   });

//   return router;
// }

// // apple-music-route.js
// import { Router } from "express";
// import axios from "axios";

// export default function appleMusicRouterFactory(appleToken) {
//   const router = Router();

//   router.get("/playlists", async (req, res) => {
//     // Check if appleUserToken is set globally (user has authenticated)
//     if (!global.appleUserToken) {
//       console.log("No Apple Music user token found");
//       return res
//         .status(401)
//         .json({ error: "User not authenticated with Apple Music" });
//     }

//     // Log tokens for debugging
//     console.log("Apple Music User Token:", global.appleUserToken); // Ensure this is logged correctly
//     console.log("Apple JWT Token:", appleToken); // Ensure this is logged correctly

//     try {
//       const response = await axios.get(
//         "https://api.music.apple.com/v1/me/library/playlists",
//         {
//           headers: {
//             Authorization: `Bearer ${appleToken}`, // Make sure this is the Apple Music JWT (appleToken)
//             "Music-User-Token": global.appleUserToken, // Ensure this is the user's token
//           },
//         }
//       );

//       // If successful, return the playlists
//       console.log("Apple playlists fetched:", response.data);
//       res.json(response.data);
//     } catch (error) {
//       console.error(
//         "Error fetching Apple Music playlists:",
//         error.response?.data || error.message
//       );
//       res
//         .status(error.response?.status || 500)
//         .json({ error: "Failed to fetch Apple playlists" });
//     }
//   });

//   return router;
// }

// // apple-music-route.js
// import { Router } from "express";
// import axios from "axios";

// export default function appleMusicRouterFactory(appleToken) {
//   const router = Router();

//   // Fetch Apple Music Playlists
//   router.get("/playlists", async (req, res) => {
//     // Ensure appleUserToken is set globally
//     if (!global.appleUserToken) {
//       console.log("No Apple Music user token found");
//       return res
//         .status(401)
//         .json({ error: "User not authenticated with Apple Music" });
//     }

//     // Log tokens for debugging
//     console.log("Apple Music User Token:", global.appleUserToken); // Ensure this is logged correctly
//     console.log("Apple JWT Token:", appleToken); // Ensure this is logged correctly

//     try {
//       const response = await axios.get(
//         "https://api.music.apple.com/v1/me/library/playlists",
//         {
//           headers: {
//             Authorization: `Bearer ${appleToken}`, // Ensure this is the Apple Music JWT (appleToken)
//             "Music-User-Token": global.appleUserToken, // Ensure this is the user's token
//           },
//         }
//       );

//       // If successful, return the playlists
//       console.log("Apple playlists fetched:", response.data);
//       res.json(response.data);
//     } catch (error) {
//       console.error(
//         "Error fetching Apple Music playlists:",
//         error.response?.data || error.message
//       );
//       res
//         .status(error.response?.status || 500)
//         .json({ error: "Failed to fetch Apple playlists" });
//     }
//   });

//   return router;
// }

// app.get("/apple-playlists", async (req, res) => {
//     if (!global.appleUserToken) {
//       return res.status(401).json({ error: "User not authenticated with Apple Music" });
//     }

//     try {
//       // Ensure you're using the correct Apple Music JWT and User Token
//       const response = await axios.get(
//         "https://api.music.apple.com/v1/me/library/playlists",
//         {
//           headers: {
//             Authorization: `Bearer ${appleToken}`, // This is the Apple JWT Token (server-side token)
//             "Music-User-Token": global.appleUserToken, // This is the user-specific token (client-side token)
//           },
//         }
//       );

//       res.json(response.data);
//     } catch (error) {
//       console.error("Error fetching Apple Music playlists:", error.response?.data || error.message);
//       res.status(500).json({ error: "Failed to fetch Apple playlists" });
//     }
//   });

// routes/apple-music-route.js
// import axios from "axios";

// export default function appleMusicRouter(app, appleToken) {
//   app.get("/apple-playlists", async (req, res) => {
//     if (!globalAppleUserToken) {
//       return res.status(401).json({ error: "User not authenticated with Apple Music" });
//     }

//     try {
//       const response = await axios.get(
//         "https://api.music.apple.com/v1/me/library/playlists",
//         {
//           headers: {
//             Authorization: `Bearer ${appleToken}`,
//             "Music-User-Token": globalAppleUserToken,
//           },
//         }
//       );

//       res.json(response.data);
//     } catch (error) {
//       console.error("Error fetching Apple Music playlists:", error.response?.data || error.message);
//       res.status(500).json({ error: "Failed to fetch Apple playlists" });
//     }
//   });
// }

//aplle-music-route.js
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


// // routes/apple-music-route.js
// import axios from "axios";
// import express from "express";
// import generateAppleToken from "../utils/generateAppleToken.js";

// const router = express.Router();

// // ✅ Fetch Apple Music Playlists
// router.get("/apple-playlists", async (req, res) => {
//   if (!global.appleUserToken) {
//     console.error("❌ Error: Apple Music user token is missing.");
//     return res.status(401).json({ error: "User not authenticated with Apple Music" });
//   }

//   const appleToken = generateAppleToken(); // Generate fresh token before request
//   console.log("✅ Apple Token:", appleToken);
//   console.log("✅ Apple User Token:", global.appleUserToken);

//   try {
//     const response = await axios.get("https://api.music.apple.com/v1/me/library/playlists", {
//       headers: {
//         Authorization: `Bearer ${appleToken}`,
//         "Music-User-Token": global.appleUserToken,
//       },
//     });

//     console.log("✅ Apple Music API Response:", response.data);
//     res.json(response.data); // Return playlists data from Apple Music
//   } catch (error) {
//     console.error("❌ Error fetching Apple Music playlists:", error.response?.data || error.message);
//     res.status(500).json({ error: "Failed to fetch Apple playlists" });
//   }
// });

// export default router;