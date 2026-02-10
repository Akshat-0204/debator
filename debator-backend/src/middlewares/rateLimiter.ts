import rateLimit from "express-rate-limit";

export const debateRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOWMS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  message: "Too many requests from this IP, please try again later",
});
