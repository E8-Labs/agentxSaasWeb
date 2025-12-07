---
Document: Phase 6 - Vendor Management & Documentation
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Phase 6: Vendor Management & Documentation

[← Back to Index](../index.md) | [Implementation Plan](../IMPLEMENTATION-PLAN.md)

## Context

HIPAA requires Business Associate Agreements (BAAs) with all vendors handling PHI (164.308(b)(1)), and SOC-2 requires documented security policies and procedures. This phase focuses on obtaining necessary vendor agreements and creating comprehensive security documentation.

## Prerequisites

- [ ] Phases 1-5 completed (technical controls implemented)
- [ ] Legal team available for BAA review
- [ ] Executive approval for policy documents
- [ ] List of all third-party vendors

## References

- [Architecture Document](../ARCHITECTURE.md)
- HIPAA 164.308(b)(1) - Business Associate Contracts
- SOC-2 CC1.1-CC1.5 - Control Environment

---

## What to Implement

### Task 1: Vendor Inventory & Assessment

- [ ] Create complete vendor inventory
- [ ] Classify vendors by data access level
- [ ] Assess vendor security certifications
- [ ] Document data flows to vendors

### Task 2: Business Associate Agreements

- [ ] Identify vendors requiring BAAs
- [ ] Request BAAs from each vendor
- [ ] Review BAAs with legal
- [ ] Execute and store BAAs

### Task 3: Security Policies

- [ ] Create Information Security Policy
- [ ] Create Access Control Policy
- [ ] Create Data Classification Policy
- [ ] Create Incident Response Policy
- [ ] Create Acceptable Use Policy

### Task 4: Procedures & Runbooks

- [ ] Create user provisioning procedure
- [ ] Create offboarding procedure
- [ ] Create incident response runbook
- [ ] Create key rotation runbook
- [ ] Create backup restoration runbook

### Task 5: Security Training

- [ ] Select training platform
- [ ] Create training curriculum
- [ ] Set up training tracking
- [ ] Schedule initial training

---

## Implementation Steps

### Step 1: Vendor Inventory

**Create**: `docs/security/vendor-inventory.md`

```markdown
# Vendor Inventory

Last Updated: [DATE]
Reviewed By: [NAME]

## Overview

This document maintains a complete inventory of all third-party vendors
with access to AssignX systems or data.

## Vendor Classification

| Level | Description | BAA Required |
|-------|-------------|--------------|
| Critical | Direct PHI/PII access | Yes |
| High | Indirect data access (logs, errors) | Yes |
| Medium | Infrastructure access only | No |
| Low | No data access | No |

## Vendor List

### Critical Vendors (PHI/PII Access)

#### Twilio
- **Service**: SMS verification, voice calls
- **Data Access**: Phone numbers, call recordings (may contain PHI)
- **Classification**: Critical
- **BAA Status**: [Pending/Signed]
- **BAA Date**: [DATE]
- **Certifications**: SOC 2 Type II, HIPAA compliant
- **Contact**: [Contact info]
- **Review Date**: [Annual review date]

#### Vapi
- **Service**: AI voice calling
- **Data Access**: Voice conversations (may contain PHI)
- **Classification**: Critical
- **BAA Status**: [Pending/Signed]
- **BAA Date**: [DATE]
- **Certifications**: [List certifications]
- **Contact**: [Contact info]
- **Review Date**: [Annual review date]

#### GHL/Lead Connector
- **Service**: CRM integration
- **Data Access**: Customer data, lead information
- **Classification**: Critical
- **BAA Status**: [Pending/Signed]
- **BAA Date**: [DATE]
- **Certifications**: [List certifications]
- **Contact**: [Contact info]
- **Review Date**: [Annual review date]

### High Vendors (Indirect Data Access)

#### Sentry
- **Service**: Error tracking, session replay
- **Data Access**: Error messages (may contain user data), session recordings
- **Classification**: High
- **BAA Status**: [Pending/Signed]
- **BAA Date**: [DATE]
- **Certifications**: SOC 2 Type II
- **Contact**: [Contact info]
- **Data Scrubbing**: [Configured/Not configured]

#### Log Aggregation Service (Datadog/Splunk)
- **Service**: Log storage and analysis
- **Data Access**: Application logs (sanitized)
- **Classification**: High
- **BAA Status**: [Pending/Signed]
- **BAA Date**: [DATE]
- **Certifications**: [List certifications]
- **Contact**: [Contact info]

### Medium Vendors (Infrastructure)

#### Hosting Provider (Vercel/AWS)
- **Service**: Application hosting
- **Data Access**: All application data (encrypted at rest)
- **Classification**: Critical
- **BAA Status**: [Pending/Signed]
- **BAA Date**: [DATE]
- **Certifications**: SOC 2, ISO 27001, HIPAA eligible
- **Contact**: [Contact info]

#### Stripe
- **Service**: Payment processing
- **Data Access**: Payment data (PCI DSS scope)
- **Classification**: Medium (no PHI)
- **BAA Status**: Not required (no PHI)
- **Certifications**: PCI DSS Level 1
- **Contact**: [Contact info]

### Low Vendors (No Data Access)

#### Google (OAuth)
- **Service**: Authentication only
- **Data Access**: None (authentication tokens only)
- **Classification**: Low
- **BAA Status**: Not required
- **Certifications**: SOC 2, ISO 27001
- **Contact**: [Contact info]

## Data Flow Diagram

[Include diagram showing data flow between vendors]

## Vendor Security Assessment Checklist

When onboarding a new vendor:

- [ ] Complete vendor security questionnaire
- [ ] Review SOC 2 report (if available)
- [ ] Verify data handling practices
- [ ] Determine BAA requirement
- [ ] Execute BAA if required
- [ ] Configure data minimization
- [ ] Document in vendor inventory
- [ ] Schedule annual review
```

