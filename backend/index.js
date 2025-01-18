require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

connectDB();

// Register endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, counter: user.counter });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = verified.userId;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// Increment counter endpoint
app.post("/api/increment", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.counter += 1;
    await user.save();
    res.json({ counter: user.counter });
  } catch (error) {
    res.status(500).json({ error: "Error incrementing counter" });
  }
});

// Get counter endpoint
app.get("/api/increment", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ counter: user.counter });
  } catch (error) {
    res.status(500).json({ error: "Error getting counter" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
