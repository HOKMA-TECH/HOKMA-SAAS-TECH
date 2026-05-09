# HOKMA Etapa 3.5 - Threat Model + LGPD Baseline

## Threat Model (initial)

### Sensitive assets
- Customer personal data
- Private documents and generated signed URLs
- Memberships, roles, and tenant boundaries
- Exported reports
- Authentication sessions and MFA factors

### Threats and current mitigations
- Cross-tenant access -> RLS + membership checks + tenant-scoped cache keys
- Privilege escalation -> capability matrix + backend RPC guards + MFA for critical capabilities
- Signed URL leakage -> temporary URLs + private storage + audit trail
- Legacy session misuse -> runtime checks for membership status + cache invalidation on tenant/user changes
- UI-only authorization gap -> backend enforcement remains mandatory

### Residual risk
- Operational misconfiguration of storage policies
- Missing alerting pipeline for suspicious audit events

## LGPD Baseline Checklist (initial)

- Personal data categories inventoried (initial)
- Sensitive document classes identified (initial)
- Least privilege model established via capabilities
- Tenant data segregation enforced in backend and frontend cache
- Audit events for document/export/role-sensitive actions planned and expanded
- Retention and disposal policy documented as initial baseline
- Incident response minimum protocol documented
- Export/download guidance defined for privileged roles
