import express from "express";
import pg from "pg";
import joi from "joi"
import dayjs from "dayjs";
import dotenv from "dotenv";
dotenv.config();


/*

*/

const { Pool } = pg;
const connection = new Pool({
    user: "postgres",
    host: "localhost",
    port: 5432,
    database: "boardcamp",
    password: "123456"
});

const app = express();
app.use(express.json());


const customerSchema = joi.object({
    name: joi.string().required(),
    cpf: joi.string().min(10).max(11).required(),
    phone: joi.string().min(10).max(11).required(),
    birthday: joi.date().iso()

});

const day = dayjs().format("YYYY-MM-DD");

app.get("/categories", async (req, res) => {
    const categories = await connection.query("SELECT * FROM categories");
    res.send(categories.rows);
});

app.post("/categories", async (req, res) => {
    const { name } = req.body;
    await connection.query("INSERT INTO categories (name) VALUES ($1)", [name]
    );
    res.sendStatus(201);
});

app.get("/games", async (req, res) => {
    const searchGame = [];
    const gameName = req.query.name;
    const games = await connection.query("SELECT * FROM games");

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
        return res.send(searchGame);
    }
});

app.post("/games", async (req, res) => {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
    await connection.query("INSERT INTO games (name, image, stocktotal, categoryid, priceperday) VALUES ($1, $2, $3, $4, $5)", [name, image, stockTotal, categoryId, pricePerDay]
    );
    res.sendStatus(201);
});

app.get("/customers", async (req, res) => {
    const searchCustomer = [];
    const cpf = req.query.cpf;
    const customers = await connection.query("SELECT * FROM customers");

    if (!cpf) {
        return res.send(customers.rows);
    } else {
        searchCustomer.splice(0, searchCustomer.length,)
        for (let i = 0; i < customers.rows.length; i++) {
            const item = customers.rows[i];
            if (item.cpf.slice(0, cpf.length) === cpf) {
                searchCustomer.push(item)
            }
        }
        return res.send(searchCustomer);
    }

});

app.get("/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.sendStatus(400);
    }
    const customers = await connection.query("SELECT * FROM customers WHERE id =$1", [id]);
    if (!customers.rows.length) {
        return res.sendStatus(404);
    }
    return res.send(customers.rows[0]);
});

app.post("/customers", async (req, res) => {
    const { name, phone, cpf, birthday } = req.body;

    const customers = await connection.query("SELECT * FROM customers");

    const validation = customerSchema.validate({
        name,
        phone,
        cpf,
        birthday
    }, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        return res.status(400).send(errors)
    }
    if (customers.rows.find(customer => customer.cpf === cpf)) {
        return res.sendStatus(409);
    }

    await connection.query("INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)", [name, phone, cpf, birthday]);

    res.sendStatus(200);
});

app.put("/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.sendStatus(400);
    }

    const { name, phone, cpf, birthday } = req.body;

    const customers = await connection.query("SELECT * FROM customers");

    const validation = customerSchema.validate({
        name,
        phone,
        cpf,
        birthday
    }, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        return res.status(400).send(errors)
    }
    if (customers.rows.find(customer => customer.cpf === cpf)) {
        return res.sendStatus(409);
    }

    await connection.query("UPDATE customers  SET name = $1 , phone = $2, cpf =$3 , birthday = $4 WHERE id =$5", [name, phone, cpf, birthday, id]);
    res.sendStatus(201);
});

app.get("/rentals", async (req, res) => {
    const customerId = parseInt(req.query.customerId);
    const  gameId = parseInt(req.query.gameId);
    const arrRentals = [];
    const searchGameId  = [];
    const searchCustomerId = [];
    try {
        const rentals1 = await connection.query("SELECT * FROM rentals1");
        const rentals = await connection.query(`
        SELECT customers.id AS "customerId", customers.name AS "customerName" , games.id AS "gameId",
        games.name AS "gameName", games.categoryid AS "gamesCategoryId"
        FROM customers 
        JOIN rentals1
         ON customers.id = rentals1.customer_id
        JOIN games 
         ON rentals1.game_id = games.id 
        `);
        console.log(rentals1.rows)
        for (let i = 0; i < rentals.rows.length; i++) {
            const objRentals = {
                id: rentals1.rows[i].id,
                customerId: rentals1.rows[i].customer_id,
                gameId: rentals1.rows[i].game_id,
                rentDate: day,
                daysRented: rentals1.rows[i].days_rented,
                returnDate: rentals1.rows[i].return_date,
                originalPrice: rentals1.rows[i].original_price,
                delayFee: rentals1.rows[i].delay_fee,
                customer: {
                    id: rentals.rows[i].customerId,
                    name: rentals.rows[i].customerName
                },
                game: {
                    id: rentals.rows[i].gameId,
                    name: rentals.rows[i].gameName,
                    categoryId: rentals.rows[i].gamesCategoryId    
                }
            }
            arrRentals.push(objRentals);
        };        

        if(!customerId && !gameId){
            
            return res.send(arrRentals);
        }

        if(customerId){
            
            for(let j = 0; j < arrRentals.length; j++){
                const item = arrRentals[j];
                if(item.customerId === customerId){
                    searchCustomerId.push(item);
                }
            }
            return res.send(searchCustomerId);
        };
        if(gameId){
            
            for(let k = 0; k < arrRentals.length; k++){
                const item2 = arrRentals[k];
                if(item2.gameId === gameId){
                    searchGameId.push(item2);
                }
            }
            return res.send(searchGameId);
        }
        
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    };
});

app.post("/rentals", async (req, res) => {
    const {customerId, gameId, daysRented} = req.body;
    
    try{        
        const games = await connection.query("SELECT * FROM games");
        
        const customers = await connection.query("SELECT * FROM customers");
        
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
        await connection.query(`INSERT INTO rentals1 (customer_id, game_id, rent_date, days_rented, return_date, original_price, delay_fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`, [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee ]
    );
    const stockAtualizado = game.stocktotal - 1
    const id = game.id;
    
    await connection.query("UPDATE games SET stocktotal = $1 WHERE id = $2", [stockAtualizado, id])
        res.sendStatus(201);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }    
});

app.post("/rentals/:id/return", async (req, res) => {
    const {id} = req.params;
    const returnDate = day; 
     
    if (isNaN(id)) {
        return res.sendStatus(400);
    }    
    try{
        let delayFee = null;
        const rentals = await connection.query("SELECT * FROM rentals1 WHERE id =$1", [id]);
        const dia =  dayjs().add(rentals.rows[0].days_rented, 'day')
        if("returnDate" > dia.format("YYYY-MM-DD")){
            const year = (parseInt(returnDate.slice(0,4)) - parseInt(dia.format("YYYY-MM-DD").slice(0,4))) * 365
            console.log(year)
            const month = (parseInt(returnDate.slice(5,7)) - parseInt(dia.format("YYYY-MM-DD").slice(5,7))) * 30 
            console.log(month)
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
        
        
        await connection.query("UPDATE rentals1 SET return_date = $1, delay_fee = $2 WHERE id = $3", [returnDate, delayFee, id]);
        res.sendStatus(200);

    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }  
});

app.delete("/rentals/:id", async (req, res ) => {
    const {id} = req.params;
    try{
        const rentals = await connection.query("SELECT * FROM rentals1");
        const validateId = rentals.rows.find((rental) => rental.id === parseInt(id))
        if(!validateId){
            return res.sendStatus(404);
        }  
        await connection.query("DELETE FROM rentals1  WHERE id = $1", [id]);      
        res.sendStatus(200);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

app.listen(4000, () => {
    console.log("App running in port 4000.")
});