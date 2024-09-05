import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

/** @type {Client} */
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})

function addEntry(name, message) {
    pool.query("INSERT INTO guestbook (name, message) VALUES ($1, $2)", [name, message]);
}

addEntry("Sarah Johnson", "Had a wonderful time visiting! The atmosphere is so welcoming. Will definitely be back.");
addEntry("David Thompson", "Such a beautiful place! The staff was friendly and the experience unforgettable.");
addEntry("Emily Martinez", "Loved every moment here! Thank you for the warm hospitality.");
addEntry("John Baker", "First time visiting, and it exceeded all my expectations. Great job!");
addEntry("Olivia Carter", "Amazing experience! Can’t wait to tell my friends about this hidden gem.");
addEntry("Michael Scott", "Had a blast! The vibe and the people made my visit special.");
addEntry("Sophia Anderson", "Thank you for a memorable time. I’ll be sure to come back soon.");
addEntry("William Garcia", "Everything was perfect! The environment, the service, and the overall experience.");
addEntry("Ava Wilson", "Had a fantastic visit! The ambiance is just what I needed. See you soon!");
addEntry("Benjamin Harris", "This place is amazing! I enjoyed every second of my stay.");

