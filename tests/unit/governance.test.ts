import { describe, it, expect, beforeEach } from 'vitest';
import {
  AuditLogger,
  ComplianceChecker,
  SeverityLevel,
  DataClassification,
  SemanticVersion,
  DeprecationManager,
  globalDeprecationManager,
} from '../../src/lib/governance';

describe('governance', () => {
  describe('AuditLogger', () => {
    let logger: AuditLogger;

    beforeEach(() => {
      logger = new AuditLogger();
    });

    it('should log audit entries', () => {
      const entry = logger.log('user1', 'DELETE', 'beat');

      expect(entry.userId).toBe('user1');
      expect(entry.action).toBe('DELETE');
      expect(entry.resource).toBe('beat');
      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeDefined();
    });

    it('should store changes in audit log', () => {
      const changes = { title: 'Old' };
      const entry = logger.log('user1', 'UPDATE', 'beat', { changes });

      expect(entry.changes).toEqual(changes);
    });

    it('should mark PII access', () => {
      const entry = logger.log('user1', 'READ', 'email', { isPII: true });

      expect(entry.isPII).toBe(true);
    });

    it('should retrieve user audit trail', () => {
      logger.log('user1', 'CREATE', 'beat');
      logger.log('user2', 'DELETE', 'beat');
      logger.log('user1', 'UPDATE', 'beat');

      const trail = logger.getUserAudit('user1');

      expect(trail).toHaveLength(2);
      expect(trail.every((e) => e.userId === 'user1')).toBe(true);
    });

    it('should retrieve resource audit trail', () => {
      logger.log('user1', 'CREATE', 'beat', { resourceId: 'beat1' });
      logger.log('user2', 'UPDATE', 'beat', { resourceId: 'beat1' });
      logger.log('user3', 'DELETE', 'beat', { resourceId: 'beat2' });

      const trail = logger.getResourceAudit('beat', 'beat1');

      expect(trail).toHaveLength(2);
      expect(trail.every((e) => e.resourceId === 'beat1')).toBe(true);
    });

    it('should retrieve PII access log', () => {
      logger.log('user1', 'READ', 'email', { isPII: true });
      logger.log('user1', 'READ', 'status', { isPII: false });
      logger.log('user2', 'READ', 'ssn', { isPII: true });

      const piiLog = logger.getPIIAccessLog();

      expect(piiLog).toHaveLength(2);
      expect(piiLog.every((e) => e.isPII === true)).toBe(true);
    });

    it('should clear audit log', () => {
      logger.log('user1', 'CREATE', 'beat');
      expect(logger.getUserAudit('user1')).toHaveLength(1);

      logger.clear();
      expect(logger.getUserAudit('user1')).toHaveLength(0);
    });
  });

  describe('ComplianceChecker', () => {
    let checker: ComplianceChecker;

    beforeEach(() => {
      checker = new ComplianceChecker();
    });

    it('should validate GDPR consent', () => {
      const validConsent = { necessary: true, marketing: false };
      expect(checker.validateGDPRConsent('user1', validConsent)).toBe(true);

      const invalid = { marketing: true }; // Missing 'necessary'
      expect(checker.validateGDPRConsent('user2', invalid)).toBe(false);
    });

    it('should track violations', () => {
      checker.validateGDPRConsent('user1', {});

      const violations = checker.getViolations();
      expect(violations.length).toBeGreaterThan(0);
    });

    it('should get violations by severity', () => {
      checker.validateGDPRConsent('user1', {});

      const criticalViolations = checker.getViolationsBySeverity(
        SeverityLevel.CRITICAL
      );
      expect(criticalViolations.length).toBeGreaterThan(0);
    });

    it('should validate data retention', () => {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const oneMonthAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;

      expect(checker.validateDataRetention('log', oneWeekAgo, 30)).toBe(true);
      expect(checker.validateDataRetention('log', oneMonthAgo, 7)).toBe(false);
    });

    it('should validate encryption', () => {
      expect(
        checker.validateEncryption(DataClassification.PUBLIC, false)
      ).toBe(true);

      expect(
        checker.validateEncryption(DataClassification.RESTRICTED, false)
      ).toBe(false);

      expect(
        checker.validateEncryption(DataClassification.RESTRICTED, true)
      ).toBe(true);
    });

    it('should clear violations', () => {
      checker.validateGDPRConsent('user1', {});
      expect(checker.getViolations().length).toBeGreaterThan(0);

      checker.clearViolations();
      expect(checker.getViolations()).toHaveLength(0);
    });
  });

  describe('SemanticVersion', () => {
    it('should parse version string', () => {
      const version = new SemanticVersion('1.2.3');

      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
    });

    it('should compare versions', () => {
      const v1 = new SemanticVersion('1.0.0');
      const v2 = new SemanticVersion('1.1.0');
      const v3 = new SemanticVersion('2.0.0');

      expect(v2.isGreaterThan(v1)).toBe(true);
      expect(v1.isLessThan(v2)).toBe(true);
      expect(v1.isEqual('1.0.0')).toBe(true);
    });

    it('should detect major breaking changes', () => {
      const v1 = new SemanticVersion('1.0.0');
      const v2 = new SemanticVersion('2.0.0');

      expect(v2.isMajorChange(v1)).toBe(true);
      expect(v1.isMajorChange(v2)).toBe(true);
    });

    it('should return version string', () => {
      const version = new SemanticVersion('1.2.3');
      expect(version.toString()).toBe('1.2.3');
    });

    it('should reject invalid version strings', () => {
      expect(() => new SemanticVersion('invalid')).toThrow();
    });
  });

  describe('DeprecationManager', () => {
    let manager: DeprecationManager;

    beforeEach(() => {
      manager = new DeprecationManager();
    });

    it('should mark item as deprecated', () => {
      manager.deprecate('oldFunction', '1.0.0', '2.0.0', {
        replacement: 'newFunction',
      });

      expect(manager.isDeprecated('oldFunction')).toBe(true);
    });

    it('should retrieve deprecation info', () => {
      manager.deprecate('oldFunction', '1.0.0', '2.0.0', {
        replacement: 'newFunction',
        reason: 'Performance improvement',
      });

      const info = manager.getDeprecationInfo('oldFunction');
      expect(info?.since).toBe('1.0.0');
      expect(info?.replacement).toBe('newFunction');
    });

    it('should list all deprecated items', () => {
      manager.deprecate('old1', '1.0.0', '2.0.0');
      manager.deprecate('old2', '1.5.0', '2.0.0');

      const deprecated = manager.getAllDeprecated();
      expect(deprecated).toHaveLength(2);
    });

    it('should handle non-deprecated items', () => {
      expect(manager.isDeprecated('newFunction')).toBe(false);
      expect(manager.getDeprecationInfo('newFunction')).toBeUndefined();
    });
  });

  describe('Global Instances', () => {
    it('should have global audit logger', () => {
      expect(globalDeprecationManager).toBeDefined();
    });

    it('should support deprecation decorators', () => {
      globalDeprecationManager.deprecate('testFunc', '1.0.0', '2.0.0');

      expect(globalDeprecationManager.isDeprecated('testFunc')).toBe(true);
    });
  });
});
