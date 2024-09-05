create table guestbook
(
    id      INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name    VARCHAR(64),
    message TEXT
)
