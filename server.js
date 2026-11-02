import express from "express"; // Using ES module import
import axios from "axios";     // Using ES module import
import dotenv from "dotenv";   // Using ES module import

dotenv.config();  // Load environment variables from .env

const app = express();
app.use(express.json());  // Middleware to parse incoming JSON requests

// Endpoint to handle chatbot requests
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;  // Get the user's message from the request body
  try {
    // Send a request to OpenAI's API to get the AI response
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",  // Specify which model to use
        messages: [
          { role: "system", content: "You are a helpful career assistant." },
          { role: "user", content: message },  // Send the user's message
        ],
        max_tokens: 150,  // Limit the response length
        temperature: 0.7,  // Controls randomness
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,  // Add the API key to the header
        },
      }
    );

    // Send the AI response back to the frontend
    res.json({ message: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error: "Error fetching AI response" });
  }
});

// Start the server on port 5000
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
