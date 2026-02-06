import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { authRouter } from "./routes/auth.router";
import { userRouter } from "./routes/user.router";
import { errorMiddleware } from "./middlewares/error.middleware";

const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.CLIENT_URL;

const app = express();

app.use(
  cors({
    origin: SERVER_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use(errorMiddleware);

app.listen(PORT, (err?: Error) => {
  if (err) {
    console.error("Failed to start server:", err);
  } else {
    console.log(`Server listening on port ${PORT}`);
  }
});
