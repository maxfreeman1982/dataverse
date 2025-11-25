# Services Documentation

Complete guide for all backend services in the OJ Investment Platform.

## 📦 Available Services

### 1. SMS Service (Twilio)
**Location:** `apps/api/src/modules/notifications/services/sms.service.ts`

Handles SMS notifications via Twilio for critical user communications.

#### Configuration
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Usage Examples
```typescript
import { SmsService } from './modules/notifications/services/sms.service';

// Inject in your service
constructor(private smsService: SmsService) {}

// Send 2FA code
await this.smsService.sendTwoFactorCode('+33612345678', '123456');

// Send investment confirmation
await this.smsService.sendInvestmentConfirmation(
  '+33612345678',
  'Projet Solar Energy',
  50000
);

// Send KYC approval
await this.smsService.sendKYCApprovalNotification('+33612345678', 'John Doe');

// Send withdrawal confirmation
await this.smsService.sendWithdrawalConfirmation(
  '+33612345678',
  10000,
  '2025-11-30'
);
```

#### Available Methods
- `sendTwoFactorCode()` - 2FA verification code
- `sendOTP()` - One-time password for phone verification
- `sendInvestmentConfirmation()` - Investment success notification
- `sendReturnPaymentNotification()` - Return payment alert
- `sendKYCApprovalNotification()` - KYC approved
- `sendKYCRejectionNotification()` - KYC rejected with reason
- `sendWithdrawalConfirmation()` - Withdrawal processed
- `sendProjectUpdateAlert()` - Project update notification
- `sendSecurityAlert()` - Security-related alerts

---

### 2. Document Generator Service
**Location:** `apps/api/src/modules/documents/services/document-generator.service.ts`

Generates professional PDFs for certificates, invoices, and contracts.

#### Configuration
No external API keys required. Documents are generated locally using PDFKit.

#### Usage Examples

##### Investment Certificate
```typescript
import { DocumentGeneratorService } from './modules/documents/services/document-generator.service';

const certificateData = {
  investorName: 'Jean Dupont',
  projectName: 'Projet Énergie Solaire',
  amount: 50000,
  currency: 'EUR',
  investmentDate: new Date(),
  certificateNumber: 'CERT-2025-00123',
  expectedReturn: 8.5,
  duration: '24 mois',
};

const filepath = await this.documentGenerator.generateInvestmentCertificate(certificateData);
// Returns: /path/to/certificate-CERT-2025-00123.pdf
```

##### Invoice
```typescript
const invoiceData = {
  invoiceNumber: 'INV-2025-00456',
  invoiceDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  investorName: 'Jean Dupont',
  investorEmail: 'jean@example.com',
  items: [
    {
      description: 'Frais de gestion',
      quantity: 1,
      unitPrice: 100,
      total: 100,
    },
    {
      description: 'Frais de transaction',
      quantity: 1,
      unitPrice: 50,
      total: 50,
    },
  ],
  subtotal: 150,
  tax: 30,
  total: 180,
  companyInfo: {
    name: 'OJ Investment Platform',
    address: '123 Rue de la Finance, 75001 Paris',
    phone: '+33 1 23 45 67 89',
    email: 'contact@ojinvestment.com',
    siret: '123 456 789 00012',
  },
};

const filepath = await this.documentGenerator.generateInvoice(invoiceData);
```

##### Investment Contract
```typescript
const contractData = {
  contractNumber: 'CONT-2025-00789',
  contractDate: new Date(),
  investorName: 'Jean Dupont',
  projectName: 'Projet Énergie Solaire',
  amount: 50000,
  duration: '24 mois',
  returnRate: 8.5,
  terms: [
    'L\'investisseur accepte les conditions générales de la plateforme.',
    'Le capital investi est remboursable à l\'échéance du projet.',
    'Les rendements sont versés trimestriellement.',
    'L\'investisseur reconnait les risques inhérents à l\'investissement.',
  ],
};

const filepath = await this.documentGenerator.generateContract(contractData);
```

#### Generated Files
All documents are saved in: `generated-documents/`
- Certificates: `certificate-{number}.pdf`
- Invoices: `invoice-{number}.pdf`
- Contracts: `contract-{number}.pdf`

---

### 3. File Upload Service (AWS S3)
**Location:** `apps/api/src/modules/files/services/file-upload.service.ts`

