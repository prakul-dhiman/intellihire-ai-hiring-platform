/**
 * Environment Validation
 * Validates all required environment variables at startup
 * Prevents runtime errors from missing configurations
 */

export const validateEnvironment = () => {
  const requiredEnvVars = {
    // Server Configuration
    PORT: { type: 'number', default: 5000 },
    NODE_ENV: { type: 'string', default: 'development' },

    // Database
    MONGO_URI: { type: 'string', required: true },

    // Authentication
    JWT_SECRET: { type: 'string', required: true },
    JWT_EXPIRE: { type: 'string', default: '7d' },

    // Email
    EMAIL_USER: { type: 'string', required: true },
    EMAIL_PASS: { type: 'string', required: true },

    // External APIs
    JUDGE0_API_URL: { type: 'string', default: 'https://ce.judge0.com' },
    JUDGE0_API_KEY: { type: 'string', required: false },

    // Frontend
    FRONTEND_URL: { type: 'string', required: true },

    // Optional Services
    REDIS_URL: { type: 'string', required: false },
    SENTRY_DSN: { type: 'string', required: false }
  };

  const errors = [];
  const warnings = [];

  Object.entries(requiredEnvVars).forEach(([key, config]) => {
    const value = process.env[key];

    // Check if required variable is missing
    if (config.required && !value) {
      errors.push(`❌ ${key} is required but not set`);
    }

    // Validate type
    if (value && config.type) {
      if (config.type === 'number' && isNaN(Number(value))) {
        errors.push(`❌ ${key} must be a number, got: ${value}`);
      }
    }

    // Security warnings
    if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('TOKEN')) {
      if (value && value.length < 16) {
        warnings.push(`⚠️ ${key} should be at least 16 characters long for security`);
      }
    }

    // MongoDB URI validation
    if (key === 'MONGO_URI' && value) {
      if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
        errors.push(`❌ MONGO_URI must start with 'mongodb://' or 'mongodb+srv://'`);
      }
    }

    // Frontend URL validation
    if (key === 'FRONTEND_URL' && value) {
      try {
        new URL(value);
      } catch (e) {
        errors.push(`❌ FRONTEND_URL must be a valid URL, got: ${value}`);
      }
    }

    // Judge0 API URL validation
    if (key === 'JUDGE0_API_URL' && value) {
      try {
        new URL(value);
      } catch (e) {
        errors.push(`❌ JUDGE0_API_URL must be a valid URL, got: ${value}`);
      }
    }
  });

  // Log warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️ Environment Warnings:');
    warnings.forEach((warning) => console.warn(`   ${warning}`));
  }

  // Log errors and exit if any
  if (errors.length > 0) {
    console.error('\n❌ Environment Validation Failed:');
    errors.forEach((error) => console.error(`   ${error}`));
    console.error('\n📝 Please check your .env file and try again.\n');
    process.exit(1);
  }

  console.log('✅ All environment variables validated successfully\n');
};

/**
 * Get environment-specific configuration
 */
export const getConfig = () => ({
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    uri: process.env.MONGO_URI,
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expireIn: process.env.JWT_EXPIRE || '7d',
    refreshExpireIn: '30d'
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    from: `IntelliHire <${process.env.EMAIL_USER}>`,
    host: 'smtp.gmail.com',
    port: 587,
    secure: false
  },
  api: {
    judge0: {
      baseURL: process.env.JUDGE0_API_URL || 'https://ce.judge0.com',
      key: process.env.JUDGE0_API_KEY,
      timeout: 30000
    }
  },
  frontend: {
    url: process.env.FRONTEND_URL
  },
  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL
  },
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
  },
  security: {
    bcryptRounds: 10,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100
  }
});

/**
 * Validate sensitive configuration
 */
export const validateSecurityConfig = () => {
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'production') {
    // Ensure secure settings in production
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'supersecretkey') {
      throw new Error('❌ JWT_SECRET must be set and strong in production');
    }

    if (!process.env.MONGO_URI?.includes('mongodb+srv')) {
      console.warn('⚠️ Recommended to use MongoDB Atlas (mongodb+srv://) in production');
    }
  }

  console.log(`✅ Security configuration validated for ${nodeEnv} environment`);
};
