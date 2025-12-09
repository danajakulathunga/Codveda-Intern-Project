const express = require("express");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Use an in-memory store for demo purposes
let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];
let nextId = users.length + 1;

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Simple echo route for single user payload
app.post("/user", (req, res) => {
  const { name, age } = req.body || {};
  if (!name || age === undefined) {
    return res
      .status(400)
      .json({ error: "Both name and age are required" });
  }

  res.status(201).json({
    message: "User received successfully",
    data: { name, age },
  });
});

// Create
app.post("/users", (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const newUser = { id: nextId++, name, email };
  users.push(newUser);
  res.status(201).json({ message: "User created successfully", user: newUser });
});

// Read all
app.get("/users", (_req, res) => {
  res.json({ message: "Users fetched successfully", users });
});

// Root route
app.get("/", (_req, res) => {
  res.send("Express server is running...");
});

// Read one
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  res.json({ message: "User fetched successfully", user });
});

// Update
app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body || {};

  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  if (name) user.name = name;
  if (email) user.email = email;

  res.json({ message: "User updated successfully", user });
});

// Delete
app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const existingLength = users.length;
  users = users.filter((u) => u.id !== id);

  if (users.length === existingLength) {
    return res.status(404).json({ error: "user not found" });
  }

  res.status(200).json({ message: "User deleted successfully" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized error handler
app.use((err, _req, res, _next) => {
  // Handle bad JSON bodies from express.json()
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

function startServer(port, attemptsLeft = 5) {
  const server = app
    .listen(port, () => {
      console.log(`API listening on http://localhost:${port} (started successfully)`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
        const nextPort = port + 1;
        console.warn(
          `Port ${port} in use, retrying on ${nextPort} (${attemptsLeft} tries left)`
        );
        startServer(nextPort, attemptsLeft - 1);
      } else {
        console.error("Server failed to start:", err);
        process.exit(1);
      }
    });
}

startServer(PORT);

