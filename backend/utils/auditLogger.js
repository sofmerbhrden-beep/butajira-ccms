import AuditLog from "../models/AuditLog.js";

/**
 * Logs an action to the AuditLog collection.
 * 
 * @param { Object } req - The Express request object to extract IP and User
  * @param { String } action - The action taking place(e.g., "CERTIFICATE_GENERATED")
    * @param { String } targetResource - The type of resource being affected(e.g., "Application")
      * @param { String } targetId - The ID of the specific resource(e.g., appId)
        * @param { Object } details - Any additional metadata or changes
          */
export const logAudit = async (req, action, targetResource, targetId, details = {}) => {
  try {
    if (!req.user) return; // Cannot audit unauthenticated actions effectively here

    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await AuditLog.create({
      action,
      actor: req.user._id,
      actorName: req.user.fullName || req.user.username,
      actorRole: req.user.role,
      targetResource,
      targetId,
      details,
      ipAddress
    });
  } catch (error) {
    console.error("Failed to write to AuditLog:", error);
  }
};
