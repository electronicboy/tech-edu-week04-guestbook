DROP TABLE IF EXISTS guestbook;

CREATE TABLE IF NOT EXISTS guestbook
(
    id      INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name    VARCHAR(256),
    email   VARCHAR(320),
    message TEXT,
    time    TIMESTAMP DEFAULT now(),
    likes   INT       DEFAULT 0
);

-- ALTER TABLE guestbook ADD likes INT DEFAULT 0;

-- CREATE TABLE IF NOT EXISTS guestbook_likes (
--     command_id INT REFERENCES guestbook (id),
--     client_id CHAR(32),
--     UNIQUE (command_id, client_id)
-- );
