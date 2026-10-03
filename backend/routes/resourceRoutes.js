const router=require("express").Router();
const c=require("../controllers/resourceController");
router.get("/",c.getResources);
router.get("/categories",c.getCategories);
router.get("/:id",c.getResourceById);
router.post("/",c.createResource);
router.put("/:id/status",c.updateResourceStatus);
module.exports=router;
