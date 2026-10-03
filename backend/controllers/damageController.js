const db=require("../config/db");

exports.createDamageReport=(req,res)=>{
  const {transaction_id,reported_by,damage_type,description,estimated_cost}=req.body;
  if(!transaction_id||!reported_by||!damage_type||!description)return res.status(400).json({success:false,message:"transaction_id, reported_by, damage_type and description are required"});
  db.query(`INSERT INTO DAMAGE_REPORT(transaction_id,reported_by,damage_type,description,reported_date,estimated_cost,status) VALUES(?,?,?,?,CURDATE(),?,'REPORTED')`,[transaction_id,reported_by,damage_type,description,estimated_cost||0],(e,r)=>e?res.status(400).json({success:false,message:e.sqlMessage||"Could not create damage report"}):res.status(201).json({success:true,message:"Damage report submitted successfully",report_id:r.insertId}));
};

exports.getDamageReportsForTransaction=(req,res)=>{
  db.query(`SELECT d.report_id,d.transaction_id,d.reported_by,d.damage_type,d.description,d.reported_date,d.estimated_cost,d.status,u.name AS reporter_name
            FROM DAMAGE_REPORT d JOIN \`USER\` u ON d.reported_by=u.user_id
            WHERE d.transaction_id=? ORDER BY d.report_id DESC`,[req.params.transactionId],(e,rows)=>{
    if(e)return res.status(500).json({success:false,message:e.sqlMessage||e.message});
    res.json({success:true,data:rows});
  });
};
