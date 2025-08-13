# PurSight Frontend - Enterprise Data Governance UI

## Overview

PurSight Frontend is an enterprise-grade, modern React application that provides a comprehensive user interface for the PurSight Data Governance Platform. Inspired by Microsoft Purview's design language, it offers a sophisticated, accessible, and feature-rich experience for data governance professionals.

The application is built with React, TypeScript, and modern UI libraries, following best practices for enterprise applications. It includes advanced features such as role-based access control (RBAC), machine learning integration, real-time notifications, and interactive data visualizations.

## Architecture

PurSight Frontend follows a modular, component-based architecture with clear separation of concerns. The application is organized into the following key areas:

### Core Architecture Components

1. **API Layer**
   - Centralized API client configuration with Axios
   - Request/response interceptors for authentication and error handling
   - Service modules for different backend endpoints
   - React Query integration for efficient data fetching and caching

2. **State Management**
   - React Context API for global state
   - React Query for server state
   - Custom hooks for reusable state logic
   - Local component state for UI-specific concerns

3. **Routing**
   - React Router for navigation
   - Route-based code splitting for performance
   - Protected routes with RBAC integration
   - Breadcrumb navigation system

4. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Attribute-based access control (ABAC) for fine-grained permissions
   - Permission-based UI rendering

5. **UI Component Library**
   - Modular, reusable components
   - Responsive design for all screen sizes
   - Accessibility compliance (WCAG 2.1)
   - Dark/light theme support
   - Microsoft Purview-inspired design system

6. **Real-time Features**
   - WebSocket integration for live updates
   - Event-driven architecture for notifications
   - Optimistic UI updates for improved UX

### System Flow

1. User authentication through secure login
2. Role and permission loading for RBAC
3. Dashboard presentation with key metrics and insights
4. Navigation to specific modules (Catalog, Lineage, Compliance, etc.)
5. Data interaction with real-time updates and notifications
6. Advanced search and filtering capabilities
7. User profile and preference management

## Features

### 1. Modern UI Framework

- React 19 with TypeScript for type safety
- Tailwind CSS for utility-first styling
- Responsive design for all device sizes
- Dark/light theme support with system preference detection
- Accessibility compliance (WCAG 2.1)
- Performance optimizations (code splitting, lazy loading, memoization)

### 2. Data Catalog Interface

- Hierarchical data source browser
- Advanced search with filters and facets
- Detailed metadata viewing and editing
- Classification and sensitivity labeling
- User comments and annotations
- History and audit trail viewing

### 3. Data Lineage Visualization

- Interactive graph visualization of data lineage
- Zoom, pan, and focus controls
- Entity relationship exploration
- Impact analysis tools
- Export capabilities for documentation
- Integration with Microsoft Purview

### 4. Dashboard & Analytics

- Comprehensive overview dashboard
- Interactive charts and visualizations
- Customizable widgets and layouts
- Trend analysis and historical comparisons
- Export and sharing capabilities
- Real-time updates for key metrics

### 5. Compliance & Governance

- Sensitivity label management
- Compliance reporting and monitoring
- Policy violation alerts and remediation
- Audit trail and activity logging
- Regulatory requirement tracking
- Risk assessment visualization

### 6. Machine Learning Integration

- ML-powered classification suggestions
- Confidence scoring visualization
- Feedback collection for model improvement
- Model performance analytics
- Training history and versioning
- Explainable AI features

### 7. Role-Based Access Control (RBAC)

- User role management
- Permission-based UI rendering
- Access request workflows
- Delegation capabilities
- Attribute-based conditions (ABAC)
- Comprehensive audit logging

### 8. Collaboration Features

- Real-time notifications
- User commenting and discussions
- Task assignment and tracking
- Approval workflows for sensitive operations
- Knowledge sharing and documentation
- Team-based governance

### 9. Advanced Search

- Full-text search across all metadata
- Faceted filtering and sorting
- Saved searches and favorites
- Recent search history
- Search suggestions and autocomplete
- Natural language query capabilities

