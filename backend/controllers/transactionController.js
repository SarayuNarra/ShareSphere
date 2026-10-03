const db = require("../config/db");

exports.borrowResource = (req, res) => {
  const { request_id, issue_date, due_date } = req.body;

  if (!request_id || !issue_date || !due_date) {
    return res.status(400).json({
      success: false,
      message: "request_id, issue_date and due_date are required"
    });
  }

  db.query(
    "CALL BORROW_RESOURCE(?, ?, ?)",
    [request_id, issue_date, due_date],
    (err, results) => {
      if (err) {
        console.error("BORROW ERROR:", err);
        return res.status(400).json({
          success: false,
          message: err.sqlMessage || err.message
        });
      }

      return res.status(201).json({
        success: true,
        message: "Resource borrowed successfully",
        data: results
      });
    }
  );
};

exports.returnResource = (req, res) => {
  const { return_date } = req.body;

  if (!return_date) {
    return res.status(400).json({
      success: false,
      message: "return_date is required"
    });
  }

  db.query(
    "CALL RETURN_RESOURCE(?, ?)",
    [req.params.id, return_date],
    (err, results) => {
      if (err) {
        console.error("RETURN ERROR:", err);
        return res.status(400).json({
          success: false,
          message: err.sqlMessage || err.message
        });
      }

      return res.json({
        success: true,
        message: "Resource returned successfully",
        data: results
      });
    }
  );
};

exports.getTransactions = (req, res) => {
  const id = req.query.user_id;

  let sql = `
    SELECT
      bt.transaction_id,
      bt.request_id,
      bt.issue_date,
      bt.due_date,
      bt.return_date,
      bt.status,
      r.resource_id,
      r.title,
      borrower.name AS borrower_name,
      owner.name AS owner_name
    FROM BORROW_TRANSACTION bt
    JOIN BORROW_REQUEST br ON bt.request_id = br.request_id
    JOIN \`RESOURCE\` r ON br.resource_id = r.resource_id
    JOIN \`USER\` borrower ON br.borrower_id = borrower.user_id
    JOIN \`USER\` owner ON r.owner_id = owner.user_id
  `;

  const params = [];

  if (id) {
    sql += " WHERE br.borrower_id = ? OR r.owner_id = ?";
    params.push(id, id);
  }

  sql += " ORDER BY bt.transaction_id DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("TRANSACTIONS ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.sqlMessage || err.message
      });
    }

    return res.json({ success: true, data: results });
  });
};
