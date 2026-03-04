# Cloud Setup Checklist

## Pre-Deployment Validation

### 1. Environment Configuration
- [ ] `.env` file configured correctly
- [ ] All API keys present
- [ ] Database connection string verified
- [ ] API keys are valid and not expired

### 2. API Server (shadow-index)
- [ ] Dependencies installed (`npm install`)
- [ ] Build successful (`npm run build`)
- [ ] Development server starts (`npm run dev`)
- [ ] Health endpoint responds (`curl http://localhost:3000/health`)
- [ ] API routes accessible
- [ ] Database queries work correctly

### 3. Frontend (auth-portal)
- [ ] Dependencies installed (`npm install`)
- [ ] Build successful (`npm run build`)
- [ ] Development server starts (`npm run dev`)
- [ ] Application loads at `http://localhost:5178`
- [ ] API integration works
- [ ] Authentication flow functional

### 4. Integration Testing
- [ ] Frontend can communicate with API
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] Form submissions succeed
- [ ] User sessions persist

### 5. Performance Baseline
- [ ] API response times acceptable (<500ms)
- [ ] Frontend initial load time acceptable
- [ ] No console errors
- [ ] Memory usage stable

### 6. Security Checks
- [ ] CORS headers configured
- [ ] API rate limiting active
- [ ] Environment variables not exposed
- [ ] No sensitive data in logs
- [ ] Authentication tokens validated

### 7. Deployment
- [ ] All tests passing
- [ ] No build warnings
- [ ] Documentation up to date
- [ ] Ready for staging/production

## Sign-off
- **Validated By**: [Your Name]
- **Date**: [Date]
- **Status**: [ ] Ready / [ ] Blocked
