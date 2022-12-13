import { connectionDB } from "../database/db.js";

export async function getCustomers(req, res) {
    const searchCustomer = [];
    const cpf = req.query.cpf;
    try {
        const customers = await connectionDB.query("SELECT * FROM customers ORDER BY id ASC");

        if (!cpf) {
            return res.send(customers.rows);
        } else {
            searchCustomer.splice(0, searchCustomer.length,)
            for (let i = 0; i < customers.rows.length; i++) {
                const item = customers.rows[i];
                if (item.cpf.slice(0, cpf.length) === cpf) {
                    searchCustomer.push(item);
                }
            }
            return res.send(searchCustomer);
        }

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};

export async function getCustomersById(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.sendStatus(400);
    }
    try {
        const customers = await connectionDB.query("SELECT * FROM customers WHERE id =$1", [id]);
        if (!customers.rows.length) {
            return res.sendStatus(404);
        }
        return res.send(customers.rows[0]);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};

export async function postCustomers(req, res) {
    const { name, phone, cpf, birthday } = req.body;

    try {
        const customers = await connectionDB.query("SELECT * FROM customers");

        if (customers.rows.find(customer => customer.cpf === cpf)) {
            return res.sendStatus(409);
        }

        await connectionDB.query("INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)", [name, phone, cpf, birthday]);

        res.sendStatus(200);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};

export async function putCustomers(req, res) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.sendStatus(400);
    }

    const { name, phone, cpf, birthday } = req.body;
    try {
        const customers = await connectionDB.query("SELECT * FROM customers");

        if (customers.rows.find(customer => customer.cpf === cpf)) {
            return res.sendStatus(409);
        }

        await connectionDB.query("UPDATE customers  SET name = $1 , phone = $2, cpf =$3 , birthday = $4 WHERE id =$5", [name, phone, cpf, birthday, id]);
        res.sendStatus(201);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

