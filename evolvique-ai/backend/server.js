require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// Middleware
app.use(
cors({
origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
})
);

app.use(express.json({ limit: "20kb" }));

// Health-check endpoint
app.get("/api/health", (req, res) => {
res.json({
success: true,
message: "Evolvique AI backend is running!",
});
});

// AI recommendations endpoint
app.post("/api/recommendations", async (req, res) => {
try {
const { goals, unfinishedTasks, availableStudyTime } = req.body;

```
// Validate input
if (
  !goals ||
  !Array.isArray(unfinishedTasks) ||
  typeof availableStudyTime !== "number" ||
  !Number.isFinite(availableStudyTime) ||
  availableStudyTime <= 0
) {
  return res.status(400).json({
    success: false,
    message:
      "Provide goals, unfinishedTasks as an array, and a positive availableStudyTime.",
  });
}

// Check API key
if (!process.env.OPENAI_API_KEY) {
  return res.status(500).json({
    success: false,
    message: "OpenAI API key is not configured.",
  });
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate recommendations
const completion = await openai.chat.completions.create({
  model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  messages: [
    {
      role: "system",
      content:
        "You are Evolvique AI, a helpful study planner. Give practical, prioritized study recommendations and a simple schedule based on the available study time.",
    },
    {
      role: "user",
      content: JSON.stringify({
        goals,
        unfinishedTasks,
        availableStudyTimeMinutes: availableStudyTime,
      }),
    },
  ],
});

return res.json({
  success: true,
  recommendations:
    completion.choices[0]?.message?.content ||
    "No recommendations were generated. Please try again.",
});
```

} catch (error) {
console.error("Recommendation error:", error.message);

```
return res.status(500).json({
  success: false,
  message: "Unable to generate recommendations. Please try again.",
});
```

}
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Evolvique AI backend running at http://localhost:${PORT}`);
});
