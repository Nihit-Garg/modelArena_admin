import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// API endpoint to get all submissions sorted by score
app.get("/api/submissions", async (req, res) => {
    try {
        const submissions = await prisma.submission.findMany({
            include: {
                team: {
                    select: {
                        name: true,
                        leaderEmail: true,
                    },
                },
            },
            orderBy: {
                calculatedScore: "desc", // Highest score first
            },
        });

        // Format the data for the frontend
        const formattedData = submissions.map((submission) => ({
            teamName: submission.team.name,
            leaderEmail: submission.team.leaderEmail,
            githubLink: submission.githubLink,
            csvLink: submission.csv,
            score: submission.calculatedScore,
            submittedAt: submission.createdAt,
        }));

        res.json({
            success: true,
            data: formattedData,
            total: formattedData.length,
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch submissions",
        });
    }
});

// Root route serves the HTML dashboard
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Admin portal running at http://localhost:${PORT}`);
});
