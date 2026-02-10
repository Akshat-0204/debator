import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase  } from "./config/db";
import debateRoutes from "./routes/debateRoutes";
import { debateRateLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.use('/api', debateRateLimiter, debateRoutes);
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectToDatabase();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();