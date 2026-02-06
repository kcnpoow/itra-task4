import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { authRouter } from "./routes/auth.router";
import { userRouter } from "./routes/user.router";
import { errorMiddleware } from "./middlewares/error.middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.resolve(__dirname, "public");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(publicPath));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use(errorMiddleware);

app.use((req, res) => {
  const filePath = path.join(publicPath, "index.html");

  res.sendFile(filePath);
});

app.listen(PORT, (err?: Error) => {
  if (err) {
    console.error("Failed to start server:", err);
  } else {
    console.log(`Server listening on port ${PORT}`);
  }
});
