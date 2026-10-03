const router=require("express").Router();
const c=require("../controllers/damageController");
router.post("/",c.createDamageReport);
router.get("/:transactionId",c.getDamageReportsForTransaction);
module.exports=router;
