import joi from "joi";

export const CategoriesSchema = joi.object({
    name: joi.string().required()    
}); 