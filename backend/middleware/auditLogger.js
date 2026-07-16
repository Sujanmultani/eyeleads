import AuditLog from '../models/AuditLog.js';

// Global shared mock array for in-memory logging in offline/fallback mode
export const MOCK_AUDIT_LOGS = [
  {
    _id: 'mock-log-1',
    user: 'admin@eyeleads.com',
    action: 'SYSTEM_STARTUP',
    targetComponent: 'Server Engine',
    details: 'EyeLeads Express Server initialized successfully on port 5000.',
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 3600000 * 5)
  },
  {
    _id: 'mock-log-2',
    user: 'admin@eyeleads.com',
    action: 'DB_FALLBACK',
    targetComponent: 'Mongoose Adapter',
    details: 'MongoDB Offline. Activated high-fidelity mock database fallbacks.',
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 3600000 * 4)
  },
  {
    _id: 'mock-log-3',
    user: 'admin@eyeleads.com',
    action: 'SEED_CATALOG',
    targetComponent: 'Product Catalog',
    details: 'Seeded in-memory state with 18 luxury eyewear frames.',
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 3600000 * 3)
  }
];

export const logActivity = async (userEmail, action, targetComponent, details, ipAddress = '127.0.0.1') => {
  try {
    const email = userEmail || 'system@eyeleads.com';
    const logDetails = details || '';
    
    if (process.env.DB_CONNECTED === 'true') {
      const log = new AuditLog({
        user: email,
        action,
        targetComponent,
        details: logDetails,
        ipAddress
      });
      await log.save();
      console.log(`[Audit Log Saved to DB] ${email} - ${action} on ${targetComponent}`);
    } else {
      const mockLog = {
        _id: `mock-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user: email,
        action,
        targetComponent,
        details: logDetails,
        ipAddress,
        createdAt: new Date()
      };
      MOCK_AUDIT_LOGS.unshift(mockLog); // Add to beginning of mock logs
      console.log(`[Audit Log Saved to Memory] ${email} - ${action} on ${targetComponent}`);
    }
  } catch (err) {
    console.error('Audit logger failed:', err.message);
  }
};
