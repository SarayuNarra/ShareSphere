const db = require('../config/db');
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (!stored) return { valid: false, legacy: false };
  if (!stored.startsWith('scrypt$')) {
    return { valid: stored === password, legacy: stored === password };
  }

  const parts = stored.split('$');
  if (parts.length !== 3) return { valid: false, legacy: false };

  try {
    const [, salt, expectedHex] = parts;
    const actual = await scrypt(password, salt, KEY_LENGTH);
    const expected = Buffer.from(expectedHex, 'hex');
    return {
      valid: expected.length === actual.length && crypto.timingSafeEqual(expected, actual),
      legacy: false
    };
  } catch {
    return { valid: false, legacy: false };
  }
}

exports.register = async (req, res) => {
  const { name, email, phone, password, address } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success:false, message:'Name, email, phone and password are required' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const sql = `INSERT INTO \`USER\` (name,email,phone,password,address,join_date,status) VALUES (?,?,?,?,?,CURDATE(),'ACTIVE')`;
    db.query(sql,[name,email,phone,passwordHash,address||null],(err,result)=>{
      if(err) return res.status(400).json({success:false,message:err.sqlMessage||err.message});
      db.query('SELECT user_id,name,email,phone,address,join_date,status FROM \`USER\` WHERE user_id=?',[result.insertId],(e,rows)=>{
        if(e) return res.status(500).json({success:false,message:e.message});
        return res.status(201).json({success:true,message:'Registration successful',user:rows[0]});
      });
    });
  } catch (err) {
    console.error('PASSWORD HASH ERROR:', err);
    return res.status(500).json({ success:false, message:'Unable to secure the password' });
  }
};

exports.login = async (req,res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({success:false,message:'Email and password are required'});

  db.query('SELECT user_id,name,email,phone,address,join_date,status,password FROM \`USER\` WHERE email=? LIMIT 1',[email],async(err,rows)=>{
    if(err) return res.status(500).json({success:false,message:err.sqlMessage||err.message});
    if(!rows.length) return res.status(401).json({success:false,message:'Invalid email or password'});
    if(rows[0].status !== 'ACTIVE') return res.status(403).json({success:false,message:'This account is not active'});

    try {
      const result = await verifyPassword(password, rows[0].password);
      if (!result.valid) return res.status(401).json({success:false,message:'Invalid email or password'});

      // Existing project users were created before password hashing was added.
      // On their first successful login, transparently replace the legacy value with a secure hash.
      if (result.legacy) {
        const newHash = await hashPassword(password);
        db.query('UPDATE \`USER\` SET password=? WHERE user_id=?',[newHash,rows[0].user_id],(updateErr)=>{
          if (updateErr) console.error('PASSWORD MIGRATION ERROR:', updateErr);
        });
      }

      const { password: ignored, ...user } = rows[0];
      return res.json({success:true,message:'Login successful',user});
    } catch (e) {
      console.error('PASSWORD VERIFY ERROR:', e);
      return res.status(500).json({success:false,message:'Unable to verify password'});
    }
  });
};

exports.getUser = (req,res) => {
  db.query('SELECT user_id,name,email,phone,address,join_date,status FROM \`USER\` WHERE user_id=?',[req.params.id],(err,rows)=>{
    if(err) return res.status(500).json({success:false,message:err.message});
    if(!rows.length) return res.status(404).json({success:false,message:'User not found'});
    res.json({success:true,user:rows[0]});
  });
};
