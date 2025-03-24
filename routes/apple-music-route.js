// //Routes/aplle-music-route.js
import axios from "axios";
import express from "express";
import generateAppleToken from "../utils/generateAppleToken.js";

const router = express.Router();

// Fetch Apple Music Playlists
// router.get("/apple-playlists", async (req, res) => {
//   const appleMusicUserToken = req.headers.authorization?.split(" ")[1];
//   const appleDeveloperToken = req.headers["developer-token"] || generateAppleToken();

//   if (!appleMusicUserToken) {
//     console.error("❌ Error: Apple Music user token is missing.");
//     return res.status(401).json({ error: "User not authenticated with Apple Music" });
//   }

//   console.log("✅ Apple Developer Token:", appleDeveloperToken);
//   console.log("✅ Apple User Token:", appleMusicUserToken);

//   try {
//     const response = await axios.get("https://api.music.apple.com/v1/me/library/playlists", {
//       headers: {
//         Authorization: `Bearer ${appleDeveloperToken}`,
//         "Music-User-Token": appleMusicUserToken,
//       },
//     });

//     console.log("✅ Apple Music API Response:", response.data);
//     res.json(response.data);
//   } catch (error) {
//     console.error("❌ Error fetching Apple Music playlists:", error.response?.data || error.message);
//     res.status(500).json({ error: "Failed to fetch Apple playlists" });
//   }
// });

// Endpoint to generate Apple Music token (developer token)
router.get("/token", (req, res) => {
  try {
    const appleToken = generateAppleToken();
    console.log("✅ Apple Developer Token generated:", appleToken);
    res.json({ appleToken });
  } catch (error) {
    console.error("❌ Error generating Apple token:", error.message);
    res.status(500).json({ error: "Failed to generate Apple Music token" });
  }
});

// Create Playlist on Apple Music and Add Tracks
router.post("/transfer", async (req, res) => {
  try {
    const { playlist, tracks } = req.body;
    
    // Get tokens directly from request headers
    const appleMusicUserToken = req.headers.authorization?.split(" ")[1];
    const appleDeveloperToken = req.headers["developer-token"] || generateAppleToken();
    
    if (!appleMusicUserToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Missing Apple Music user token. Please authenticate with Apple Music first." 
      });
    }
    
    console.log("✅ Using Apple Developer Token:", appleDeveloperToken);
    console.log("✅ Using Apple User Token:", appleMusicUserToken);

    // 1. Create Playlist on Apple Music
    const createPlaylistResponse = await axios.post(
      "https://api.music.apple.com/v1/me/library/playlists",
      {
        attributes: {
          name: playlist.name,
          description: playlist.description || "",
        }
      },
      {
        headers: {
          Authorization: `Bearer ${appleDeveloperToken}`,
          "Music-User-Token": appleMusicUserToken,
          "Content-Type": "application/json",
        }
      }
    );

    const appleMusicPlaylistId = createPlaylistResponse.data.data[0].id;
    console.log("✅ Playlist created on Apple Music with ID:", appleMusicPlaylistId);

    // 2. Search for tracks on Apple Music
    const appleMusicTrackIDs = [];
    
    for (const track of tracks) {
      try {
        // Search by song name and artist
        const searchResponse = await axios.get(
          "https://api.music.apple.com/v1/catalog/us/search",
          {
            params: {
              term: `${track.name} ${track.artist}`,
              types: "songs",
              limit: 1
            },
            headers: {
              Authorization: `Bearer ${appleDeveloperToken}`,
              "Music-User-Token": appleMusicUserToken
            }
          }
        );
        
        if (searchResponse.data?.results?.songs?.data?.[0]) {
          appleMusicTrackIDs.push({
            id: searchResponse.data.results.songs.data[0].id,
            type: "songs"
          });
        }
      } catch (searchError) {
        console.warn(`Couldn't find track: ${track.name}`, searchError.message);
      }
    }

    if (appleMusicTrackIDs.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No tracks to transfer. Couldn't find any matching tracks on Apple Music." 
      });
    }

    // 3. Add tracks to playlist
    await axios.post(
      `https://api.music.apple.com/v1/me/library/playlists/${appleMusicPlaylistId}/tracks`,
      { data: appleMusicTrackIDs },
      {
        headers: {
          Authorization: `Bearer ${appleDeveloperToken}`,
          "Music-User-Token": appleMusicUserToken,
          "Content-Type": "application/json",
        }
      }
    );

    res.status(200).json({
      success: true,
      appleMusicPlaylistId,
      tracksAdded: appleMusicTrackIDs.length,
      message: "Playlist created and tracks added successfully.",
    });
  } catch (error) {
    console.error("❌ Apple Music transfer error:", error.message);
    
    // Log detailed response errors if available
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
      
      // Return the specific error from Apple Music if available
      return res.status(error.response.status).json({ 
        success: false, 
        message: `Apple Music transfer error: ${error.response.data?.errors?.[0]?.detail || error.message}`,
        details: error.response.data
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: `Apple Music transfer error: ${error.message}` 
    });
  }
});

// // Transfer Tracks to Existing Playlist on Apple Music
// router.post("/transfer-tracks", async (req, res) => {
//   const { tracks, appleMusicPlaylistId } = req.body;
  
//   // Get tokens directly from request headers
//   const appleMusicUserToken = req.headers.authorization?.split(" ")[1];
//   const appleDeveloperToken = req.headers["developer-token"] || generateAppleToken();
  
//   if (!appleMusicUserToken) {
//     return res.status(401).json({ 
//       success: false, 
//       message: "Missing Apple Music user token. Please authenticate with Apple Music first." 
//     });
//   }

//   try {
//     const appleMusicTrackIDs = [];

//     // Loop through tracks and search them on Apple Music
//     for (const track of tracks) {
//       const response = await axios.get("https://api.music.apple.com/v1/catalog/us/search", {
//         params: {
//           term: `${track.name} ${track.artist}`,
//           types: "songs",
//           limit: 1,
//         },
//         headers: {
//           Authorization: `Bearer ${appleDeveloperToken}`,
//           "Music-User-Token": appleMusicUserToken
//         },
//       });

//       const appleTrack = response.data?.results?.songs?.data?.[0];
//       if (appleTrack) {
//         appleMusicTrackIDs.push({
//           id: appleTrack.id,
//           type: "songs"
//         });
//       }
//     }

//     // If we have valid track IDs, proceed to add them to the playlist
//     if (appleMusicTrackIDs.length > 0) {
//       await axios.post(
//         `https://api.music.apple.com/v1/me/library/playlists/${appleMusicPlaylistId}/tracks`,
//         {
//           data: appleMusicTrackIDs
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${appleDeveloperToken}`,
//             "Music-User-Token": appleMusicUserToken,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       res.json({ 
//         success: true, 
//         tracksAdded: appleMusicTrackIDs.length,
//         message: "Tracks successfully transferred to Apple Music" 
//       });
//     } else {
//       res.status(400).json({ 
//         success: false,
//         message: "No tracks found in Apple Music."
//       });
//     }
//   } catch (error) {
//     console.error("❌ Error transferring tracks to Apple Music:", error.message);
    
//     if (error.response) {
//       console.error("Response status:", error.response.status);
//       console.error("Response data:", JSON.stringify(error.response.data, null, 2));
      
//       return res.status(error.response.status).json({ 
//         success: false, 
//         message: `Apple Music transfer error: ${error.response.data?.errors?.[0]?.detail || error.message}`,
//         details: error.response.data
//       });
//     }
    
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to transfer tracks to Apple Music" 
//     });
//   }
// });

export default router;