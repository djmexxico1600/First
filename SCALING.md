# Scaling & Infrastructure Guide

World-class platforms must scale reliably to handle growth. This guide covers infrastructure design, database scaling, deployment strategies, and cloud-native patterns.

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────┐
│                    CDN (Cloudflare)             │
│              Static assets, edge caching        │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────v────────────────────────────┐
│              Load Balancer                      │
│          (Cloudflare / Cloud Provider)          │
└────────────────────┬────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────v─┐        ┌────v─┐        ┌────v─┐
│ App  │        │ App  │  ...   │ App  │
│  #1  │        │  #2  │        │  #N  │
└────┬─┘        └────┬─┘        └────┬─┘
     │               │               │
     └───────────────┼───────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────v─┐        ┌────v─┐        ┌────v─┐
│Cache │        │Cache │  ...   │Cache │
│(Redis)        │(Redis)        │(Redis)
└────┬─┘        └────┬─┘        └────┬─┘
     │               │               │
     └───────────────┼───────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────v──────────────────────────────────┐
│     Primary Database (PostgreSQL)     │
└────┬──────────────────────────────────┘
     │
     ├─────────────────────────────────┐
     │                                 │
┌────v──────────┐         ┌────────────v──┐
│ Read Replica  │         │ Read Replica  │
│      #1       │         │      #2       │
└───────────────┘         └───────────────┘
```

## Database Scaling

### 1. Connection Pooling

**Configuration**
```typescript
// PgBoss for queue management
const pgboss = new PgBoss({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  database: env.DATABASE_NAME,
  max: 30,        // Max connections
  min: 5,         // Min connections
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});
```

**Benefits**
- Prevents connection exhaustion
- Reduces latency from connection creation
- Enables better resource utilization
- Supports connection recycling

### 2. Read Replicas

**Architecture**
- Primary database: Handles writes and transactional reads
- Read replicas: Distribute read-only queries
- Replication lag: Typically 100-500ms

**Implementation**
```typescript
// Route reads to replica
const getBeats = async (filter?: string) => {
  const db = readReplicaPool(); // Read-only connection
  
  return db.query.beats.findMany({
    where: filter ? { genre: filter } : undefined,
  });
};

// Write to primary
const createBeat = async (data: BeatInput) => {
  const db = primaryPool(); // Write connection
  
  return db.insert(beats).values(data);
};
```

### 3. Query Optimization

**Indexing Strategy**
```sql
-- Composite indexes for common queries
CREATE INDEX idx_beats_genre_price 
  ON beats(genre, price_usd DESC);

CREATE INDEX idx_orders_user_created 
  ON orders(user_id, created_at DESC);

-- Partial indexes for common filters
CREATE INDEX idx_subscriptions_active 
  ON subscriptions(user_id) 
  WHERE status = 'active';
```

**Monitoring Queries**
```sql
-- Find missing indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');

-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 4. Data Sharding

**When to Shard**
- Single database exceeds 1TB
- Write throughput > 10k QPS
- Single server can't handle load

**Sharding Strategy**
```typescript
// Shard by user ID
const getShardId = (userId: string): number => {
  const hash = userId.charCodeAt(0) + userId.charCodeAt(1);
  return hash % SHARD_COUNT; // Distribute across N shards
};

// Route query to correct shard
const getUserBeats = async (userId: string) => {
  const shardId = getShardId(userId);
  const shard = getDatabaseShard(shardId);
  
  return shard.query.beats.findMany({
    where: { userId }
  });
};
```

### 5. Database Backup & Recovery

**Backup Strategy**
- Daily automated backups to S3
- Point-in-time recovery (PITR) enabled
- WAL archiving for transactional safety
- Test recovery procedures monthly

```typescript
// Automated backup example
const backupDatabase = async () => {
  const timestamp = new Date().toISOString();
  const backupName = `db-backup-${timestamp}`;
  
  const result = await db.backup.create({
    name: backupName,
    database: env.DATABASE_NAME,
    targetBucket: 's3://backups/',
  });
  
  return result;
};
```

