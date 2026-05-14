require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

app.post("/authenticate", async (req, res) => {
  const { username, secret } = req.body;

  // Get or create user on Chat Engine!
  try {
    const r = await axios.put(
      "https://api.chatengine.io/users/",
      { username: username, secret: secret, first_name: username },
      { headers: { "Private-Key": process.env.CHAT_ENGINE_PRIVATE_KEY } }
    );
    return res.status(r.status).json(r.data);
  } catch (e) {
    if (e.response) {
       return res.status(e.response.status).json(e.response.data);
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3001, () => {
  console.log("Backend server running on port 3001");
});
