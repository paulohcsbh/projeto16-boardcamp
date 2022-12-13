import { CustomerSchema } from "../schemas/customerSchema.js";
import { CategoriesSchema } from "../schemas/categoriesSchema.js";
import { GameSchema } from "../schemas/gamesSchema.js";
import { RentalSchema } from "../schemas/rentalsSchema.js";

export function postValidation(req, res, next){
    const { name, phone, cpf, birthday } = req.body;
    const validation = CustomerSchema.validate({
        name,
        phone,
        cpf,
        birthday
    }, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        return res.status(400).send(errors)
    }
    next();
};

export function categoriesValidation (req, res, next){
    const { name } = req.body;
    const validation = CategoriesSchema.validate({
        name
    }, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        return res.status(400).send(errors)
    }
    next();
};

export function gameValidation (req, res, next){
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
    const validation = GameSchema.validate({
        name,
        image,
        stockTotal,
        categoryId,
        pricePerDay
    }, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        return res.status(400).send(errors)
    }
    next();
};

export function rentalValidation (req, res, next){
    const {customerId, gameId, daysRented} = req.body;
    const validation = RentalSchema.validate({
        customerId,
        gameId,
        daysRented
    }, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        return res.status(400).send(errors)
    }
    next();
};