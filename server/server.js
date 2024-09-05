import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';

// Setup environment
dotenv.config();
const port = process.env.PORT || 8080;

// Woo
const app = express();

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
    const dbRes = await pool.query("SELECT id, name, message FROM guestbook");
    console.log(dbRes);
    res.json(dbRes.rows)
})

app.post("/messages", async (req, res) => {
    const name = req.body.name;
    const message = req.body.message;
    if (!validate(name, 64)) {
        res.status(400).json({message: "Invalid name", success: false}).end();
        return;
    }
    if (!validate(message)) {
        res.status(400).json({message: "Invalid Message", success: false}).end();
        return;
    }

    pool.query("INSERT INTO guestbook (name, message) VALUES ($1, $2)", [name, message]).then((result) => {
        if (result.rowCount > 0) {
            res.json({success: true})
        } else {
            res.status(500).json({success: false})
            console.log("An error occurred inserting into the database", result)
        }
    })

})

app.listen(port, () => {
    console.log(`Server is now running on http://localhost:${port}`);
})
