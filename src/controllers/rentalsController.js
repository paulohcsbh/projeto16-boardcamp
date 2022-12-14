import dayjs from "dayjs";
import { connectionDB } from "../database/db.js";

const day = dayjs().format("YYYY-MM-DD");

export async function getRentals(req, res) {
    const customerId = parseInt(req.query.customerId);
    const gameId = parseInt(req.query.gameId);
    const arrRentals = [];
    const searchGameId = [];
    const searchCustomerId = [];
    try {
        const rentals = await connectionDB.query("SELECT * FROM rentals ORDER BY id ASC");
        const rentalsJoin = await connectionDB.query(`
        SELECT customers.id AS "customerId", customers.name AS "customerName" , games.id AS "gameId",
        games.name AS "gameName", games.categoryid AS "gamesCategoryId"
        FROM customers 
        JOIN rentals
         ON customers.id = rentals.customer_id
        JOIN games 
         ON rentals.game_id = games.id 
        `);
        console.log(rentals.rows)
        for (let i = 0; i < rentalsJoin.rows.length; i++) {
            const objRentals = {
                id: rentals.rows[i].id,
                customerId: rentals.rows[i].customer_id,
                gameId: rentals.rows[i].game_id,
                rentDate: day,
                daysRented: rentals.rows[i].days_rented,
                returnDate: rentals.rows[i].return_date,
                originalPrice: rentals.rows[i].original_price,
                delayFee: rentals.rows[i].delay_fee,
                customer: {
                    id: rentalsJoin.rows[i].customerId,
                    name: rentalsJoin.rows[i].customerName
                },
                game: {
                    id: rentalsJoin.rows[i].gameId,
                    name: rentalsJoin.rows[i].gameName,
                    categoryId: rentalsJoin.rows[i].gamesCategoryId
                }
            }
            arrRentals.push(objRentals);
        };

        if (!customerId && !gameId) {

            return res.send(arrRentals);
        }

        if (customerId) {

            for (let j = 0; j < arrRentals.length; j++) {
                const item = arrRentals[j];
                if (item.customerId === customerId) {
                    searchCustomerId.push(item);
                }
            }
            return res.send(searchCustomerId);
        };
        if (gameId) {

            for (let k = 0; k < arrRentals.length; k++) {
                const item2 = arrRentals[k];
                if (item2.gameId === gameId) {
                    searchGameId.push(item2);
                }
            }
            return res.send(searchGameId);
        }

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    };

};

export async function postRentals(req, res){
    const {customerId, gameId, daysRented} = req.body;
    try{        
        const games = await connectionDB.query("SELECT * FROM games");
        
        const customers = await connectionDB.query("SELECT * FROM customers");
        
        const game = games.rows.find(game => game.id === parseInt(gameId));
        const validateCustomerId = customers.rows.filter((customer) => customer.id === parseInt(customerId) )
        const validateGameId = games.rows.filter((game) => game.id === parseInt(gameId) )
        const rentDate = day;
        const returnDate = null;
        
        const originalPrice = game.priceperday * parseInt(daysRented);
        const delayFee = null;
        
        if(game.stocktotal === 0){
            return res.sendStatus(400);
        }
        if(!validateCustomerId.length){
            return res.sendStatus(400);
        }
        if(!validateGameId.length){
            return res.sendStatus(400);
        }
        if(!daysRented){
            return res.sendStatus(400);
        }        
        await connectionDB.query(`INSERT INTO rentals (customer_id, game_id, rent_date, days_rented, return_date, original_price, delay_fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`, [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee ]
    );
    const stockAtualizado = game.stocktotal - 1
    const id = game.id;
    
    await connectionDB.query("UPDATE games SET stocktotal = $1 WHERE id = $2", [stockAtualizado, id])
        res.sendStatus(201);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }    
};

export async function postRentalsReturn(req, res){
    const {id} = req.params;
    const returnDate = day; 
     
    if (isNaN(id)) {
        return res.sendStatus(400);
    }    
    try{
        let delayFee = null;
        const rentals = await connectionDB.query("SELECT * FROM rentals WHERE id =$1", [id]);
        const dia =  dayjs().add(rentals.rows[0].days_rented, 'day')
        if("returnDate" > dia.format("YYYY-MM-DD")){
            const year = (parseInt(returnDate.slice(0,4)) - parseInt(dia.format("YYYY-MM-DD").slice(0,4))) * 365
            const month = (parseInt(returnDate.slice(5,7)) - parseInt(dia.format("YYYY-MM-DD").slice(5,7))) * 30 
            const day = (parseInt(returnDate.slice(8,10)) - parseInt(dia.format("YYYY-MM-DD").slice(8,10))) 
            const result = year + month + day
            delayFee = (rentals.rows[0].original_price / rentals.rows[0].days_rented) * result  ;
        }
         
        if (!rentals.rows.length) {
        return res.sendStatus(404);
    }
    if(rentals.rows[0].return_date){
        return res.sendStatus(400)
    }
        const rentDate = parseInt(rentals.rows[0].rent_date.slice(8, ))
        console.log(rentDate)
        
        
        await connectionDB.query("UPDATE rentals SET return_date = $1, delay_fee = $2 WHERE id = $3", [returnDate, delayFee, id]);
        res.sendStatus(200);

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }  
};

export async function deleteRentals(req, res){
    const {id} = req.params;
    try{
        const rentals = await connectionDB.query("SELECT * FROM rentals");
        const validateId = rentals.rows.find((rental) => rental.id === parseInt(id))
        if(!validateId){
            return res.sendStatus(404);
        }  
        await connectionDB.query("DELETE FROM rentals  WHERE id = $1", [id]);      
        res.sendStatus(200);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
};
