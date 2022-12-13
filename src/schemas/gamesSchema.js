import joi from "joi";

export const GameSchema = joi.object({
    name: joi.string().required(),
    image: joi.string().required(),
    stockTotal: joi.number().integer().required(),
    categoryId: joi.number().integer().required(),
    pricePerDay: joi.number().integer().required()
}); 