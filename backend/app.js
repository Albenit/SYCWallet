const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // add your real dev/prod origins here
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow same-origin / tools with no origin
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true, // <<< important
  })
);

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");

app.use("/api/auth", authRoutes);
app.use('/api/wallet', walletRoutes);

app.get("/", (_req, res) => res.send("API is running..."));

module.exports = app;
