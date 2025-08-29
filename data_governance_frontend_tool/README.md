# PurSight Enterprise Data Governance Frontend

Advanced Enterprise Data Governance Platform with AI/ML Intelligence, Real-time Orchestration, and Comprehensive Integration across all data governance groups.

## 🚀 Features

### Core Capabilities
- **7 Integrated Groups**: Data Sources, Compliance Rules, Classifications, Scan Rule Sets, Data Catalog, Scan Logic, RBAC System
- **Racine Main Manager**: Revolutionary orchestrator system for cross-group coordination
- **Real-time Communication**: WebSocket integration for live updates
- **Advanced Analytics**: Comprehensive dashboards and reporting
- **AI/ML Intelligence**: Intelligent data classification and recommendations
- **Enterprise Security**: Full RBAC with fine-grained permissions

### Technical Excellence
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom design system
- **React Query** for server state management
- **Zustand** for client state management
- **Databricks-inspired UI** design
- **Responsive Design** for all devices
- **Real-time Updates** via WebSocket
- **Advanced Charts** with Recharts/D3.js

## 🏗️ Architecture

### Frontend Structure
```
data_governance_frontend_tool/
├── app/                    # Next.js 14 App Router
├── components/            # Reusable UI components
├── features/             # Feature-based modules
├── lib/                  # Utilities and configurations
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
├── types/                # TypeScript definitions
└── styles/               # Additional styles
```

### Feature Modules
- **Authentication** - OAuth2/OIDC with MFA support
- **Dashboard** - Comprehensive overview and metrics
- **Data Sources** - Connection management and discovery
- **Compliance Rules** - Rule management and validation
- **Classifications** - AI-powered data classification
- **Scan Rule Sets** - Advanced rule configuration
- **Data Catalog** - Asset management and lineage
- **Scan Logic** - Workflow orchestration
- **RBAC System** - User and permission management
- **Racine Manager** - Master orchestration system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- PurSight Backend API running on port 8000
- PostgreSQL database (configured in backend)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd data_governance_frontend_tool

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Configure environment variables
# Edit .env.local with your backend API URL and other settings

# Start development server
npm run dev
```

### Environment Configuration
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run tests
npm run format       # Format code with Prettier
```

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking
- **Husky** for git hooks
- **Jest** for unit testing

## 🎨 Design System

### Color Palette
```css
--primary: #FF3621     /* Databricks Red */
--secondary: #1B3139   /* Dark Teal */
--accent: #00A972      /* Success Green */
--warning: #FF8A00     /* Warning Orange */
```

### Components
- **Databricks-style** navigation and layout
- **Advanced data tables** with sorting and filtering
- **Interactive charts** and visualizations
- **Real-time status** indicators
- **Responsive design** for all screen sizes

## 🔌 Backend Integration

### API Client
- **Axios-based** HTTP client with interceptors
- **Automatic token refresh** and error handling
- **Type-safe** API calls with TypeScript
- **Request/response** transformation

### WebSocket Integration
- **Real-time updates** for system status
- **Activity notifications** and alerts
- **Scan progress** monitoring
- **Cross-user collaboration** features

### State Management
- **React Query** for server state caching
- **Zustand** for client state management
- **Real-time synchronization** with backend
- **Optimistic updates** for better UX

## 🚀 Deployment

### Production Build
```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://api.yourcompany.com
NEXT_PUBLIC_WS_URL=https://ws.yourcompany.com
NODE_ENV=production
```

## 📊 Monitoring

### Performance Monitoring
- **Web Vitals** tracking
- **Bundle analysis** with webpack-bundle-analyzer
- **Error tracking** with error boundaries
- **Performance metrics** collection

### Analytics Integration
- **User interaction** tracking
- **Feature usage** analytics
- **Performance bottleneck** identification
- **Real-time monitoring** dashboard

## 🔒 Security

### Authentication & Authorization
- **OAuth2/OIDC** integration
- **JWT token** management
- **Role-based access** control
- **Permission-based** component rendering

### Security Best Practices
- **HTTPS enforcement** in production
- **CSP headers** for XSS protection
- **Secure cookie** handling
- **Input validation** and sanitization

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run quality checks (`npm run lint`, `npm run type-check`)
4. Submit pull request with description

### Code Standards
- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write unit tests for new features
- Document complex functionality

## 📝 API Documentation

### Backend Endpoints
The frontend integrates with the following backend API groups:
- `/api/v1/auth/*` - Authentication and authorization
- `/api/v1/dashboard/*` - Dashboard metrics and overview
- `/api/v1/data-sources/*` - Data source management
- `/api/v1/compliance/*` - Compliance rule management
- `/api/v1/classifications/*` - Data classification
- `/api/v1/scan-rules/*` - Scan rule set management
- `/api/v1/catalog/*` - Data catalog operations
- `/api/v1/scan-logic/*` - Scan orchestration
- `/api/v1/rbac/*` - Role-based access control
- `/api/v1/racine/*` - Racine orchestration system

### WebSocket Events
- `system-notification` - System-wide notifications
- `scan-progress` - Real-time scan progress updates
- `system-health-update` - System health status changes
- `user-activity` - User activity notifications

## 🆘 Troubleshooting

### Common Issues
1. **API Connection Failed**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check if backend is running on specified port
   - Verify CORS configuration in backend

2. **WebSocket Connection Issues**
   - Check `NEXT_PUBLIC_WS_URL` configuration
   - Verify WebSocket endpoint in backend
   - Check network proxy settings

3. **Build Errors**
   - Run `npm run type-check` for TypeScript errors
   - Check `npm run lint` for code quality issues
   - Verify all dependencies are installed

## 📄 License

This project is proprietary software. All rights reserved.

## 🙋‍♂️ Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guide above

---

**PurSight Enterprise Data Governance Platform**  
Version 2.0.0 - Advanced Enterprise Production with Racine Main Manager