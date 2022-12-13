import joi from "joi";

export const CustomerSchema = joi.object({
    name: joi.string().required(),
    cpf: joi.string().min(10).max(11).required(),
    phone: joi.string().min(10).max(11).required(),
    birthday: joi.date().iso()
}); 