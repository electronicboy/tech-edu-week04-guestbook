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
 Util
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
    pool.query("SELECT id, name, message, time, email FROM guestbook").then(result => {
        if (result.rowCount > 0) {
            const filtered = result.rows.map((entry) => {
                return {
                    id: entry.id,
                    name: entry.name,
                    message: entry.message,
                    time: entry.time,
                    hasEmail: entry.email ? true : false
                }
            })
            res.json(filtered);
        } else {
            res.json({})
        }

    });
})

app.post("/messages", async (req, res) => {
    const name = escapeHtml(req.body.name);
    const email = req.body.email ? escapeHtml(req.body.email) : null;
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
    pool.query("INSERT INTO guestbook (id, name, email, message) VALUES (DEFAULT, $1, $2, $3) RETURNING id, name, email, message, time", [name, email, message]).then((result) => {
        if (result.rowCount > 0) {
            res.json({success: true})
            // We only expect 1 row
            result.rows.forEach((entry) => {
                wss.getWss().clients.forEach((client) => {
                    if (client.readyState === 1) {

                        client.send(JSON.stringify(
                            {
                                action: "add",
                                id: entry.id,
                                name: entry.name,
                                message: entry.message,
                                time: entry.time,
                                hasEmail: entry.email ? true : false
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

app.delete("/messages/delete/:id", (req, res) => {
    pool.query("DELETE FROM guestbook WHERE id = $1", [req.params.id])
    .then((result) => {
        if (result.rowCount > 0) {
            res.json({success: true})
            wss.getWss().clients.forEach((client) => {
                client.send(JSON.stringify({
                    action: "delete",
                    id: req.params.id
                }))
            })
        } else {
            res.status(404).json({success: false, message: "Comment did not exist"})
        }
    })
})

app.ws('/ws', function (ws, req) {
})

app.listen(port, () => {
    console.log(`Server is now running on http://0.0.0.0:${port}`);
})

