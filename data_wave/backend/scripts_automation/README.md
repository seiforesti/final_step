# Enterprise Data Governance Backend

## Overview

This is a comprehensive, enterprise-grade backend system for data governance that implements advanced data management, compliance, security, and analytics capabilities across 7 core data governance groups.

## Architecture

The backend is built with a modular, microservices-ready architecture that includes:

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLModel/SQLAlchemy** - Advanced ORM for database operations
- **PostgreSQL** - Primary relational database
- **Redis** - In-memory caching and session management
- **Elasticsearch** - Search and analytics engine
- **Kafka** - Message broker for event streaming
- **MongoDB** - Document storage for unstructured data
- **Prometheus + Grafana** - Monitoring and visualization

## Data Governance Groups

The system covers 7 comprehensive data governance areas:

1. **Data Classification & Discovery**
2. **Data Quality & Validation**
3. **Data Compliance & Governance**
4. **Data Security & Access Control**
5. **Data Integration & ETL**
6. **Data Analytics & Reporting**
7. **Data Lifecycle & Archival**

## Dependency Solutions

### Option 1: Python 3.11 Compatibility (Immediate Deployment)

**Status**: ✅ **Ready for Production**

This option provides immediate deployment capability with proven stability:

- **Python**: 3.11.x
- **FastAPI**: 0.104.1
- **Pydantic**: 1.10.13
- **SQLModel**: 0.0.14
- **SQLAlchemy**: 1.4.53

**Advantages**:
- ✅ Fully tested and stable
- ✅ All enterprise features working
- ✅ Compatible with existing codebase
- ✅ Ready for immediate containerization

**Use Case**: Production deployment, immediate frontend integration

### Option 2: Modern Stack Migration (Future Enhancement)

**Status**: 🔄 **Future Roadmap**

This option provides enhanced performance and modern features:

- **Python**: 3.12+ / 3.13+
- **FastAPI**: 0.115.0+
- **Pydantic**: 2.11.0+
- **SQLModel**: 0.0.25+
- **SQLAlchemy**: 2.0.23+

**Advantages**:
- 🚀 Enhanced performance
- 🔧 Modern async features
- 📊 Better type safety
- 🎯 Future-proof architecture

**Use Case**: Performance optimization, long-term scalability

## Quick Start

### Prerequisites

- **Python 3.11** (for Option 1)
- **Docker & Docker Compose** (recommended)
- **Git**

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd data_wave/backend/scripts_automation

# Deploy with Docker
./deploy.sh docker

# Or on Windows
.\deploy.ps1 docker
```

### Option 2: Local Deployment

```bash
# Clone the repository
git clone <repository-url>
cd data_wave/backend/scripts_automation

# Deploy locally
./deploy.sh local

# Or on Windows
.\deploy.ps1 local
```

## Deployment Options

### 1. Docker Deployment (Recommended)

```bash
# Start all services
./deploy.sh docker

# Check status
./deploy.sh status

# Stop services
./deploy.sh stop
```

**Services Available**:
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Elasticsearch: http://localhost:9200
- Kafka: localhost:9092
- MongoDB: localhost:27017
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

### 2. Local Deployment

```bash
# Deploy locally
./deploy.sh local

# This will:
# - Create Python virtual environment
# - Install all dependencies
# - Start the application
```

### 3. Modern Stack Preparation

```bash
# Prepare for modern stack migration
./deploy.sh modern

# This creates requirements-modern.txt for future use
```

## API Documentation

Once deployed, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Core Features

### Data Classification & Discovery
- Automated data classification using AI/ML
- Pattern recognition and metadata extraction
- Data lineage tracking and visualization

### Data Quality & Validation
- Rule-based data quality assessment
- Statistical quality metrics
- Automated quality monitoring and alerting

### Data Compliance & Governance
- Regulatory compliance frameworks (GDPR, CCPA, SOX)
- Policy enforcement and audit trails
- Risk assessment and mitigation

### Data Security & Access Control
- Role-based access control (RBAC)
- Data encryption and tokenization
- Security monitoring and threat detection

### Data Integration & ETL
- Multi-source data integration
- Real-time and batch processing
- Data transformation and enrichment

### Data Analytics & Reporting
- Advanced analytics and machine learning
- Custom dashboard creation
- Automated reporting and insights

### Data Lifecycle & Archival
- Data retention policies
- Automated archival and deletion
- Compliance-driven lifecycle management

## Configuration

### Environment Variables

Create a `.env` file in the `app` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/data_governance
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Services
ELASTICSEARCH_URL=http://localhost:9200
KAFKA_BROKERS=localhost:9092
MONGODB_URL=mongodb://localhost:27017

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
```

