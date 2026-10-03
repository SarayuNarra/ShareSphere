const db = require("../config/db");

exports.getResources = (req, res) => {
  const { search, category, status, owner_id } = req.query;

  let sql = `
    SELECT
      r.resource_id,
      r.title,
      r.description,
      r.item_condition,
      r.availability_status,
      r.location,
      c.category_name,
      u.user_id AS owner_id,
      u.name AS owner_name
    FROM \`RESOURCE\` r
    JOIN CATEGORY c ON r.category_id = c.category_id
    JOIN \`USER\` u ON r.owner_id = u.user_id
    WHERE 1 = 1
  `;
  const params = [];

  if (search) {
    sql += " AND (r.title LIKE ? OR r.description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    sql += " AND c.category_name = ?";
    params.push(category);
  }

  if (status) {
    sql += " AND r.availability_status = ?";
    params.push(status);
  }

  if (owner_id) {
    sql += " AND r.owner_id = ?";
    params.push(owner_id);
  }

  sql += " ORDER BY r.resource_id DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("GET RESOURCES ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.sqlMessage || err.message
      });
    }

    return res.json({ success: true, data: results });
  });
};

exports.getResourceById = (req, res) => {
  const sql = `
    SELECT
      r.resource_id,
      r.owner_id,
      r.category_id,
      r.title,
      r.description,
      r.item_condition,
      r.availability_status,
      r.location,
      c.category_name,
      u.name AS owner_name,
      u.email AS owner_email,
      u.phone AS owner_phone
    FROM \`RESOURCE\` r
    JOIN CATEGORY c ON r.category_id = c.category_id
    JOIN \`USER\` u ON r.owner_id = u.user_id
    WHERE r.resource_id = ?
  `;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("GET RESOURCE DETAILS ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.sqlMessage || err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    return res.json({ success: true, data: results[0] });
  });
};

exports.getCategories = (req, res) => {
  db.query(
    `SELECT category_id, category_name, description
     FROM CATEGORY
     ORDER BY category_name`,
    (err, results) => {
      if (err) {
        console.error("GET CATEGORIES ERROR:", err);
        return res.status(500).json({
          success: false,
          message: err.sqlMessage || err.message
        });
      }

      return res.json({ success: true, data: results });
    }
  );
};

exports.createResource = (req, res) => {
  const {
    owner_id,
    category_id,
    title,
    description,
    item_condition,
    location
  } = req.body;

  if (!owner_id || !category_id || !title || !item_condition || !location) {
    return res.status(400).json({
      success: false,
      message: "owner_id, category_id, title, item_condition and location are required"
    });
  }

  const sql = `
    INSERT INTO \`RESOURCE\`
      (owner_id, category_id, title, description, item_condition, availability_status, location)
    VALUES (?, ?, ?, ?, ?, 'AVAILABLE', ?)
  `;

  db.query(
    sql,
    [owner_id, category_id, title, description || null, item_condition, location],
    (err, result) => {
      if (err) {
        console.error("CREATE RESOURCE ERROR:", err);
        return res.status(500).json({
          success: false,
          message: err.sqlMessage || err.message
        });
      }

      return res.status(201).json({
        success: true,
        message: "Resource listed successfully",
        resource_id: result.insertId
      });
    }
  );
};

exports.updateResourceStatus = (req,res)=>{
  const {status}=req.body;
  const allowed=["AVAILABLE","MAINTENANCE"];
  if(!allowed.includes(status)) return res.status(400).json({success:false,message:"Invalid resource status"});
  db.query("UPDATE \`RESOURCE\` SET availability_status=? WHERE resource_id=? AND owner_id=?",[status,req.params.id,req.body.owner_id],(err,result)=>{
    if(err) return res.status(500).json({success:false,message:err.sqlMessage||err.message});
    if(!result.affectedRows) return res.status(404).json({success:false,message:"Resource not found or you are not the owner"});
    res.json({success:true,message:`Resource marked ${status.toLowerCase()}`});
  });
};
