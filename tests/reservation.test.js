import test from "node:test";
import assert from "node:assert";

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
      check_in: "2025-11-01",
      check_out: "2025-11-05",
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
      check_in: "2025-11-01",
      check_out: "2025-11-05",
    }),
  });
  assert.strictEqual(res.status, 409);
});

test("rejects invalid dates (check_in >= check_out)", async () => {
  const res = await fetch(`${API}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_id: 101,
      check_in: "2025-10-10",
      check_out: "2025-10-05",
    }),
  });
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error, "invalid dates");
});

test("rejects missing parameters", async () => {
  const res = await fetch(`${API}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_id: 101,
    }),
  });
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error, "missing parameters");
});