---

### Step 2: BAA Request Templates

**Create**: `docs/security/baa-request-template.md`

```markdown
# Business Associate Agreement Request

## Email Template

Subject: Business Associate Agreement Request - [Company Name]

Dear [Vendor Contact],

[Company Name] uses [Vendor Name] services as part of our healthcare-related
operations. As a covered entity under HIPAA, we are required to have Business
Associate Agreements (BAAs) with all service providers who may have access to
Protected Health Information (PHI).

We are requesting the following:

1. A copy of your standard Business Associate Agreement
2. Your most recent SOC 2 Type II report
3. Documentation of your HIPAA compliance program
4. Your data security and privacy policies

Our legal team will review your BAA and may request modifications to ensure
compliance with our requirements.

Please provide these documents at your earliest convenience. If you have any
questions about this request, please contact us.

Thank you for your attention to this matter.

Best regards,
[Your Name]
[Title]
[Company Name]

---

## BAA Review Checklist

When reviewing a vendor's BAA, verify:

- [ ] Clearly defines PHI and permitted uses
- [ ] Requires appropriate safeguards
- [ ] Requires breach notification (within 24-48 hours)
- [ ] Allows audit rights
- [ ] Requires subcontractor compliance
- [ ] Specifies data return/destruction on termination
- [ ] Includes indemnification provisions
- [ ] Specifies term and termination conditions
- [ ] Compliant with HIPAA requirements

## Required BAA Provisions (per HIPAA)

1. **Permitted Uses**: Specify how PHI may be used and disclosed
2. **Safeguards**: Require appropriate safeguards to prevent unauthorized use
3. **Reporting**: Require reporting of unauthorized uses or disclosures
4. **Subcontractors**: Require compliance from subcontractors
5. **Access**: Provide individual access to PHI
6. **Amendments**: Accommodate amendments to PHI
7. **Accounting**: Provide accounting of disclosures
8. **Compliance**: Make practices available for compliance review
9. **Termination**: Return or destroy PHI on termination
```

---

### Step 3: Security Policies

**Create**: `docs/security/policies/information-security-policy.md`

