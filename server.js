const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve static files
app.use(express.static(__dirname));

// force root route (IMPORTANT for Railway)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API route (proxy to Relevance AI)
app.post("/api/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const response = await fetch(
      "https://api-f1db6c.stack.tryrelevance.com/latest/agents/hooks/custom-trigger/e2c48c57-c606-47fa-b9d1-0d43fbb3c2ac/d7fe2444-8c1f-4e22-b19e-a5f207df7948",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: {
            role: "user",
            content: query
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Relevance AI error:", errText);
      return res.status(500).json({ error: "Relevance AI request failed" });
    }

    // Relevance AI webhook is async — it runs in background
    // Return Done immediately with sheet link
    res.json({
      status: "Done",
      message: "Search triggered successfully",
      link: "https://docs.google.com/spreadsheets/d/1a4D2MlZHLZ8zp8cD125iTcM2tkb14ap6hLNPHtio3sg/edit?gid=0#gid=0"
    });

  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Something broke" });
  }
});

// Railway port (DO NOT TOUCH)
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
