const db=require("../config/db");

exports.createFeedback=(req,res)=>{
  const {transaction_id,user_id,rating,comments}=req.body;
  if(!transaction_id||!user_id||!rating)return res.status(400).json({success:false,message:"transaction_id, user_id and rating are required"});
  if(rating<1||rating>5)return res.status(400).json({success:false,message:"Rating must be between 1 and 5"});
  db.query(`INSERT INTO FEEDBACK(transaction_id,user_id,rating,comments,feedback_date) VALUES(?,?,?,?,CURDATE())`,[transaction_id,user_id,rating,comments||null],(e,r)=>e?res.status(400).json({success:false,message:e.sqlMessage||"Could not submit feedback"}):res.status(201).json({success:true,message:"Feedback submitted successfully",feedback_id:r.insertId}));
};

exports.getFeedbackForTransaction=(req,res)=>{
  db.query(`SELECT f.feedback_id,f.transaction_id,f.user_id,f.rating,f.comments,f.feedback_date,u.name AS user_name
            FROM FEEDBACK f JOIN \`USER\` u ON f.user_id=u.user_id
            WHERE f.transaction_id=? ORDER BY f.feedback_id DESC`,[req.params.transactionId],(e,rows)=>{
    if(e)return res.status(500).json({success:false,message:e.sqlMessage||e.message});
    res.json({success:true,data:rows});
  });
};