Handles secure file uploads to AWS S3 with automatic image optimization.

#### Configuration
```env
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=oj-investment-files
```

#### File Categories
```typescript
enum FileCategory {
  KYC_DOCUMENT = 'kyc-documents',
  PROJECT_IMAGE = 'project-images',
  PROJECT_DOCUMENT = 'project-documents',
  PROFILE_PICTURE = 'profile-pictures',
  REPORT = 'reports',
  CONTRACT = 'contracts',
  CERTIFICATE = 'certificates',
}
```

#### Usage Examples

##### Upload KYC Document
```typescript
import { FileUploadService } from './modules/files/services/file-upload.service';

// In your controller
@Post('kyc/upload')
@UseInterceptors(FileInterceptor('file'))
async uploadKYC(
  @UploadedFile() file: Express.Multer.File,
  @Request() req,
) {
  const result = await this.fileUploadService.uploadKYCDocument(
    file,
    req.user.id,
    'passport'
  );

  return result;
  // {
  //   key: 'kyc-documents/user123/1732550400000-abc123.pdf',
  //   url: 'https://bucket.s3.eu-west-1.amazonaws.com/...',
  //   filename: 'passport.pdf',
  //   mimetype: 'application/pdf',
  //   size: 245678,
  //   category: 'kyc-documents'
  // }
}
```

##### Upload Project Image
```typescript
const result = await this.fileUploadService.uploadProjectImage(
  file,
  'project-123'
);
// Images are automatically optimized (resized, compressed)
```

##### Upload Multiple Files
```typescript
@Post('documents/bulk')
@UseInterceptors(FilesInterceptor('files', 10))
async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
  const results = await this.fileUploadService.uploadMultipleFiles(
    files,
    FileCategory.PROJECT_DOCUMENT,
    'project-123'
  );
  return results;
}
```

##### Get Signed URL (Temporary Access)
```typescript
// Generate a temporary URL valid for 1 hour
const signedUrl = await this.fileUploadService.getSignedUrl(
  'kyc-documents/user123/document.pdf',
  3600
);
// Use this URL to allow temporary download without exposing permanent URLs
```

##### Delete File
```typescript
await this.fileUploadService.deleteFile('kyc-documents/user123/old-file.pdf');
```

#### File Validation
- **Max file size:** 10MB (general), 5MB (images)
- **Allowed image types:** JPEG, PNG, WebP
- **Allowed document types:** PDF, DOC, DOCX
- **Image optimization:** Automatic resize to max 1920px, 85% quality JPEG

---

### 4. Rate Limiting
**Location:** `apps/api/src/common/middleware/rate-limiter.middleware.ts`

Protects API endpoints from abuse and brute force attacks using Redis.

#### Configuration
```env
REDIS_URL=redis://localhost:6379
```

#### Usage with Decorators

##### Method 1: Using Predefined Decorators
```typescript
import { StrictRateLimit, ModerateRateLimit } from './common/decorators/rate-limit.decorator';
import { UseGuards } from '@nestjs/common';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(RateLimitGuard)
  @StrictRateLimit() // 5 requests per 15 minutes
  async login() { ... }

  @Post('register')
  @UseGuards(RateLimitGuard)
  @ModerateRateLimit() // 50 requests per 15 minutes
  async register() { ... }
}
```

##### Method 2: Custom Rate Limit
```typescript
import { RateLimit } from './common/decorators/rate-limit.decorator';

@Post('investment')
@UseGuards(RateLimitGuard)
@RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Investment rate limit exceeded.',
})
async createInvestment() { ... }
```

#### Predefined Configurations
Located in `apps/api/src/common/config/rate-limit.config.ts`:

```typescript
// Available configurations
RateLimitConfigs.AUTH              // 5 req / 15 min (login, 2FA)
RateLimitConfigs.API               // 100 req / 15 min (general API)
RateLimitConfigs.UPLOAD            // 20 req / hour (file uploads)
RateLimitConfigs.PASSWORD_RESET    // 3 req / hour (password reset)
RateLimitConfigs.KYC_SUBMISSION    // 5 req / day (KYC submissions)
RateLimitConfigs.INVESTMENT        // 10 req / hour (investments)
RateLimitConfigs.WITHDRAWAL        // 5 req / day (withdrawals)
RateLimitConfigs.READ_ONLY         // 300 req / 15 min (GET requests)
RateLimitConfigs.NOTIFICATION      // 10 req / hour (SMS/email)
```

