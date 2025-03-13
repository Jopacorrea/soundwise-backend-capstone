//generateAppleToken.js
import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const generateAppleToken = () => {
  try {
    const private_key = fs
      .readFileSync(process.env.APPLE_PRIVATE_KEY_PATH, "utf8")
      .trim();

    return jwt.sign({}, private_key, {
      algorithm: "ES256",
      expiresIn: "180d",
      issuer: process.env.APPLE_TEAM_ID,
      header: { alg: "ES256", kid: process.env.APPLE_KEY_ID },
    });
  } catch (error) {
    console.error("Error generating Apple JWT:", error.message);
    throw error;
  }
};

export default generateAppleToken;


// // utils/generateAppleToken.js
// import jwt from "jsonwebtoken";
// import fs from "fs";
// import dotenv from "dotenv";

// dotenv.config();

// const generateAppleToken = () => {
//   try {
//     const private_key = fs.readFileSync(process.env.APPLE_PRIVATE_KEY_PATH, "utf8").trim();

//     return jwt.sign({}, private_key, {
//       algorithm: "ES256",
//       expiresIn: "180d",
//       issuer: process.env.APPLE_TEAM_ID,
//       header: { alg: "ES256", kid: process.env.APPLE_KEY_ID },
//     });
//   } catch (error) {
//     console.error("Error generating Apple JWT:", error.message);
//     throw error;
//   }
// };

// export default generateAppleToken;