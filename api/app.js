import express from "express";
import bodyParser from "body-parser";
import reservations from "./routes/reservations.js";

const app = express();
app.use(bodyParser.json());

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO: implement POST /reservations
app.post("/reservations", reservations);

export default app;
