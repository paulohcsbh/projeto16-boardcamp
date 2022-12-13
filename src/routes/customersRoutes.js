import { getCustomers, getCustomersById, postCustomers, putCustomers } from "../controllers/customersController.js";
import {Router} from "express";
import { postValidation } from "../middlewares/schemaValidation.js"
const router = Router();

router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomersById);

router.post("/customers", postCustomers);
router.put("/customers/:id", putCustomers);

export default router;