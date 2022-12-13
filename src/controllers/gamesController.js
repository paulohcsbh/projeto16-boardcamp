import { connectionDB } from "../database/db.js";

export async function getGames(req, res) {
    const searchGame = [];
    const gameName = req.query.name;
    try {
        const games = await connectionDB.query(`SELECT games.id, games.name, games.image, games.stocktotal AS "stockTotal", games.categoryid AS "categoryId", games.priceperday AS "pricePerDay",  categories.name AS "categoryName"
        FROM games 
        JOIN categories 
        ON games."categoryid" = categories.id ORDER BY id ASC`);

        if (!gameName) {
            return res.send(games.rows);
        } else {
            searchGame.splice(0, searchGame.length,)
            for (let i = 0; i < games.rows.length; i++) {
                const item = games.rows[i];
                if (item.name.slice(0, gameName.length).toLowerCase() === gameName.toLowerCase()) {
                    searchGame.push(item)
                }
            }
            return res.send(searchGame.sort((a, b) => {return a - b}));
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};

export async function postGames(req, res) {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
    try {
        await connectionDB.query("INSERT INTO games (name, image, stocktotal, categoryid, priceperday) VALUES ($1, $2, $3, $4, $5)", [name, image, stockTotal, categoryId, pricePerDay]
        );
        res.sendStatus(201);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};



