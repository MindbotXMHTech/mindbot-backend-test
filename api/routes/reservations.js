import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { room_id, check_in, check_out } = req.body;

  if (!room_id || !check_in || !check_out) {
    return res.status(400).json({ error: "missing parameters" });
  }
  if (new Date(check_in) >= new Date(check_out)) {
    return res.status(400).json({ error: "invalid dates" });
  }

  const query = `
    INSERT INTO reservations (room_id, check_in, check_out)
    VALUES ($1, $2, $3)
    RETURNING id, room_id, check_in, check_out, created_at;
  `;

  try {
    const result = await pool.query(query, [room_id, check_in, check_out]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23P01") {
      return res
        .status(409)
        .json({ error: "Room not available for given dates" });
    }
    if (error.code === "23503") {
      return res.status(400).json({ error: "Invalid room_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "internal error" });
  }
});

export default router;
