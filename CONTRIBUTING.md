# Contributing to Kanban Task Management

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/gdg-srm-kanban.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `npm test`
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Build for production
npm run build
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `npm run lint` before committing
- Write tests for new features
- Keep components small and focused

## Testing

- Write unit tests for components using Vitest and React Testing Library
- Write property-based tests for complex logic using fast-check
- Ensure all tests pass before submitting a PR
- Aim for high test coverage

## Commit Messages

Follow conventional commit format:

- `feat: Add new feature`
- `fix: Fix bug`
- `docs: Update documentation`
- `style: Format code`
- `refactor: Refactor code`
- `test: Add tests`
- `chore: Update dependencies`

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Ensure all tests pass
3. Update documentation as needed
4. Request review from maintainers

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing! 🎉
