import express from "express";
import reservations from "./routes/reservations.js";

const app = express();
app.use(express.json());

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO: implement POST /reservations
app.use("/reservations", reservations);

export default app;
