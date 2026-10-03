const db = require("../config/db");

exports.createRequest = (req, res) => {
  const { borrower_id, resource_id, start_date, end_date, message } = req.body;

  if (!borrower_id || !resource_id || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "borrower_id, resource_id, start_date and end_date are required"
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(start_date);
  const end = new Date(end_date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ success:false, message:'Please select valid start and end dates' });
  }
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  if (start < today) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot be before today'
    });
  }

  if (end < start) {
    return res.status(400).json({
      success: false,
      message: "end_date cannot be before start_date"
    });
  }

  const sql = `
    INSERT INTO BORROW_REQUEST
      (borrower_id, resource_id, request_date, start_date, end_date, status, message)
    VALUES (?, ?, CURDATE(), ?, ?, 'PENDING', ?)
  `;

  db.query(sql, [borrower_id, resource_id, start_date, end_date, message || null],
    (err, result) => {
      if (err) {
        console.error("CREATE REQUEST ERROR:", err);
        return res.status(500).json({
          success: false,
          message: err.sqlMessage || err.message
        });
      }

      return res.status(201).json({
        success: true,
        message: "Borrow request submitted",
        request_id: result.insertId
      });
    }
  );
};

exports.getMyRequests = (req, res) => {
  const id = req.query.borrower_id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "borrower_id is required"
    });
  }

  const sql = `
    SELECT
      br.*,
      r.title,
      r.location,
      u.name AS owner_name
    FROM BORROW_REQUEST br
    JOIN \`RESOURCE\` r ON br.resource_id = r.resource_id
    JOIN \`USER\` u ON r.owner_id = u.user_id
    WHERE br.borrower_id = ?
    ORDER BY br.request_id DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("MY REQUESTS ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.sqlMessage || err.message
      });
    }

    return res.json({ success: true, data: results });
  });
};

exports.getOwnerRequests = (req, res) => {
  const id = req.query.owner_id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "owner_id is required"
    });
  }

  const sql = `
    SELECT
      br.request_id,
      br.borrower_id,
      br.resource_id,
      br.request_date,
      br.start_date,
      br.end_date,
      br.status,
      br.message,
      r.title,
      r.location,
      r.availability_status,
      u.name AS borrower_name,
      u.email AS borrower_email
    FROM BORROW_REQUEST br
    JOIN \`RESOURCE\` r ON br.resource_id = r.resource_id
    JOIN \`USER\` u ON br.borrower_id = u.user_id
    WHERE r.owner_id = ?
    ORDER BY
      CASE WHEN br.status = 'PENDING' THEN 0 ELSE 1 END,
      br.request_id DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("OWNER REQUESTS ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.sqlMessage || err.message
      });
    }

    return res.json({ success: true, data: results });
  });
};

exports.updateRequestStatus = (req, res) => {
  const { status } = req.body;
  const allowed = ["APPROVED", "REJECTED", "CANCELLED"];

  if (!allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request status"
    });
  }

  const sql = `
    UPDATE BORROW_REQUEST
    SET status = ?
    WHERE request_id = ? AND status = 'PENDING'
  `;

  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) {
      console.error("UPDATE REQUEST ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.sqlMessage || err.message
      });
    }

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Pending request not found or already processed"
      });
    }

    return res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`
    });
  });
};