```markdown
# Information Security Policy

**Document Version**: 1.0
**Effective Date**: [DATE]
**Last Review**: [DATE]
**Next Review**: [DATE + 1 year]
**Approved By**: [Executive Name, Title]

## 1. Purpose

This policy establishes the framework for protecting information assets
and ensuring the confidentiality, integrity, and availability of data
at [Company Name].

## 2. Scope

This policy applies to:
- All employees, contractors, and third parties
- All information systems and data
- All facilities housing information systems

## 3. Policy Statement

[Company Name] is committed to protecting information assets from all
threats, whether internal or external, deliberate or accidental.

### 3.1 Information Classification

All information must be classified according to sensitivity:

| Classification | Description | Examples |
|---------------|-------------|----------|
| PHI | Protected Health Information | Medical records, diagnoses |
| PII | Personally Identifiable Information | SSN, DOB, financial data |
| Confidential | Business sensitive | API keys, internal reports |
| Internal | For internal use | Business metrics |
| Public | No restrictions | Marketing content |

### 3.2 Access Control

- Access granted on least-privilege basis
- All access requests require manager approval
- Access reviewed quarterly
- Terminated users removed within 24 hours

### 3.3 Data Protection

- PHI and PII encrypted at rest and in transit
- Encryption keys managed via approved KMS
- Key rotation every 90 days
- No PHI in development/test environments

### 3.4 Authentication

- Multi-factor authentication required for all users
- Session timeout after 15 minutes inactivity
- Password complexity requirements enforced
- Account lockout after 5 failed attempts

### 3.5 Audit Logging

- All system access logged
- All PHI access logged with user context
- Logs retained for 7 years
- Log integrity verified monthly

### 3.6 Incident Response

- Security incidents reported immediately
- Incident response plan activated within 1 hour
- Breach notification within 24 hours to security team
- External notification per HIPAA requirements

## 4. Roles and Responsibilities

### Security Officer
- Oversee security program
- Review and update policies
- Lead incident response
- Conduct risk assessments

### Managers
- Ensure team compliance
- Approve access requests
- Report security concerns
- Support security training

### All Users
- Follow security policies
- Complete security training
- Report incidents
- Protect credentials

## 5. Compliance

Violations of this policy may result in disciplinary action up to
and including termination.

## 6. Related Documents

- Access Control Policy
- Data Classification Policy
- Incident Response Plan
- Acceptable Use Policy

## 7. Review and Updates

This policy is reviewed annually and updated as needed.
```

**Create**: `docs/security/policies/incident-response-policy.md`

```markdown
# Incident Response Policy

**Document Version**: 1.0
**Effective Date**: [DATE]
**Last Review**: [DATE]
**Approved By**: [Executive Name, Title]

## 1. Purpose

This policy establishes procedures for identifying, responding to,
and recovering from security incidents.

## 2. Scope

This policy covers all security incidents affecting [Company Name]
systems, data, or personnel.

## 3. Incident Classification

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| Critical | Active breach, data exposure | Immediate | Ransomware, PHI breach |
| High | Potential breach, vulnerability | < 1 hour | Unauthorized access attempt |
| Medium | Security concern, anomaly | < 4 hours | Suspicious activity |
| Low | Minor security issue | < 24 hours | Policy violation |

### Incident Types

- **Data Breach**: Unauthorized access to PHI/PII
- **Malware**: Virus, ransomware, trojan infection
- **Unauthorized Access**: Intrusion or access violation
- **Denial of Service**: System availability impact
- **Insider Threat**: Malicious employee activity
- **Physical Security**: Facility security breach

## 4. Incident Response Phases

### Phase 1: Detection & Identification

1. Monitor security alerts and logs
2. Receive incident reports
3. Validate incident is genuine
4. Classify severity and type
5. Document initial findings

### Phase 2: Containment

1. Isolate affected systems
2. Preserve evidence
3. Block attack vectors
4. Prevent further damage
5. Document containment actions

### Phase 3: Eradication

1. Remove malware/threats
2. Patch vulnerabilities
3. Reset compromised credentials
4. Verify threat removal
5. Document eradication steps

### Phase 4: Recovery

1. Restore systems from backups
2. Verify system integrity
3. Monitor for recurrence
4. Return to normal operations
5. Document recovery process

### Phase 5: Post-Incident

1. Conduct root cause analysis
2. Update security controls
3. Revise policies if needed
4. Complete incident report
5. Brief stakeholders

## 5. Notification Requirements

### Internal Notification

| Audience | Timeframe | Method |
|----------|-----------|--------|
| Security Team | Immediate | Slack, Phone |
| Executive Team | < 1 hour | Email, Phone |
| Affected Teams | < 4 hours | Email |
| All Staff | < 24 hours | Email |

### External Notification (HIPAA Breach)

| Audience | Timeframe | Method |
|----------|-----------|--------|
| Affected Individuals | < 60 days | Written notice |
| HHS | < 60 days (>500) | HHS portal |
| Media | < 60 days (>500) | Press release |

## 6. Incident Response Team

### Team Composition

- **Incident Commander**: [Title/Name]
- **Security Lead**: [Title/Name]
- **Technical Lead**: [Title/Name]
- **Communications Lead**: [Title/Name]
- **Legal Counsel**: [Title/Name]

### Contact Information

| Role | Primary | Backup | Phone | Email |
|------|---------|--------|-------|-------|
| Incident Commander | [Name] | [Name] | [Phone] | [Email] |
| ... | ... | ... | ... | ... |

## 7. Incident Documentation

All incidents must be documented with:

- Date/time of detection
- Date/time of occurrence
- Description of incident
- Affected systems/data
- Response actions taken
- Timeline of events
- Root cause analysis
- Remediation steps
- Lessons learned

## 8. Testing

Incident response procedures are tested:
- Annually through tabletop exercises
- As needed through actual incidents
- Following significant system changes

## 9. Related Documents

- Information Security Policy
- Business Continuity Plan
- Breach Notification Procedures
```

