# Customer Web Deployment Guide

This guide walks you through deploying the Jumun Customer Web App to Vercel using GitHub Actions.

## 🏗️ Architecture

```
GitHub (Jumun_customer_web)
    ↓ push to main
GitHub Actions
    ↓ build & deploy
Vercel (Customer Web App)
    ↓ connects to
Supabase (Database & Auth)
```

## 📋 Prerequisites

- GitHub account with access to Jumun_customer_web repository
- Vercel account (free tier available)
- Supabase project already set up
- Customer access to GitHub repository settings

## 🚀 Step 1: Vercel Project Setup

### 1.1 Create Vercel Project

```bash
# Clone the repository
git clone https://github.com/Insajin/Jumun_customer_web.git
cd Jumun_customer_web

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Create new project
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** (select your account)
- **Link to existing project?** No
- **Project name?** jumun-customer-web
- **Directory?** ./
- **Override settings?** No

### 1.2 Get Vercel Credentials

From Vercel Dashboard (https://vercel.com/dashboard):

1. **Org ID**: Account Settings → General → Your ID
2. **Project ID**: jumun-customer-web project → Settings → General → Project ID
3. **Token**: Account Settings → Tokens → Create Token
   - Name: `GitHub Actions - Customer Web`
   - Scope: Full Account
   - Expiration: No Expiration

**Copy these values - you'll need them for GitHub Secrets!**

## 🔐 Step 2: Configure GitHub Secrets

Go to: https://github.com/Insajin/Jumun_customer_web/settings/secrets/actions

Click **New repository secret** and add:

### Required Secrets

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Where to Find Values

| Secret | Where to Find |
|--------|---------------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel → Settings → General → Your ID |
| `VERCEL_PROJECT_ID` | Project → Settings → General → Project ID |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |

## ✅ Step 3: Verify GitHub Actions Setup

The workflow file is already in your repository at `.github/workflows/deploy.yml`.

### Workflow Triggers

The deployment runs automatically when:
1. **Push to main/master branch** → Production deployment
2. **Pull request** → Preview deployment (build only)
3. **Manual trigger** → Via GitHub Actions tab

### Workflow Steps

1. ✅ Checkout code
2. ✅ Setup Node.js 18
3. ✅ Install dependencies
4. ✅ Run linter (continues on error)
5. ✅ Type check & build
6. ✅ Deploy to Vercel (production only)
7. ✅ Comment on PR with preview URL (PR only)

## 🎯 Step 4: First Deployment

### 4.1 Test Locally First

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
# Test:
# - Browse menu items
# - Add items to cart
# - Guest checkout flow
# - Order tracking
```

### 4.2 Trigger Deployment

```bash
# Commit and push to trigger deployment
git add .
git commit -m "chore: trigger initial deployment"
git push origin main
```

### 4.3 Monitor Deployment

1. **GitHub Actions**: https://github.com/Insajin/Jumun_customer_web/actions
   - Click on the latest workflow run
   - Watch the deployment progress
   - Check for any errors in the logs

2. **Vercel Dashboard**: https://vercel.com/dashboard
   - Find your `jumun-customer-web` project
   - Click to see deployment details
   - Copy the production URL

### 4.4 Verify Deployment

Once the workflow completes:

```bash
# Test production URL
curl https://jumun-customer-web.vercel.app

# Or open in browser
open https://jumun-customer-web.vercel.app
```

**Test Key Features**:
- [ ] Home page loads with promotions
- [ ] Menu items display correctly
- [ ] Add to cart works
- [ ] Guest checkout flow completes
- [ ] Order tracking updates in real-time

## 🔧 Troubleshooting

### Deployment Fails: "Module not found"

**Solution**: Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json .next
npm install
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Deployment Fails: "Environment variable missing"

**Solution**: Verify GitHub Secrets
1. Go to repository Settings → Secrets → Actions
2. Check all required secrets are present
3. Verify `SUPABASE_URL` includes `https://`
4. Re-create any missing secrets
5. Re-run the workflow

### Build Succeeds but App Shows Errors

**Solution 1**: Check Supabase connection
```javascript
// Open browser console at your deployed URL
// Check for network errors to Supabase
```

**Solution 2**: Verify environment variables in Vercel
```bash
# Check Vercel environment variables
vercel env ls
```

**Solution 3**: Check RLS policies
```sql
-- In Supabase SQL Editor, verify public read access
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('menu_items', 'stores', 'brands');
```

### Cart or Checkout Not Working

**Solution 1**: Check browser localStorage
```javascript
// In browser console
localStorage.getItem('cart')
```

**Solution 2**: Verify order creation
```sql
-- In Supabase SQL Editor
SELECT * FROM orders
ORDER BY created_at DESC
LIMIT 5;
```

**Solution 3**: Check API errors
```bash
# View Vercel function logs
vercel logs --follow
```

### Real-time Updates Not Working

**Solution 1**: Verify Supabase Realtime is enabled
- Supabase Dashboard → Database → Replication
- Check `orders` table has replication enabled