### Database Configuration

The system supports multiple database backends:

- **PostgreSQL** (Primary)
- **MySQL/MariaDB**
- **MongoDB** (Document storage)
- **Redis** (Caching)

## Development

### Project Structure

```
app/
├── api/                    # API routes and endpoints
│   ├── routes/            # Route definitions
│   └── middleware/        # Custom middleware
├── core/                  # Core configuration and utilities
│   ├── config.py         # Application configuration
│   ├── database.py       # Database connection management
│   └── security.py       # Security and authentication
├── models/                # Data models and schemas
│   ├── __init__.py       # Model imports
│   ├── user_models.py    # User and authentication models
│   └── ...               # Other model files
├── services/              # Business logic services
│   ├── __init__.py       # Service imports
│   ├── user_service.py   # User management service
│   └── ...               # Other service files
├── utils/                 # Utility functions and helpers
└── main.py               # Application entry point
```

### Adding New Features

1. **Create Models**: Define data models in `app/models/`
2. **Create Services**: Implement business logic in `app/services/`
3. **Create Routes**: Define API endpoints in `app/api/routes/`
4. **Update Imports**: Add new components to respective `__init__.py` files

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_user_service.py
```

## Monitoring & Observability

### Health Checks

- **Backend Health**: `GET /health`
- **Database Health**: `GET /health/db`
- **Cache Health**: `GET /health/cache`

### Metrics

- **Prometheus Metrics**: `GET /metrics`
- **Custom Business Metrics**: Available via Prometheus endpoint

### Logging

- **Structured Logging**: JSON format for production
- **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Centralized Logging**: Configurable output destinations

## Security Features

### Authentication & Authorization

- **JWT-based Authentication**
- **Role-Based Access Control (RBAC)**
- **Multi-factor Authentication (MFA)**
- **Session Management**

### Data Protection

- **Data Encryption at Rest**
- **Data Encryption in Transit (TLS)**
- **Tokenization for Sensitive Data**
- **Audit Logging**

### Compliance

- **GDPR Compliance**
- **CCPA Compliance**
- **SOX Compliance**
- **HIPAA Compliance (Healthcare)**

## Performance & Scalability

### Caching Strategy

- **Redis Caching**: Session data, frequently accessed data
- **Application-level Caching**: Business logic results
- **Database Query Caching**: Optimized query results

### Database Optimization

- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed queries and optimized schemas
- **Read Replicas**: Scalable read operations

### Horizontal Scaling

- **Stateless Design**: Easy horizontal scaling
- **Load Balancing**: Multiple backend instances
- **Microservices Ready**: Modular architecture for scaling

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Database Connection**: Check database service status
3. **Port Conflicts**: Verify no other services use required ports
4. **Permission Issues**: Check file permissions and Docker access

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Start with debug mode
uvicorn app.main:app --reload --log-level debug
```

### Log Analysis

```bash
# View application logs
docker logs data_governance_backend

# View database logs
docker logs data_governance_postgres

# View cache logs
docker logs data_governance_redis
```

## Support & Contributing

### Getting Help

1. **Documentation**: Check this README and API docs
2. **Issues**: Report bugs and feature requests
3. **Community**: Join our developer community

### Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new features**
5. **Submit a pull request**

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### Phase 1: Core Platform (Current)
- ✅ Basic data governance functionality
- ✅ User management and authentication
- ✅ Data classification and quality
- ✅ Compliance and security features

### Phase 2: Advanced Features (Q2 2024)
- 🔄 Enhanced AI/ML capabilities
- 🔄 Advanced analytics and reporting
- 🔄 Real-time data processing
- 🔄 Advanced security features

### Phase 3: Enterprise Integration (Q3 2024)
- 🔄 Enterprise SSO integration
- 🔄 Advanced workflow automation
- 🔄 Multi-tenant architecture
- 🔄 Advanced monitoring and alerting

### Phase 4: Cloud & Scale (Q4 2024)
- 🔄 Cloud-native deployment
- 🔄 Auto-scaling capabilities
- 🔄 Advanced disaster recovery
- 🔄 Global distribution

---

**For immediate deployment, use Option 1 (Python 3.11). For future enhancements, prepare for Option 2 (Modern Stack).**