#### Role-Based Rate Limits
```typescript
import { getRateLimitForRole } from './common/config/rate-limit.config';

// Super admins: 1000 req / 15 min
// Admins: 500 req / 15 min
// Verified investors: 200 req / 15 min
// Regular users: 100 req / 15 min

const config = getRateLimitForRole(user.role);
```

#### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 2025-11-25T15:30:00.000Z
```

#### Rate Limit Exceeded Response
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "error": "Too Many Requests"
}
```

---

### 5. Email Service (SendGrid)
**Location:** `apps/api/src/modules/notifications/services/email.service.ts`

Professional email notifications with HTML templates.

#### Configuration
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@ojinvestment.com
SENDGRID_FROM_NAME=OJ Investment Platform
```

#### Available Email Templates
- Welcome email for new users
- Investment confirmation
- Return payment notification
- KYC approval/rejection
- 2FA codes
- Password reset
- Project updates
- Withdrawal confirmations

Full documentation available in previous commits.

---

### 6. Stripe Payment Service
**Location:** `apps/api/src/modules/payments/services/stripe.service.ts`

Complete payment processing with Stripe.

#### Configuration
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Features
- Payment intents for investments
- Customer management
- SEPA direct debit
- Refunds and payouts
- Webhook handling

Full documentation available in previous commits.

---

### 7. Approval Workflow Service
**Location:** `apps/api/src/modules/approvals/services/approval.service.ts`

Governance system for Super Admin review before production.

#### Approval Types
- PROJECT: New project approval
- KYC: Identity verification approval
- WITHDRAWAL: Withdrawal request approval
- INVESTMENT: Large investment approval
- DOCUMENT: Document verification approval

Full documentation available in previous commits.

---

## 🔒 Security Best Practices

### Rate Limiting Strategy
1. **Authentication endpoints:** Strict limits (5 req/15min)
2. **Financial operations:** Moderate limits (10 req/hour)
3. **File uploads:** Conservative limits (20 req/hour)
4. **Read operations:** Lenient limits (300 req/15min)

### File Upload Security
1. File type validation (whitelist only)
2. File size limits (5-10MB max)
3. Automatic image optimization
4. Unique file keys with timestamps
5. S3 bucket policies (private by default)
6. Signed URLs for temporary access

### SMS Security
1. Rate limiting on SMS endpoints
2. Phone number validation
3. Message logging for audit
4. Cost monitoring (Twilio usage)

### Document Generation
1. Input sanitization
2. Template validation
3. Automatic cleanup of old files
4. Access control on generated files

---

## 📊 Monitoring & Logging

All services include comprehensive logging:
- Info: Successful operations
- Warn: Configuration issues, fallbacks
- Error: Failed operations with stack traces

### Example Logs
```
[SmsService] SMS sent to +33612345678
[FileUploadService] File uploaded successfully: kyc-documents/user123/file.pdf
[DocumentGeneratorService] Certificate generated: CERT-2025-00123
[RateLimitGuard] Rate limit exceeded for user:123 on POST:/api/investment
```

---

## 🧪 Testing

### Unit Tests
Each service has corresponding test files in `__tests__/` directories.

```bash
# Run all tests
npm test

# Run specific service tests
npm test -- sms.service.spec.ts
npm test -- file-upload.service.spec.ts
npm test -- document-generator.service.spec.ts
```

### Integration Tests
Test files include mocked external services (Twilio, S3, SendGrid).

---

## 🚀 Deployment Checklist

### Production Setup
- [ ] Configure all environment variables
- [ ] Set up AWS S3 bucket with proper policies
- [ ] Configure Twilio account and verify phone number
- [ ] Set up SendGrid domain authentication
- [ ] Enable Redis for rate limiting
- [ ] Configure Stripe webhook endpoints
- [ ] Set up monitoring and alerts
- [ ] Test rate limits with load testing
- [ ] Verify file upload limits
- [ ] Test document generation
- [ ] Configure backup for generated documents

### Cost Monitoring
- **Twilio:** Monitor SMS usage and costs
- **AWS S3:** Track storage and bandwidth
- **SendGrid:** Monitor email volume
- **Redis:** Consider managed Redis (AWS ElastiCache, Redis Cloud)

---

## 📝 License

Part of the OJ Investment Platform - All rights reserved.
