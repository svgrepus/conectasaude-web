# Copilot Instructions - ConectaSaúde React Native Frontend

## Project Overview
ConectaSaúde is a comprehensive municipal health management system with a complete Supabase backend and React Native frontend for cross-platform deployment (web and mobile).

## Technical Stack
- **Frontend**: React Native with TypeScript
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State Management**: React Query/TanStack Query
- **Navigation**: React Navigation v6
- **UI Components**: React Native Elements or NativeBase
- **Authentication**: Supabase Auth
- **Platform**: Cross-platform (iOS, Android, Web)

## Project Structure
```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/          # API services (Supabase)
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── constants/         # App constants
└── assets/            # Images, fonts, etc.
```

## Backend API Context
The system has a complete Supabase backend with:
- 25+ database tables for municipal health management
- Comprehensive CRUD operations via PostgREST
- Edge Functions for complex business logic
- Brazilian CPF validation
- Complete authentication system
- File upload capabilities
- Audit trails and soft delete patterns

Key endpoints include:
- `/municipes` - Citizen management
- `/funcionarios` - Employee management
- `/consultas` - Medical appointments
- `/exames` - Medical exams
- `/medicamentos` - Medication management
- `/farmacia` - Pharmacy operations

## Development Guidelines

### Code Style
- Use TypeScript for all code
- Follow React Native best practices
- Implement proper error handling
- Use functional components with hooks
- Maintain cross-platform compatibility

### State Management
- Use React Query for server state
- Implement optimistic updates
- Cache data appropriately
- Handle offline scenarios

### Navigation
- Implement bottom tab navigation for main sections
- Use stack navigation for detailed flows
- Handle deep linking
- Implement proper back navigation

### UI/UX
- Follow Material Design principles
- Implement responsive design
- Ensure accessibility compliance
- Maintain consistent theming
- Support dark/light mode

### API Integration
- Use Supabase client for all backend communication
- Implement proper authentication flows
- Handle API errors gracefully
- Implement retry mechanisms
- Use real-time subscriptions where appropriate

### Performance
- Implement lazy loading
- Optimize image handling
- Use FlatList for large datasets
- Implement proper memoization
- Monitor bundle size

### Security
- Never expose API keys in client code
- Implement proper authentication checks
- Validate all user inputs
- Use Row Level Security (RLS) policies
- Handle sensitive data appropriately

## Key Features to Implement
1. **Authentication System**
   - Login/logout flows
   - Role-based access control
   - Session management

2. **Citizen Management**
   - Registration and profile management
   - Photo upload functionality
   - Document management

3. **Healthcare Operations**
   - Appointment scheduling
   - Medical exam requests
   - Prescription management
   - Medical history tracking

4. **Administrative Functions**
   - Employee management
   - Reporting dashboards
   - System configuration

5. **Mobile-Specific Features**
   - Camera integration for photo capture
   - Location services
   - Push notifications
   - Offline capabilities

## Environment Configuration
- Development, staging, and production environments
- Proper Supabase project configuration
- Environment variable management
- Build configuration for different platforms

## Testing Strategy
- Unit tests with Jest
- Component testing with React Native Testing Library
- E2E testing with Detox
- API integration tests

## Deployment
- Web deployment via Expo Web
- iOS deployment via App Store
- Android deployment via Play Store
- Continuous integration/deployment setup

## Important Notes
- This project is based on existing FRONTStitch designs that need to be converted to React Native
- Cross-platform compatibility is essential for future mobile deployment
- The backend API is fully functional and documented
- All Brazilian regulations and validations are already implemented in the backend
- Focus on maintaining design consistency from the original FRONTStitch implementation