**Solution 2**: Check WebSocket connection
```javascript
// In browser console
// Should see WebSocket connection to Supabase
```

## 🔄 Development Workflow

### Making Changes

1. **Create feature branch**:
   ```bash
   git checkout -b feature/improve-home-page
   ```

2. **Make changes and test locally**:
   ```bash
   npm run dev
   # Test at http://localhost:3000
   ```

3. **Create pull request**:
   ```bash
   git add .
   git commit -m "feat: improve home page layout"
   git push origin feature/improve-home-page
   ```

4. **GitHub Actions will**:
   - Build and test your changes
   - Comment on PR with preview URL
   - Wait for your review and merge

5. **Merge to main**:
   - Once PR is approved and merged
   - GitHub Actions automatically deploys to production

### Manual Deployment (Emergency)

If GitHub Actions fails, you can deploy manually:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy to production
vercel --prod --token=$VERCEL_TOKEN
```

## 📊 Monitoring

### View Deployment Logs

**GitHub Actions Logs**:
https://github.com/Insajin/Jumun_customer_web/actions

**Vercel Logs**:
```bash
vercel logs jumun-customer-web --token=$VERCEL_TOKEN
```

Or from Vercel Dashboard → Project → Logs

### Performance Monitoring

Vercel automatically provides:
- **Speed Insights**: Real user performance metrics
- **Web Vitals**: Core Web Vitals monitoring (LCP, FID, CLS)
- **Analytics**: Page views and user behavior

Access from: Vercel Dashboard → Project → Analytics

### Real-time Order Monitoring

Set up alerts for new orders:
```javascript
// In your admin dashboard or monitoring tool
supabase
  .channel('orders')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders'
  }, payload => {
    // Send notification (Slack, email, etc.)
    console.log('New order:', payload.new)
  })
  .subscribe()
```

## 💰 Cost Estimate

**Vercel Free Tier Includes**:
- 100GB bandwidth per month
- 100 builds per month
- Unlimited team members
- Automatic HTTPS
- Global CDN

**Typical Customer Web Usage**:
- Estimated: **$0/month** (stays within free tier for MVP)
- Upgrade needed if: >100GB bandwidth or >100 builds

**Bandwidth Calculation**:
```
Average page size: 500KB
100GB / 500KB = 200,000 page views/month (free)
```

## 🔐 Security Checklist

Before going live:

- [ ] All GitHub Secrets configured
- [ ] `SUPABASE_ANON_KEY` is public key (not service key)
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Supabase RLS policies tested for customer access
- [ ] Guest checkout doesn't expose sensitive data
- [ ] Order tracking only shows customer's own orders
- [ ] XSS protection enabled (automatic with Next.js)
- [ ] CSRF protection for forms
- [ ] Rate limiting for order creation
- [ ] Input validation on all forms

### Test Security

```bash
# Test that customers can't access other orders
# In browser console after placing order
supabase
  .from('orders')
  .select('*')
  .then(console.log)
// Should only return your own orders
```

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `order.yourdomain.com` or `www.yourdomain.com`)
3. Configure DNS records as instructed by Vercel:
   ```
   Type: CNAME
   Name: order (or www)
   Value: cname.vercel-dns.com
   ```
4. Wait for SSL certificate to be issued (automatic, ~5 minutes)

### Update Supabase Redirect URLs

If using custom domain:
1. Supabase Dashboard → Authentication → URL Configuration
2. Add your custom domain to **Redirect URLs**:
   ```
   https://order.yourdomain.com/*
   ```

## 🎨 Brand Customization

### White-Label Configuration

Each brand can have custom branding:

```typescript
// In your brand configuration
const brandConfig = {
  id: 'brand-uuid',
  name: 'Coffee Shop Chain',
  primaryColor: '#FF6B6B',
  logo: 'https://cdn.example.com/logo.png',
  domain: 'coffee.yourdomain.com'
}
```

### Deploy Multiple Brand Sites

For multiple brands, create separate Vercel projects:

```bash
# Brand 1
vercel --prod --name jumun-brand-coffee

# Brand 2
vercel --prod --name jumun-brand-bakery
```

## 📱 PWA Support

The customer web app can be installed as a Progressive Web App:

### Test PWA Installation

1. Open your deployed site in Chrome (desktop or mobile)
2. Click the install icon in the address bar
3. Test offline functionality
4. Test push notifications (if implemented)

### PWA Configuration

Check `public/manifest.json`:
```json
{
  "name": "Jumun Order",
  "short_name": "Jumun",
  "icons": [...],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Web Vitals](https://web.dev/vitals/)

## 🆘 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Review Vercel deployment logs
3. Check browser console for errors
4. Verify Supabase connection
5. Test locally first (`npm run dev`)
6. Contact:
   - Vercel Support: https://vercel.com/support
   - Supabase Support: https://supabase.com/support
   - GitHub Issues: https://github.com/Insajin/Jumun_customer_web/issues

---

**Last Updated**: 2025-10-15
**Repository**: https://github.com/Insajin/Jumun_customer_web