## Caching Strategy

### 1. Multi-Layer Caching

**Layer 1: CDN Cache** (5min - 24h)
- Static assets
- API responses with Cache-Control headers
- Pre-rendered pages

**Layer 2: Application Cache** (5min - 1h)
- Session data
- Frequently accessed queries
- Computed values

**Layer 3: Database Cache**
- Connection pooling
- Query result caching
- Prepared statements

### 2. Cache Invalidation

**Pattern: Event-Based Invalidation**
```typescript
// When data changes, invalidate cache
const updateBeat = async (beatId: string, data: BeatInput) => {
  // Update database
  const updated = await db.update(beats)
    .set(data)
    .where({ id: beatId });
  
  // Invalidate caches
  await cache.delete(`beat:${beatId}`);
  await cache.delete('beats:all');
  await cache.delete('beats:genre:*');
  
  return updated;
};
```

**TTL Strategy**
```typescript
const CACHE_TTL = {
  STATIC: 86400,      // 24 hours - static data
  REGULAR: 3600,      // 1 hour - regularly updated
  SHORT: 300,         // 5 minutes - frequently changing
  MINIMAL: 60,        // 1 minute - real-time data
  NONE: 0,            // No cache - sensitive data
};
```

## Load Balancing

### 1. Request Distribution

**Load Balancer Configuration**
```
- Algorithm: Least connections / Round-robin
- Health Check: Every 10 seconds
- Timeout: 30 seconds
- Max retries: 3
- Sticky sessions: For certain endpoints (auth)
```

**Sticky Sessions**
```typescript
// User sessions should route to same server
router.post('/auth/login', (req, res) => {
  // Set cookie with server affinity
  res.cookie('server', req.hostname, {
    httpOnly: true,
    path: '/',
    maxAge: 86400000,
  });
  
  return performLogin(req);
});
```

### 2. Circuit Breaker Pattern

```typescript
// Prevent cascading failures
const circuitBreaker = {
  failureThreshold: 5,      // Open after 5 failures
  successThreshold: 2,      // Close after 2 successes
  timeout: 60000,          // 60 second timeout
};

const callWithCircuitBreaker = async (fn: () => Promise<any>) => {
  if (circuitBreaker.isOpen()) {
    throw new Error('Circuit breaker is open');
  }
  
  try {
    const result = await fn();
    circuitBreaker.recordSuccess();
    return result;
  } catch (error) {
    circuitBreaker.recordFailure();
    throw error;
  }
};
```

## Auto-Scaling

### 1. Scaling Metrics

**CPU-Based Scaling**
- Scale up: CPU > 70%
- Scale down: CPU < 40%
- Cooldown: 5 minutes between changes

**Memory-Based Scaling**
- Scale up: Memory > 80%
- Scale down: Memory < 50%

**Request-Based Scaling**
- Scale up: Requests > 10k/min
- Scale down: Requests < 5k/min

### 2. Terraform Configuration Example

```hcl
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  min_size            = 2
  max_size            = 10
  desired_capacity    = 3
  vpc_zone_identifier = var.subnet_ids
  
  launch_configuration = aws_launch_configuration.app.id
  
  tag {
    key                 = "Name"
    value               = "app-instance"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "scale_up" {
  name                   = "app-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  autoscaling_group_name = aws_autoscaling_group.app.name
  cooldown               = 300
}
```

## Deployment Strategies

### 1. Blue-Green Deployment

**Process**
1. Deploy new version to "green" environment
2. Run smoke tests on green
3. Switch load balancer to green
4. Keep blue for rollback (1 hour)

**Benefits**
- Zero downtime deployments
- Instant rollback capability
- Full environment testing

### 2. Canary Deployment

**Process**
1. Deploy to 10% of servers
2. Monitor metrics and errors
3. Gradually roll out to 100%
4. Automatic rollback on errors