---

### Step 4: Training Program

**Create**: `docs/security/training/curriculum.md`

```markdown
# Security Awareness Training Curriculum

## Overview

All employees must complete security awareness training within 30 days
of hire and annually thereafter.

## Required Training Modules

### Module 1: Security Fundamentals
**Duration**: 30 minutes
**Topics**:
- Information security basics
- Company security policies
- Role-based responsibilities
- Reporting security concerns

### Module 2: HIPAA Compliance
**Duration**: 45 minutes
**Topics**:
- What is HIPAA
- Protected Health Information (PHI)
- Permitted uses and disclosures
- Patient rights
- Breach notification

### Module 3: Data Protection
**Duration**: 30 minutes
**Topics**:
- Data classification
- Handling sensitive data
- Encryption requirements
- Secure data disposal

### Module 4: Access Control
**Duration**: 20 minutes
**Topics**:
- Password security
- Multi-factor authentication
- Access request process
- Principle of least privilege

### Module 5: Phishing & Social Engineering
**Duration**: 30 minutes
**Topics**:
- Recognizing phishing
- Reporting suspicious emails
- Social engineering tactics
- Verification procedures

### Module 6: Incident Response
**Duration**: 20 minutes
**Topics**:
- What is a security incident
- How to report incidents
- Your role in incident response
- Post-incident procedures

## Role-Specific Training

### Developers
- Secure coding practices
- OWASP Top 10
- Code review security
- Secrets management

### Administrators
- System hardening
- Access management
- Log monitoring
- Incident handling

### Managers
- Policy enforcement
- Access approval
- Team compliance
- Risk assessment

## Training Tracking

| Employee | Hire Date | Initial Training | Last Annual | Next Due |
|----------|-----------|------------------|-------------|----------|
| [Name] | [Date] | [Date] | [Date] | [Date] |

## Training Completion Requirements

- Initial training: Within 30 days of hire
- Annual refresher: Within 12 months of previous
- Role changes: Within 30 days of role change
- Policy updates: Within 30 days of notification

## Training Documentation

Maintain records of:
- Training completion dates
- Assessment scores
- Acknowledgment forms
- Exemption approvals
```

---

### Step 5: Compliance Checklist

**Create**: `docs/security/compliance-checklist.md`

