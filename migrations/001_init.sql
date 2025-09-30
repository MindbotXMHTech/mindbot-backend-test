-- TODO: Candidate must design proper schema

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    period DATERANGE GENERATED ALWAYS AS (daterange(check_in, check_out, '[)')) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_dates CHECK (check_in < check_out)
);

ALTER TABLE reservations
    ADD CONSTRAINT no_overlapping_reservations
    EXCLUDE USING GIST (
        room_id WITH =,
        period WITH &&
    );


INSERT INTO rooms (id, name) VALUES
    (101, 'Room 101'),
    (102, 'Room 102'),
    (103, 'Room 103');