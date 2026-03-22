const mongoose = require ("mongoose");

const auditSchema = new mongoose.Schema({
  adminId: String,
  action: String,
  targetUser: String
}, { timestamps: true });

const auditModel =  mongoose.model("AuditLog", auditSchema);

module.exports = auditModel