```typescript
// Route requests based on deployment version
const routeRequest = (req: Request) => {
  const random = Math.random();
  
  if (random < 0.1) {
    // Route 10% to canary (new version)
    return serveCanary(req);
  } else {
    // Route 90% to stable (current version)
    return serveStable(req);
  }
};
```

### 3. Rolling Deployment

**Gradual server replacement**
- Replace 1-2 servers at a time
- Health checks before next replacement
- Automatic rollback on errors
- Slower deployment (30-60 minutes)

## Infrastructure Monitoring

### 1. Key Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| CPU Utilization | 50-70% | > 85% |
| Memory Usage | 60-75% | > 90% |
| Connection Pool | < 80% | > 90% |
| Request Latency (p95) | < 200ms | > 500ms |
| Error Rate | < 0.1% | > 0.5% |
| Database Replication Lag | < 100ms | > 500ms |

### 2. Alerting Rules

```yaml
alerts:
  - name: HighCPU
    condition: cpu > 85%
    duration: 5m
    action: page_oncall
    
  - name: HighErrorRate
    condition: error_rate > 1%
    duration: 2m
    action: page_oncall
    
  - name: SlowQueries
    condition: p99_query_time > 1000ms
    duration: 5m
    action: log
```

## Disaster Recovery

### 1. RTO & RPO Goals
- **RTO** (Recovery Time Objective): < 15 minutes
- **RPO** (Recovery Point Objective): < 5 minutes

### 2. DR Procedures

**Database Recovery**
```bash
# Point-in-time recovery to specific timestamp
pg_restore --host=restore.db.example.com \
           --username=postgres \
           --dbname=production \
           --single-transaction \
           /backups/db-backup-2024-01-01T12:00:00Z.dump
```

**Service Recovery**
- Promote read replica to primary
- Update DNS/connection strings
- Verify application connectivity
- Run smoke tests

## Scaling Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up database connection pooling
- [ ] Implement basic caching layer
- [ ] Add application health checks
- [ ] Configure load balancer

### Phase 2: Database (Weeks 3-4)
- [ ] Set up read replicas
- [ ] Implement query optimization
- [ ] Add slow query monitoring
- [ ] Configure automated backups

### Phase 3: Infrastructure (Weeks 5-6)
- [ ] Implement auto-scaling
- [ ] Set up CDN for static assets
- [ ] Configure edge caching
- [ ] Implement blue-green deployments

### Phase 4: Operations (Weeks 7-8)
- [ ] Set up monitoring and alerting
- [ ] Document runbooks
- [ ] Implement incident response
- [ ] Run DR drills

## Cost Optimization

### Strategies
- Right-size instances (avoid over-provisioning)
- Use reserved instances for baseline capacity
- Implement spot instances for batch jobs
- Review and clean up unused resources monthly
- Cache aggressively to reduce database load

### Expected Costs at Different Scales

| Scale | Servers | Database | CDN | Monthly Cost |
|-------|---------|----------|-----|--------------|
| 100 RPS | 3 | 1 db + 2 replicas | Basic | ~$2000 |
| 1k RPS | 10 | 1 db + 3 replicas | Standard | ~$8000 |
| 10k RPS | 30 | Sharded (3) | Premium | ~$25000 |
| 100k RPS | 100+ | Sharded (10+) | Premium | ~$100000+ |

## Security at Scale

- Enable VPC for network isolation
- Implement WAF (Web Application Firewall)
- Use TLS 1.3 for all communications
- Enable rate limiting per IP/user
- Implement DDoS protection
- Regular security audits and penetration testing

## References

- [Cloudflare Docs](https://developers.cloudflare.com/)
- [PostgreSQL Scaling Guide](https://wiki.postgresql.org/wiki/Replication,_Clustering,_and_Connection_Pooling)
- [AWS Auto Scaling](https://aws.amazon.com/autoscaling/)
- [Kubernetes Deployment Guide](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [SRE Book - Scalability](https://sre.google/sre-book/system-design-design-process/)

---

**Last Updated**: Phase 5 - Scaling & Infrastructure
**Maintenance**: Review quarterly with growth metrics
