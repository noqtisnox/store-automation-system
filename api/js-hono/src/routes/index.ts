import { Hono } from "hono";

import auth from "./auth";
import products from "./products";

const router = new Hono();

router.route("/auth", auth);
router.route("/products", products);

export default router;
