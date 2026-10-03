const router=require("express").Router();
const c=require("../controllers/feedbackController");
router.post("/",c.createFeedback);
router.get("/:transactionId",c.getFeedbackForTransaction);
module.exports=router;
