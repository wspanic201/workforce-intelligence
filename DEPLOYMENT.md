# Deployment Guide

## Deploying to Vercel

### Prerequisites

- Vercel account (free tier works)
- Supabase project running
- Anthropic API key
- GitHub repository (optional but recommended)

### Method 1: Deploy via GitHub (Recommended)

#### 1. Push to GitHub

```bash
cd ~/projects/workforce-intelligence

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: Program Validation System"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/workforce-intelligence.git
git branch -M main
git push -u origin main
```

#### 2. Connect to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 3. Add Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
CONFLUENCE_LABS_PATH=/Users/matt/projects/Confluence Labs
```

**Important**: For `CONFLUENCE_LABS_PATH` on Vercel, you'll need to either:
- Option A: Copy persona files into project (e.g., `lib/confluence-labs/personas/`)
- Option B: Store personas in Supabase Storage and load dynamically

#### 4. Deploy

Click "Deploy" and wait ~2-3 minutes.

Your app will be live at: `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

```bash
npm install -g vercel

cd ~/projects/workforce-intelligence
vercel

# Follow prompts
# Set up environment variables when asked
```

## Production Considerations

### 1. Confluence Labs Personas

**Problem**: Personas are currently loaded from local filesystem (`~/projects/Confluence Labs/`)

**Solutions**:

#### Option A: Bundle Personas in Project

```bash
# Copy personas into project
mkdir -p lib/confluence-labs/personas
cp -r ~/projects/Confluence\ Labs/* lib/confluence-labs/personas/

# Update loader.ts:
const CONFLUENCE_LABS_PATH = process.env.CONFLUENCE_LABS_PATH || 
  path.join(process.cwd(), 'lib/confluence-labs/personas');
```

#### Option B: Supabase Storage

1. Upload personas to Supabase Storage bucket
2. Modify `loader.ts` to fetch from Supabase
3. Cache in memory for performance

#### Option C: Environment Variables

Store persona content as compressed env vars (not ideal for large personas).

### 2. API Keys & Secrets

- ✅ Never commit `.env.local`
- ✅ Use Vercel environment variables
- ✅ Rotate keys regularly
- ✅ Set up separate keys for dev/staging/prod

### 3. Database

#### Supabase Production Setup

1. **Enable Point-in-Time Recovery**:
   - Settings → Database → Enable PITR
   - Protects against data loss

2. **Set up Connection Pooling**:
   - Use Supabase connection pooler for better performance
   - Update connection string in production

3. **Monitor Usage**:
   - Check Database → Usage
   - Upgrade plan if needed (free tier: 500MB, 2GB bandwidth)

4. **Backups**:
   - Supabase auto-backups daily (on paid plans)
   - Export schema regularly: `supabase db dump`

### 4. Performance Optimization

#### Enable Redis Caching (Future)

```typescript
// Cache persona loads
const personaCache = new Map();

async function loadPersona(slug) {
  if (personaCache.has(slug)) {
    return personaCache.get(slug);
  }
  const persona = await loadFromDisk(slug);
  personaCache.set(slug, persona);
  return persona;
}
```

#### Database Indexes

Already included in schema:
- `idx_validation_projects_user_id`
- `idx_research_components_project_id`
- etc.

### 5. Monitoring & Logging

#### Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Sentry Error Tracking

```bash
npm install @sentry/nextjs
```

```bash
npx @sentry/wizard@latest -i nextjs
```

### 6. Rate Limiting

Add rate limiting to prevent abuse:

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 validations per hour
});
```

## Cost Estimates

### Vercel

- **Free Tier**: 
  - 100GB bandwidth
  - Unlimited API routes
  - Good for testing + ~100 validations/month

- **Pro ($20/mo)**:
  - 1TB bandwidth
  - Advanced analytics
  - Good for production

### Supabase

- **Free Tier**:
  - 500MB database
  - 2GB bandwidth
  - 50,000 monthly active users
  - Good for ~500 validations

- **Pro ($25/mo)**:
  - 8GB database
  - 50GB bandwidth
  - Good for thousands of validations

### Anthropic API

- **Claude Sonnet 3.5**:
  - Input: $3 / 1M tokens
  - Output: $15 / 1M tokens
  
- **Per Validation** (~20K tokens total):
  - ~$0.30-0.50 per report
  - At $10k pricing, API cost is 0.003-0.005%

### Total Monthly (Production)

**Low Volume** (~50 validations/month):
- Vercel: Free
- Supabase: Free  
- Anthropic: ~$25
- **Total: ~$25/mo**

**Medium Volume** (~200 validations/month):
- Vercel: $20
- Supabase: $25
- Anthropic: ~$100
- **Total: ~$145/mo**

## Security Checklist

- [ ] Environment variables never committed to git
- [ ] Supabase RLS policies enabled
- [ ] API routes have error handling
- [ ] Rate limiting implemented
- [ ] CORS configured properly
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Service role key never exposed to client
- [ ] Regular security audits (`npm audit`)

## Pre-Launch Checklist

- [ ] Test full validation flow on production
- [ ] Verify all persona files accessible
- [ ] Check API keys work
- [ ] Review generated report quality
- [ ] Test error scenarios (invalid input, API failures)
- [ ] Set up monitoring/alerting
- [ ] Document admin procedures
- [ ] Create backup/restore procedure
- [ ] Test on mobile devices
- [ ] Verify email notifications (if implemented)

## Rollback Procedure

If deployment breaks:

1. **Vercel**: Instantly rollback to previous deployment
   - Deployments → Select previous → Promote to Production

2. **Database**: Restore from backup
   - Supabase → Database → Backups → Restore

3. **Code**: Revert git commit
   ```bash
   git revert HEAD
   git push
   ```

## Ongoing Maintenance

### Weekly

- [ ] Check error logs in Vercel
- [ ] Review agent_sessions for failures
- [ ] Monitor API costs

### Monthly

- [ ] Review report quality
- [ ] Update persona prompts if needed
- [ ] Clean up old test projects
- [ ] Check database size

### Quarterly

- [ ] Rotate API keys
- [ ] Review and update dependencies
- [ ] Security audit
- [ ] Performance optimization

## Advanced: Custom Domain

1. Purchase domain (e.g., `validation.murphyworkforce.com`)
2. In Vercel → Settings → Domains
3. Add domain and configure DNS
4. SSL certificate auto-provisioned

## Support & Troubleshooting

### Production Issues

1. Check Vercel logs: `vercel logs [deployment-url]`
2. Check Supabase logs: Dashboard → Logs
3. Review agent_sessions table for AI failures

### Emergency Contacts

- Vercel Support: https://vercel.com/help
- Supabase Support: https://supabase.com/support  
- Anthropic Status: https://status.anthropic.com

---

**Deployment Complete!** 🎉

Monitor first few validations closely and adjust as needed.
