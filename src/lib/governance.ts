/**
 * Governance & compliance utilities
 * Enforce policies, track compliance, audit logging
 *
 * @module lib/governance
 */

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  isPII?: boolean;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Severity level for events
 */
export enum SeverityLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Data classification
 */
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

/**
 * Audit logger for compliance tracking
 */
export class AuditLogger {
  private entries: AuditLogEntry[] = [];
  private maxEntries: number = 10000;

  /**
   * Log an audit event
   */
  log(
    userId: string,
    action: string,
    resource: string,
    options?: {
      resourceId?: string;
      changes?: Record<string, any>;
      isPII?: boolean;
      ipAddress?: string;
      userAgent?: string;
    }
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random()}`,
      userId,
      action,
      resource,
      resourceId: options?.resourceId,
      changes: options?.changes,
      isPII: options?.isPII || false,
      timestamp: Date.now(),
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    };

    this.entries.push(entry);

    // Keep only recent entries
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    return entry;
  }

  /**
   * Get audit entries for a user
   */
  getUserAudit(userId: string): AuditLogEntry[] {
    return this.entries.filter((e) => e.userId === userId);
  }

  /**
   * Get audit entries for a resource
   */
  getResourceAudit(resource: string, resourceId?: string): AuditLogEntry[] {
    return this.entries.filter(
      (e) =>
        e.resource === resource &&
        (!resourceId || e.resourceId === resourceId)
    );
  }

  /**
   * Get all PII-related audit entries
   */
  getPIIAccessLog(): AuditLogEntry[] {
    return this.entries.filter((e) => e.isPII === true);
  }

  /**
   * Clear audit log  (usually not allowed in production)
   */
  clear(): void {
    this.entries = [];
  }
}

/**
 * Global audit logger instance
 */
export const globalAuditLogger = new AuditLogger();

/**
 * Compliance checker
 */
export class ComplianceChecker {
  private violations: Array<{
    policy: string;
    severity: SeverityLevel;
    message: string;
    timestamp: number;
  }> = [];

  /**
   * Check GDPR consent
   */
  validateGDPRConsent(userId: string, consentData: any): boolean {
    const required = ['necessary'];
    const hasRequired = required.every((key) => key in consentData);

    if (!hasRequired) {
      this.violations.push({
        policy: 'GDPR_CONSENT',
        severity: SeverityLevel.CRITICAL,
        message: `User ${userId} missing required consent fields`,
        timestamp: Date.now(),
      });
      return false;
    }

    return true;
  }

  /**
   * Check PII access - should be logged for compliance
   */
  logPIIAccess(
    userId: string,
    piiType: string,
    accessed: boolean = true
  ): void {
    if (accessed) {
      globalAuditLogger.log(userId, 'PII_ACCESS', piiType, {
        isPII: true,
      });
    }
  }

  /**
   * Check data retention
   */
  validateDataRetention(
    _dataType: string,
    createdAt: number,
    maxAgeDays: number
  ): boolean {
    const ageMs = Date.now() - createdAt;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    if (ageDays > maxAgeDays) {
      return false; // Data should be deleted
    }

    return true;
  }

  /**
   * Check encryption for sensitive data
   */
  validateEncryption(
    dataClassification: DataClassification,
    isEncrypted: boolean
  ): boolean {
    // Restricted and Confidential must be encrypted
    const requiresEncryption = [
      DataClassification.RESTRICTED,
      DataClassification.CONFIDENTIAL,
    ];

    if (requiresEncryption.includes(dataClassification) && !isEncrypted) {
      this.violations.push({
        policy: 'ENCRYPTION_REQUIRED',
        severity: SeverityLevel.CRITICAL,
        message: `Data classified as ${dataClassification} must be encrypted`,
        timestamp: Date.now(),
      });
      return false;
    }

    return true;
  }

  /**
   * Get all violations
   */
  getViolations() {
    return [...this.violations];
  }

  /**
   * Get violations by severity
   */
  getViolationsBySeverity(severity: SeverityLevel) {
    return this.violations.filter((v) => v.severity === severity);
  }

  /**
   * Clear violations
   */
  clearViolations(): void {
    this.violations = [];
  }
}

/**
 * Global compliance checker instance
 */
export const globalComplianceChecker = new ComplianceChecker();

/**
 * Version semver comparator
 */
export class SemanticVersion {
  major: number;
  minor: number;
  patch: number;

  constructor(version: string) {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!match) {
      throw new Error(`Invalid version format: ${version}`);
    }

    this.major = parseInt(match[1], 10);
    this.minor = parseInt(match[2], 10);
    this.patch = parseInt(match[3], 10);
  }

  /**
   * Get version string
   */
  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  /**
   * Check if this version is greater than another
   */
  isGreaterThan(other: SemanticVersion | string): boolean {
    const v = typeof other === 'string' ? new SemanticVersion(other) : other;

    if (this.major !== v.major) return this.major > v.major;
    if (this.minor !== v.minor) return this.minor > v.minor;
    return this.patch > v.patch;
  }

  /**
   * Check if this version is less than another
   */
  isLessThan(other: SemanticVersion | string): boolean {
    return !this.isGreaterThan(other) && this.toString() !== (
      typeof other === 'string' ? other : other.toString()
    );
  }

  /**
   * Check if this version is equal to another
   */
  isEqual(other: SemanticVersion | string): boolean {
    const v = typeof other === 'string' ? new SemanticVersion(other) : other;
    return (
      this.major === v.major &&
      this.minor === v.minor &&
      this.patch === v.patch
    );
  }

  /**
   * Check if version is major breaking change
   */
  isMajorChange(other: SemanticVersion | string): boolean {
    const v = typeof other === 'string' ? new SemanticVersion(other) : other;
    return this.major !== v.major;
  }
}

/**
 * Deprecation manager
 */
export class DeprecationManager {
  private deprecated = new Map<
    string,
    {
      since: string;
      willRemoveIn: string;
      replacement?: string;
      reason?: string;
    }
  >();

  /**
   * Mark function as deprecated
   */
  deprecate(
    name: string,
    since: string,
    willRemoveIn: string,
    options?: {
      replacement?: string;
      reason?: string;
    }
  ): void {
    this.deprecated.set(name, {
      since,
      willRemoveIn,
      replacement: options?.replacement,
      reason: options?.reason,
    });
  }

  /**
   * Check if item is deprecated
   */
  isDeprecated(name: string): boolean {
    return this.deprecated.has(name);
  }

  /**
   * Get deprecation info
   */
  getDeprecationInfo(name: string) {
    return this.deprecated.get(name);
  }

  /**
   * Get all deprecated items
   */
  getAllDeprecated() {
    return Array.from(this.deprecated.entries());
  }
}

/**
 * Global deprecation manager
 */
export const globalDeprecationManager = new DeprecationManager();

/**
 * Wrapper to mark function as deprecated
 */
export function deprecated(
  _target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const info = globalDeprecationManager.getDeprecationInfo(propertyKey);

  if (!info) return descriptor;

  const originalMethod = descriptor.value as (...args: any[]) => any;

  descriptor.value = function (...args: any[]) {
    const message = `${propertyKey} is deprecated since ${info.since}` +
      (info.replacement ? ` - use ${info.replacement} instead` : '') +
      (info.reason ? ` (${info.reason})` : '');

    console.warn(`DEPRECATION: ${message}`);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

export default {
  AuditLogger,
  globalAuditLogger,
  ComplianceChecker,
  globalComplianceChecker,
  SeverityLevel,
  DataClassification,
  SemanticVersion,
  DeprecationManager,
  globalDeprecationManager,
  deprecated,
};