```markdown
# Compliance Readiness Checklist

## HIPAA Security Rule

### Administrative Safeguards (§164.308)

- [ ] Risk Analysis conducted (164.308(a)(1))
- [ ] Risk Management plan implemented (164.308(a)(1))
- [ ] Sanction policy in place (164.308(a)(1))
- [ ] Information system activity review (164.308(a)(1))
- [ ] Security Officer designated (164.308(a)(2))
- [ ] Workforce security procedures (164.308(a)(3))
- [ ] Information access management (164.308(a)(4))
- [ ] Security awareness training (164.308(a)(5))
- [ ] Security incident procedures (164.308(a)(6))
- [ ] Contingency plan (164.308(a)(7))
- [ ] Evaluation procedures (164.308(a)(8))
- [ ] Business Associate Agreements (164.308(b)(1))

### Physical Safeguards (§164.310)

- [ ] Facility access controls (164.310(a))
- [ ] Workstation use policy (164.310(b))
- [ ] Workstation security (164.310(c))
- [ ] Device and media controls (164.310(d))

### Technical Safeguards (§164.312)

- [ ] Access control (164.312(a))
  - [ ] Unique user identification
  - [ ] Emergency access procedure
  - [ ] Automatic logoff
  - [ ] Encryption and decryption
- [ ] Audit controls (164.312(b))
- [ ] Integrity controls (164.312(c))
- [ ] Person authentication (164.312(d))
- [ ] Transmission security (164.312(e))

## SOC 2 Trust Service Criteria

### Security (CC)

- [ ] CC1: Control Environment
- [ ] CC2: Communication and Information
- [ ] CC3: Risk Assessment
- [ ] CC4: Monitoring Activities
- [ ] CC5: Control Activities
- [ ] CC6: Logical and Physical Access
- [ ] CC7: System Operations
- [ ] CC8: Change Management
- [ ] CC9: Risk Mitigation

### Availability (A)

- [ ] A1.1: Availability commitments
- [ ] A1.2: System monitoring
- [ ] A1.3: Recovery procedures

### Confidentiality (C)

- [ ] C1.1: Confidentiality commitments
- [ ] C1.2: Confidentiality procedures

## Documentation Checklist

- [ ] Information Security Policy
- [ ] Access Control Policy
- [ ] Data Classification Policy
- [ ] Incident Response Plan
- [ ] Business Continuity Plan
- [ ] Acceptable Use Policy
- [ ] Vendor Management Policy
- [ ] Change Management Policy
- [ ] Encryption Policy

## Vendor BAA Status

| Vendor | BAA Required | Status | Date |
|--------|--------------|--------|------|
| Twilio | Yes | [Status] | [Date] |
| Vapi | Yes | [Status] | [Date] |
| GHL | Yes | [Status] | [Date] |
| Sentry | Yes | [Status] | [Date] |
| Hosting | Yes | [Status] | [Date] |

## Training Status

- [ ] All employees completed initial training
- [ ] Annual training up to date
- [ ] Training records maintained
- [ ] Training acknowledgments on file
```

---

## Success Criteria

- [ ] Complete vendor inventory documented
- [ ] All critical/high vendors have signed BAAs
- [ ] Information Security Policy approved
- [ ] Access Control Policy approved
- [ ] Incident Response Policy approved
- [ ] Data Classification Policy approved
- [ ] All procedures documented
- [ ] Training program established
- [ ] All employees completed HIPAA training
- [ ] Compliance checklist 100% complete

## Troubleshooting

### Issue: Vendor won't sign BAA

**Solution**:
1. Escalate to vendor's compliance team
2. Document attempts to obtain BAA
3. Evaluate alternative vendors
4. Assess if vendor can be removed from PHI flow

### Issue: Policy conflicts with business needs

**Solution**:
1. Document business requirement
2. Conduct risk assessment
3. Propose compensating controls
4. Get executive approval for exception

---

## Next Steps

After completing Phase 6:
1. Verify all success criteria are met
2. Update [Implementation Status](../implementation-status.md)
3. Schedule internal security assessment
4. Prepare for third-party audit

---

## Related Documents

- [Index](../index.md)
- [Implementation Plan](../IMPLEMENTATION-PLAN.md)
- [Phase 5](./phase-5-api-security.md)
- [Compliance Checklist](/hipaa-soc2-compliance-checklist.md)
