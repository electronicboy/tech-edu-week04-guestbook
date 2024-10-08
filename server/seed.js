import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

/** @type {Client} */
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})

function addEntry(name, email, message) {
    return pool.query("INSERT INTO guestbook (name, email, message) VALUES ($1, $2, $3)", [name, email, message]).then((result) => {console.log("inserted", arguments)
    });
}

await addEntry("Sarah Johnson", "sarah.johnson@example.com", "Had a wonderful time visiting! The atmosphere is so welcoming. Will definitely be back.");
await addEntry("David Thompson", "david.thompson@example.com", "Such a beautiful place! The staff was friendly and the experience unforgettable.");
await addEntry("Emily Martinez", "emily.martinez@example.com", "Loved every moment here! Thank you for the warm hospitality.");
await addEntry("John Baker", "john.baker@example.com", "First time visiting, and it exceeded all my expectations. Great job!");
await addEntry("Olivia Carter", "olivia.carter@example.com", "Amazing experience! Can’t wait to tell my friends about this hidden gem.");
await addEntry("Michael Scott", "michael.scott@example.com", "Had a blast! The vibe and the people made my visit special.");
await addEntry("Sophia Anderson", "sophia.anderson@example.com", "Thank you for a memorable time. I’ll be sure to come back soon.");
await addEntry("William Garcia", "william.garcia@example.com", "Everything was perfect! The environment, the service, and the overall experience.");
await addEntry("Ava Wilson", "ava.wilson@example.com", "Had a fantastic visit! The ambiance is just what I needed. See you soon!");
await addEntry("Benjamin Harris", "benjamin.harris@example.com", "This place is amazing! I enjoyed every second of my stay.");
pool.end()


