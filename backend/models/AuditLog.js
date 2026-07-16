import mongoose from 'mongoose';

const auditLogSchema = mongoose.Schema(
  {
    user: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetComponent: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    }
  },
  {
    timestamps: true
  }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
