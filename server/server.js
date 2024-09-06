import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressws from 'express-ws';
import escapeHtml from 'escape-html';
import pg from 'pg';

// Setup environment
dotenv.config();

const port = process.env.PORT || 8080;

// Woo
const app = express();
const wss = expressws(app); // This is a function that adds ws() to express

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database pool
/** @type {Client} */
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})


/*******************
 EXPRESS ROUTES
 *******************/

function validate(entry, length) {
    if (entry === undefined || entry === null) return false;
    if (length !== undefined) {
        if (entry.length > length) {
            return false;
        }
    }

    return true;
}

/*******************
 EXPRESS ROUTES
 *******************/
app.get('/messages', async (req, res) => {
    /** @type {Result} */
    pool.query("SELECT id, name, message, time FROM guestbook").then(result => {
        if (result.rowCount > 0) {
            const filtered = result.rows.map((entry) => {
                return {
                    id: entry.id,
                    name: entry.name,
                    message: entry.message,
                    time: entry.time
                }
            })
            res.json(filtered);
        } else {
            res.json({})
        }

    });
})

app.post("/messages", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email || null;
    const message = escapeHtml(req.body.message);
    if (!validate(name, 64)) {
        res.status(400).json({message: "Invalid name", success: false}).end();
        return;
    }
    if (!validate(message)) {
        res.status(400).json({message: "Invalid Message", success: false}).end();
        return;
    }

    // noinspection SqlInsertIntoGeneratedColumn - We're inserting DEFAULT into the id, so, this is fine.
    pool.query("INSERT INTO guestbook (id, name, email, message) VALUES (DEFAULT, $1, $2, $3) RETURNING id, name, message, time", [name, email, message]).then((result) => {
        if (result.rowCount > 0) {
            res.json({success: true})
            // We only expect 1 row
            result.rows.forEach((entry) => {
                wss.getWss().clients.forEach((client) => {
                    if (client.readyState === 1) {

                        client.send(JSON.stringify(
                            {
                                id: entry.id,
                                name: entry.name,
                                message: entry.message,
                                time: entry.time
                            }
                        ))
                    }
                })
            })

        } else {
            res.status(500).json({success: false})
            console.log("An error occurred inserting into the database", result)
        }
    })

})

app.ws('/ws', function (ws, req) {
})

app.listen(port, () => {
    console.log(`Server is now running on http://0.0.0.0:${port}`);
})

