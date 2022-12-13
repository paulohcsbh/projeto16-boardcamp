import { getRentals, postRentals, postRentalsReturn, deleteRentals } from "../controllers/rentalsController.js";
//import { rentalValidation } from "../middlewares/schemaValidation.js";

import {Router} from "express";

const router = Router();

router.get("/rentals", getRentals);
router.post("/rentals/:id/return", postRentalsReturn);
router.delete("/rentals/:id", deleteRentals);

router.post("/rentals", postRentals);

export default router;