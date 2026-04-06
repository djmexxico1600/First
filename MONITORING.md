# Monitoring & Observability Guide

## Overview

World-class observability is critical for production applications. This guide covers the monitoring infrastructure for the DJMEXXICO platform.

## Components

### 1. Health Checks

**Endpoint**: `GET /api/health`

Provides real-time application status:
- Framework health (Next.js running)
- Uptime metrics
- Environment information
- Version number

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-06T21:00:00.000Z",
    "uptime": 3600,
    "environment": "production",
    "version": "0.1.0"
  }
}
```

**Monitor this endpoint every 30 seconds** to detect downtime immediately.

### 2. Structured Logging

All requests and events are logged with:
- **Timestamp**: ISO 8601 format
- **Level**: debug, info, warn, error
- **Message**: Descriptive text
- **Context**: Key-value pairs (user ID, handler, etc.)
- **Request ID**: Unique trace ID
- **Error Stack**: For error logs

**Log Forwarding**:
- Set `NEXT_PUBLIC_LOG_ENDPOINT` to forward logs to external service
- Logs sent asynchronously (non-blocking)
- Failures silently ignored (don't disrupt app)

**Example External Log Service Setup**:
```bash
export NEXT_PUBLIC_LOG_ENDPOINT="https://logs.example.com/api/logs"
```

### 3. Request Tracing

Every API request gets unique ID: `X-Request-ID`

**Trace ID Format**: `1712425200000-a1b2c3d4e`

**Usage**:
- Track request through all services
- Link logs and errors to specific request
- Measure end-to-end latency
- Debug distributed issues

**Example Flow**:
```
Browser → API (GET /api/beats) 
  X-Request-ID: 1712425200000-abc123 ← generated
    ├─ Logger.logApiRequest() 
    ├─ Database query
    ├─ Stripe API call
    └─ Logger.logApiResponse()  
  X-Request-ID header returned
```

### 4. Performance Metrics

Log timing for:
- **API requests**: Total request-response time
- **Database operations**: Query execution time  
- **External service calls**: Stripe, Clerk, Resend latency

**Captured in logger calls**:
```typescript
logger.logApiResponse(method, path, status, durationMs, requestId);
logger.logDatabaseOperation(operation, table, durationMs);
logger.logExternalService(service, method, status, durationMs);
```

### 5. Error Tracking

All errors captured with:
- **Error code**: Specific error identifier
- **Message**: Human-readable description  
- **Details**: Additional context (field, data, etc.)
- **Request ID**: Link to full request trace
- **Stack trace**: Full call stack for debugging

**Error Severity Levels**:
- `info`: Expected, handled gracefully (not found)
- `warning`: Unexpected but recoverable (unauthorized)
- `error`: Operational issue (payment failed)
- `critical`: System failure (database down)

### 6. Monitoring Alerts

Set up alerts for:

| Alert | Threshold | Action |
|-------|-----------|--------|
| Error Rate | > 1% of requests | Check logs immediately |
| API Response Time | > 2000ms (p95) | Investigate performance |
| Health Check Failure | Non-200 response | Page on-call engineer |
| Database Errors | > 5 per minute | Check database connectivity |
| Payment Failure Rate | > 5% of transactions | Notify customer support |
| High Memory Usage | > 80% | Scale instance |

### 7. Dashboard Setup

**Key Metrics to Display**:

```
┌──────────────────────────────────────────────┐
│  DJMEXXICO Platform - Operations Dashboard   │
├──────────────────────────────────────────────┤
│                                              │
│  Status: 🟢 HEALTHY  Uptime: 99.98%         │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  Requests/min: 2,450 ↑  Errors: 12 (0.5%)   │
│  API Latency: 245ms (p95)                    │
│  DB Latency: 50ms (p95)                      │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  Recent Errors (last hour):                  │
│  - PAYMENT_FAILED: 3                         │
│  - EXTERNAL_SERVICE_ERROR: 1                 │
│  - DATABASE_ERROR: 0                         │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  Top Endpoints:                              │
│  1. GET /api/beats        892 req/min (2%)   │
│  2. POST /api/checkout    156 req/min (3.2%) │
│  3. GET /dashboard        1204 req/min (4%)  │
│                                              │
└──────────────────────────────────────────────┘
```

## Implementation Checklist

### Week 1: Foundation
- [x] Health check endpoint
- [x] Structured logging
- [x] Request IDs in all responses
- [ ] External log storage setup
- [ ] Dashboard creation

### Week 2: Integration
- [ ] Error rate tracking
- [ ] Performance metric collection
- [ ] Alert configuration
- [ ] On-call rotation setup

### Week 3: Optimization
- [ ] Log aggregation
- [ ] Alerting rules tuning
- [ ] Dashboard customization
- [ ] Team training

## Best Practices

### 1. Log Everything Important

```typescript
logger.info('User subscribed', { userId, tier, amount }, requestId);
logger.error('Payment failed', error, { orderId, gateway }, requestId);
```

### 2. Include Request Context

Always chain request IDs through operations:
```typescript
async function checkoutBeat(beatId, requestId) {
  logger.logApiRequest('POST', '/checkout', requestId);
  const beat = await getDb().query(beatId, requestId);
  const session = await stripe.checkout(beat, requestId);
  logger.logApiResponse('POST', '/checkout', 200, duration, requestId);
}
```

### 3. Alert on Thresholds, Not Logs

Don't alert on every error. Instead:
- ✅ Alert when error rate > 1%
- ✅ Alert when specific service unreachable
- ❌ Don't alert on every 404
- ❌ Don't alert on user input validation failures

### 4. Use Trace IDs for Debugging

When user reports issue:
1. Ask for request ID (look in browser network tab headers)
2. Search logs for that request ID
3. Trace through all operations
4. Find root cause in seconds

### 5. Centralize External Dependencies

Keep all external service calls in one place:
```
/lib/stripe/     ← Stripe calls
/lib/clerk/      ← Clerk calls
/lib/r2/         ← Storage calls
```

This makes monitoring easy:
```
logger.logExternalService('Stripe', 'POST', status, duration);
logger.logExternalService('Clerk', 'GET', status, duration);
```

## Debugging With Logs

### Find All Requests for User

```bash
logs("context.userId = 'user_123'")
# Shows all API requests made by this user
# Check what operations they performed
```

### Find Slow API Calls

```bash
logs("durationMs > 2000")
# Shows requests slower than 2 seconds
# Identifies performance bottlenecks
```

### Find All Errors in a Session

```bash
logs("requestId = '1712425200000-abc123' AND level = 'error'")
# Shows all errors for one request
# Useful when user reports single issue
```

### Database Performance

```bash
logs("message like 'Database:%' AND durationMs > 100")
# Shows slow database queries
# Identify which queries need optimization
```

## Troubleshooting Common Issues

### High Error Rate
1. Check error distribution (which codes?)
2. Look for patterns (time, endpoint, user type)
3. Match against recent deployments
4. Check external service status
5. Review database connectivity

### Slow API Responses
1. Check P95 latency trend
2. Compare to baseline
3. Check for database query issues
4. Check external service latency
5. Review code changes

### Missing Logs
1. Verify `NEXT_PUBLIC_LOG_ENDPOINT` set
2. Check endpoint is accessible
3. Review network logs in browser
4. Check request format matches endpoint
5. Verify authentication if required

## Next Steps

1. Configure external log storage (Supabase, LogRocket, Datadog)
2. Create dashboard in monitoring tool
3. Set up alerts for critical issues
4. Train team on debugging with logs
5. Schedule weekly review of metrics
