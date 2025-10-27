/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Define paths - server runs from project root via: node scripts/icon-assignment/server.js
const PROJECT_ROOT = process.cwd(); // Project root directory
const TOOL_DIR = __dirname; // scripts/icon-assignment directory
const CATEGORIES_PATH = path.join(PROJECT_ROOT, "src", "index", "categories");
const ASSIGNMENTS_PATH = path.join(TOOL_DIR, "assignments.json");
const MANIFEST_PATH = path.join(TOOL_DIR, "manifest.json");
const BACKUPS_PATH = path.join(TOOL_DIR, "backups");

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(express.static(TOOL_DIR)); // Serve static files from scripts/icon-assignment

// API Routes

// Get assignments
app.get("/api/assignments", async (_req, res) => {
  try {
    // Check if the file exists
    try {
      await fs.access(ASSIGNMENTS_PATH);
    } catch {
      // File doesn't exist, return an empty object
      return res.json({});
    }

    const data = await fs.readFile(ASSIGNMENTS_PATH, "utf8");
    const assignments = JSON.parse(data);
    res.json(assignments);
  } catch (error) {
    console.error("Error reading assignments:", error);
    res.status(500).json({ error: "Failed to read assignments" });
  }
});

// Save assignments
app.post("/api/assignments", async (req, res) => {
  try {
    const assignmentsData = JSON.stringify(req.body, null, 2);

    await fs.writeFile(ASSIGNMENTS_PATH, assignmentsData, "utf8");

    console.log("Assignments saved successfully to:", ASSIGNMENTS_PATH);
    res.json({
      success: true,
      message: "Assignments saved successfully",
    });
  } catch (error) {
    console.error("Error saving assignments:", error);
    res.status(500).json({ error: "Failed to save assignments" });
  }
});

// Get manifest
app.get("/api/manifest", async (_req, res) => {
  try {
    const data = await fs.readFile(MANIFEST_PATH, "utf8");
    const manifest = JSON.parse(data);
    res.json(manifest);
  } catch (error) {
    console.error("Error reading manifest:", error);
    res.status(500).json({ error: "Failed to read manifest" });
  }
});

// Get list of available categories
app.get("/api/categories", async (_req, res) => {
  try {
    const files = await fs.readdir(CATEGORIES_PATH);
    const categories = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""))
      .sort();

    res.json({ categories });
  } catch (error) {
    console.error("Error reading categories directory:", error);
    res.status(500).json({ error: "Failed to read categories directory" });
  }
});

// Get category data (reads from src/index/categories)
app.get("/api/categories/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const categoryPath = path.join(CATEGORIES_PATH, `${category}.json`);

    console.log(`Attempting to read: ${categoryPath}`);

    // Check if file exists
    try {
      await fs.access(categoryPath);
      console.log(`File exists: ${categoryPath}`);
    } catch {
      console.log(`File not found: ${categoryPath}`);
      return res
        .status(404)
        .json({ error: `Category ${category} not found at ${categoryPath}` });
    }

    const data = await fs.readFile(categoryPath, "utf8");
    console.log(`Read ${data.length} characters from ${category}.json`);
    console.log(`First 100 characters:`, JSON.stringify(data.slice(0, 100)));

    try {
      const categoryData = JSON.parse(data);
      console.log(
        `Successfully parsed JSON for ${category}, found ${Object.keys(categoryData).length} items`,
      );
      res.json(categoryData);
    } catch (parseError) {
      console.error(
        `JSON parse error in ${category}.json:`,
        parseError.message,
      );
      console.error(`Full content:`, JSON.stringify(data));
      res.status(500).json({
        error: `Invalid JSON in ${category}.json: ${parseError.message}`,
        rawContent: data.slice(0, 200),
      });
    }
  } catch (error) {
    console.error(`Error reading category ${req.params.category}:`, error);
    res
      .status(500)
      .json({ error: `Failed to read category ${req.params.category}` });
  }
});

// Create assignments backup endpoint
app.post("/api/backup-assignments", async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(
      BACKUPS_PATH,
      `assignments-backup-${timestamp}.json`,
    );

    // Ensure backup directory exists
    try {
      await fs.access(BACKUPS_PATH);
    } catch {
      await fs.mkdir(BACKUPS_PATH, { recursive: true });
    }

    const assignmentsData = JSON.stringify(req.body, null, 2);
    await fs.writeFile(backupPath, assignmentsData, "utf8");

    console.log(`Backup created: ${backupPath}`);
    res.json({
      success: true,
      message: "Backup created successfully",
      backupPath,
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: "Failed to create backup" });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    paths: {
      projectRoot: PROJECT_ROOT,
      toolDirectory: TOOL_DIR,
      categoriesPath: CATEGORIES_PATH,
      assignmentsPath: ASSIGNMENTS_PATH,
      manifestPath: MANIFEST_PATH,
      backupsPath: BACKUPS_PATH,
    },
  });
});

// Serve images from project root (assuming images are relative to project root)
app.use("/images", express.static(PROJECT_ROOT));

// Serve category files directly (for direct import in client)
app.use("/src/index/categories", express.static(CATEGORIES_PATH));

// Catch-all handler: send back index.html for any non-API routes
app.get("*", (req, res) => {
  if (!req.url.startsWith("/api")) {
    res.sendFile(path.join(TOOL_DIR, "index.html"));
  }
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error("Server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Teriock Icon Assignment Manager running on http://localhost:${PORT}`,
  );
  console.log(`Serving tool from: ${TOOL_DIR}`);
  console.log(`Reading categories from: ${CATEGORIES_PATH}`);
  console.log(`Assignments will be saved to: ${ASSIGNMENTS_PATH}`);
  console.log(`Backups will be created in: ${BACKUPS_PATH}`);
  console.log(`Project root: ${PROJECT_ROOT}`);
});
