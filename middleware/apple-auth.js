// apple-auth.js
import { Router } from "express";

const router = Router();

router.post("/apple-auth", async (req, res) => {
  console.log("Apple Auth Request Body:", req.body);

  const { userToken } = req.body;
  if (!userToken) {
    return res.status(400).json({ error: "User token missing" });
  }

  global.appleUserToken = userToken; // Store globally (not ideal for production)

  console.log("Apple Music user token received:", global.appleUserToken);
  res.json({ message: "User authenticated successfully" });
});

export default router;


// // middleware/apple-auth.js
// import { Router } from "express";

// const router = Router();

// router.post("/apple-auth", async (req, res) => {
//   console.log("Apple Auth Request Body:", req.body);

//   const { userToken } = req.body;
//   if (!userToken) {
//     return res.status(400).json({ error: "User token missing" });
//   }

//   global.appleUserToken = userToken; // Store globally (not ideal for production)

//   console.log("Apple Music user token received:", global.appleUserToken);
//   res.json({ message: "User authenticated successfully" });
// });

// export default router;