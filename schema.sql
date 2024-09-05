DROP TABLE IF EXISTS guestbook;

create table guestbook
(
    id      INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name    VARCHAR(256),
    email VARCHAR(320),
    message TEXT
)
