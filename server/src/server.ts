import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import testRoutes from "./routes/test.route.js";
import projectRoutes from "./routes/project.route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
    cors({
        origin: CLIENT_URL,
    })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/projects", projectRoutes);


app.get("/api/health", async (_req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Test2Dev is running",
            databaseTime: result.rows[0].now,
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            message: "Database connection failed",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});