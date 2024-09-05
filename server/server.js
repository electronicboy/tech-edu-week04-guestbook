import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressws from 'express-ws';
import WebSocket from 'node:stream/web';
import pg from 'pg';

// Setup environment
dotenv.config();

const port = process.env.PORT || 8080;
const WS_HOST = process.env.WS_HOST || null;

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
    pool.query("SELECT id, name, message FROM guestbook").then(result => {
        if (result.rowCount > 0) {
            const filtered = result.rows.map((entry) => {
                return {
                    name: entry.name,
                    message: entry.message
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
    const message = req.body.message;
    if (!validate(name, 64)) {
        res.status(400).json({message: "Invalid name", success: false}).end();
        return;
    }
    if (!validate(message)) {
        res.status(400).json({message: "Invalid Message", success: false}).end();
        return;
    }

    pool.query("INSERT INTO guestbook (name, email, message) VALUES ($1, $2, $3)", [name, email, message]).then((result) => {
        if (result.rowCount > 0) {
            res.json({success: true})
            wss.getWss().clients.forEach((client) => {
                console.log(client.readyState)
                if (client.readyState === 1) {
                    client.send(JSON.stringify({name: name, message: message}))
                }
                console.log(client);
            })

        } else {
            res.status(500).json({success: false})
            console.log("An error occurred inserting into the database", result)
        }
    })

})

app.ws('/ws', function(ws, req) {
    console.log(arguments)
})

/**
 *
 */
function handleWS(ws, msg) {

}

app.listen(port, () => {
    console.log(`Server is now running on http://localhost:${port}`);
})

