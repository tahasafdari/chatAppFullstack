const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Message = require("./models/Message");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ws = require("ws");

const bcrypt = require("bcryptjs");

dotenv.config();

mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS: origin not allowed: " + origin));
    },
  })
);

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (!token) return reject(new Error("no token"));
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) return reject(err);
      resolve(userData);
    });
  });
}

app.get("/test", (req, res) => {
  res.json("test ok!");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json("no token");
  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) return res.status(401).json("invalid token");
    res.json(userData);
  });
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    const correctPassword = bcrypt.compareSync(password, foundUser.password);
    if (!correctPassword) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    jwt.sign(
      { userId: foundUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) return res.status(500).json({ error: "token sign failed" });
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .json({ id: foundUser._id });
      }
    );
  } catch (e) {
    res.status(500).json({ error: "login failed" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
    });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) return res.status(500).json({ error: "token sign failed" });
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({ id: createdUser._id });
      }
    );
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "username already taken" });
    }
    res.status(500).json({ error: "registration failed" });
  }
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

app.get("/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) {
    res.status(401).json("unauthorized");
  }
});

const server = app.listen(process.env.PORT || 4000);

/* -------------------------------- websockets -------------------------------- */

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((cookie) => cookie.trim().startsWith("token"));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        try {
          const userData = jwt.verify(token, jwtSecret);
          connection.userId = userData.userId;
          connection.username = userData.username;
        } catch (e) {}
      }
    }
  }

  connection.on("message", async (rawData) => {
    try {
      const messageData = JSON.parse(rawData.toString());
      const { recipient, text } = messageData;
      if (!recipient || !text || !connection.userId) return;
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });
      [...wss.clients]
        .filter((c) => c.userId === recipient || c.userId === connection.userId)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              _id: messageDoc._id,
            })
          )
        );
    } catch (e) {
      console.error("ws message error", e);
    }
  });

  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});
