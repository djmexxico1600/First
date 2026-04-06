# API Documentation

## Overview

The DJMEXXICO platform provides RESTful APIs for music beats marketplace and car post management. All API responses follow a standardized format with proper error handling and request tracing.

## Base URL

```
https://djmexxico.com/api
```

## Authentication

All endpoints (except health check) require Clerk authentication tokens in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2026-04-06T20:00:00.000Z"
}
```

**Status Code**: 200 OK

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional error details */ },
    "requestId": "1712425200000-a1b2c3d4e",
    "timestamp": "2026-04-06T20:00:00.000Z"
  }
}
```

**Status Code**: 4xx / 5xx

## Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required or invalid token |
| `FORBIDDEN` | 403 | User does not have permission |
| `INVALID_INPUT` | 400 | Request validation failed |
| `MISSING_REQUIRED` | 400 | Required field missing |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `LIMIT_EXCEEDED` | 429 | Rate limit or quota exceeded |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `SUBSCRIPTION_REQUIRED` | 402 | Subscription tier required |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Endpoints

### Health Check

**Endpoint**: `GET /api/health`

**Authentication**: Not required

**Description**: Check API health status and readiness

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-06T20:00:00.000Z",
    "uptime": 3600.5,
    "environment": "production",
    "version": "0.1.0"
  },
  "timestamp": "2026-04-06T20:00:00.000Z"
}
```

### Webhooks

#### Clerk Webhook

**Endpoint**: `POST /api/webhooks/clerk`

**Description**: Handles Clerk authentication events (user.created, user.updated, user.deleted)

**Headers**:
- `svix-id`: Unique event ID
- `svix-timestamp`: Event timestamp
- `svix-signature`: HMAC signature

#### Stripe Webhook

**Endpoint**: `POST /api/webhooks/stripe`

**Description**: Handles Stripe payment events (charge.succeeded, invoice.payment_failed, etc.)

**Headers**:
- `stripe-signature`: Stripe webhook signature

#### Analytics Events

**Endpoint**: `POST /api/webhooks/events`

**Description**: Collect analytics and tracking events

**Body**:
```json
{
  "event": "page_view",
  "userId": "user_123",
  "properties": { /* custom properties */ }
}
```

## Request Tracing

Every API request receives a unique `X-Request-ID` header for distributed tracing:

```
X-Request-ID: 1712425200000-a1b2c3d4e
```

Use this ID to track request lifecycle through logs and external services.

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Limits vary by endpoint:

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Webhook endpoints**: 10000 requests per minute

Rate limit status is returned in response headers:
- `RateLimit-Limit`: Total limit
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Unix timestamp when limit resets

## Pagination

List endpoints support pagination through query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  },
  "timestamp": "2026-04-06T20:00:00.000Z"
}
```

## Timestamps

All timestamps in API responses are in ISO 8601 format with timezone information:

```
2026-04-06T20:00:00.000Z
```

## Error Handling

When making API requests, always check the `success` field in responses:

```javascript
const response = await fetch('/api/endpoint');
const json = await response.json();

if (!json.success) {
  console.error(`Error [${json.error.code}]: ${json.error.message}`);
  console.error(`Request ID: ${json.error.requestId}`);
  // Handle error based on error code
}
```

## Best Practices

1. **Always check response status**: Use HTTP status codes as primary indicator
2. **Use request IDs**: Include `X-Request-ID` in error reports
3. **Implement exponential backoff**: Retry on 5xx errors with backoff
4. **Validate before sending**: Validate input data client-side before API calls
5. **Handle timeouts**: Implement appropriate timeout values
6. **Cache strategically**: Use appropriate Cache-Control headers

## Security

- All endpoints support HTTPS only
- Environment variables contain sensitive credentials
- API keys should never be exposed client-side
- Always validate server-side input
- Use Clerk for authentication instead of custom tokens
- Rate limiting prevents DDoS attacks

## Support

For API issues:

1. Check request ID: `X-Request-ID` header
2. Review error code and message
3. Check this documentation
4. Review server logs with request ID
