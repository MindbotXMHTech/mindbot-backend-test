import test from "node:test";
import assert from "node:assert";
import fetch from "node-fetch";

const API = "http://localhost:3000";

test("healthcheck works", async () => {
  const res = await fetch(`${API}/health`);
  const body = await res.json();
  assert.strictEqual(body.status, "ok");
});

// TODO: Candidate must add tests for reservation flow
test("can create a reservation", async () => {
  const res = await fetch(`${API}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_id: 101,
      check_in: "2025-10-01",
      check_out: "2025-10-05",
    }),
  });
  assert.strictEqual(res.status, 201);
  const body = await res.json();
  assert.strictEqual(body.room_id, 101);
});

test("prevents double booking", async () => {
  const res = await fetch(`${API}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_id: 101,
      check_in: "2025-10-01",
      check_out: "2025-10-05",
    }),
  });
  assert.strictEqual(res.status, 409);
});
