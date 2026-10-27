import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    azione: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN']
    },
    entita: {
      type: String,
      required: true,
      enum: ['Visit', 'Therapy', 'Pet', 'Vaccination', 'Appointment', 'Owner', 'Clinic', 'User']
    },
    entitaId: {
      type: String,
      default: ''
    },
    descrizione: {
      type: String,
      required: true
    },
    ambulatorioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic'
    },
    operatoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    operatoreNome: {
      type: String,
      default: 'Sistema'
    },
    dettagli: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ ambulatorioId: 1, createdAt: -1 });
auditLogSchema.index({ entita: 1, entitaId: 1 });
auditLogSchema.index({ operatoreId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