### 10. User Experience Enhancements

- Guided tours and contextual help
- Keyboard shortcuts for power users
- Customizable user preferences
- Bulk operations for efficiency
- Export capabilities for reporting
- Progressive web app (PWA) support

## Technical Implementation

### Key Technologies

- **React 19**: Core UI library
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling
- **React Query**: Data fetching and caching
- **React Router**: Navigation and routing
- **Axios**: HTTP client
- **D3.js/React Flow**: Data visualization
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **React Testing Library**: Component testing
- **WebSocket**: Real-time communication

### Folder Structure

```
src/
├── api/                # API clients and services
├── components/         # Reusable UI components
│   ├── common/         # Shared components
│   ├── form/           # Form components
│   ├── layout/         # Layout components
│   ├── charts/         # Visualization components
│   ├── tables/         # Table components
│   └── [feature]/      # Feature-specific components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── models/             # TypeScript interfaces and types
├── pages/              # Page components
├── utils/              # Utility functions
├── theme/              # Theme configuration
└── App.tsx            # Application entry point
```

### Custom Hooks

The application includes several custom hooks for common functionality:

- `useAuth`: Authentication state and methods
- `useRBAC`: Role-based access control
- `useCurrentUser`: Current user information
- `useWebSocket`: WebSocket connection management
- `useNotifications`: Notification management
- `useTheme`: Theme switching and preferences
- `useLineage`: Data lineage visualization
- `useSensitivityLabels`: Sensitivity label management
- `useMLFeedback`: Machine learning feedback collection
- `useCompliance`: Compliance reporting and monitoring

## Getting Started

### Prerequisites

- Node.js 18.x or later (recommended to use Node.js 20.x or later)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

### Configuration

The application can be configured through environment variables:

- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_AUTH_DOMAIN`: Authentication domain
- `VITE_AUTH_CLIENT_ID`: Authentication client ID
- `VITE_WEBSOCKET_URL`: WebSocket server URL
- `VITE_ENVIRONMENT`: Environment (development, staging, production)

## Integration with Backend

The frontend integrates with the PurSight backend through a comprehensive API layer. Key integration points include:

1. **Authentication**: JWT-based authentication with refresh token rotation
2. **RBAC**: Role and permission loading for access control
3. **Data Catalog**: API endpoints for browsing and managing data sources
4. **Lineage**: Graph data for visualization and analysis
5. **Dashboard**: Metrics and analytics for visualization
6. **Compliance**: Reporting and monitoring for regulatory requirements
7. **ML Integration**: Classification suggestions and feedback collection

## Best Practices

The application follows these best practices:

1. **Component Design**: Modular, reusable components with clear responsibilities
2. **State Management**: Appropriate use of context, hooks, and local state
3. **Performance**: Code splitting, memoization, and efficient rendering
4. **Accessibility**: WCAG 2.1 compliance for all components
5. **Testing**: Comprehensive unit and integration tests
6. **Error Handling**: Graceful error handling and user feedback
7. **Security**: RBAC, input validation, and secure API communication
8. **Internationalization**: Support for multiple languages
9. **Theming**: Consistent design system with theme support
10. **Documentation**: Comprehensive code and user documentation

## Future Enhancements

1. **Advanced Visualization**: Enhanced data lineage and impact analysis
2. **AI-Powered Search**: Natural language processing for search queries
3. **Mobile Application**: Native mobile experience with React Native
4. **Offline Support**: Enhanced PWA capabilities for offline usage
5. **Advanced Analytics**: Predictive analytics and anomaly detection
6. **Integration Ecosystem**: Connectors for third-party tools and platforms
7. **Collaboration Enhancements**: Real-time co-editing and annotations
8. **Accessibility Improvements**: Enhanced screen reader support and keyboard navigation
9. **Performance Optimizations**: Further optimizations for large datasets
10. **Extended Compliance**: Support for additional regulatory frameworks

## License

This project is licensed under the MIT License - see the LICENSE file for details.