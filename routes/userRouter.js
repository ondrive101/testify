import { Router } from "express";
const router = Router();

import {
  getCurrentUser,
 getUserList,
 getUserListAdmin,
 deleteUser,
 userEdit,
 userAddProperty
} from "../controllers/userController.js";
import { validateUserEditInput } from "../middleware/validationMiddleware.js";

router.get("/current-user", getCurrentUser);

router.get("/user-list", getUserList);
router.get("/user-list-admin", getUserListAdmin);
router.delete("/delete/:id", deleteUser);
router.patch('/edit/:id', userEdit)
router.patch('/add-property', userAddProperty)


export default router;
