# Contributing to ISS Tracker Hub

First off, thank you for considering contributing to ISS Tracker Hub! 🛰️

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming environment. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting a bug, include:**
- Your browser and version
- Operating system
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Console error messages

### 💡 Suggesting Enhancements

We love new ideas! Please open an issue with the "enhancement" label.

**Include:**
- Clear description of the feature
- Why it would be useful
- Possible implementation approach

### 🔧 Pull Requests

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Follow the coding standards below
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/iss-tracker-hub.git
cd iss-tracker-hub

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev

# Run linter
npm run lint
```

## Coding Standards

### JavaScript
- Use ES6+ syntax (const/let, arrow functions, async/await)
- Follow ESLint configuration (.eslintrc.json)
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions small and focused

```javascript
// ✅ Good
/**
 * Calculate distance between two coordinates
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  // Implementation
}

// ❌ Avoid
function calc(a, b, c, d) {
  // What does this do?
}
```

### CSS
- Use CSS custom properties (variables)
- Follow BEM-like naming convention
- Mobile-first responsive design
- Add comments for complex selectors

```css
/* ✅ Good */
.pass-card {
  background: var(--card);
  border-radius: 12px;
}

.pass-card__title {
  font-size: 18px;
  color: var(--accent);
}

/* ❌ Avoid */
.pc { background: #0a0a12; }
.pc > div > span { color: blue; }
```

### File Organization
- UI components in `src/ui/`
- Business logic in `src/services/`
- Utilities in `src/utils/`
- Configuration in `src/constants/`
- Styles in `src/styles/`

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be concise but descriptive
- Reference issues when applicable

```
✅ Add pass notification scheduling
✅ Fix trajectory rendering on 3D globe
✅ Update i18n with German translations (#42)

❌ fixed stuff
❌ updates
```

## Testing

Currently, we don't have automated tests, but please:
- Test your changes in Chrome, Firefox, and Safari
- Test on mobile (responsive design)
- Check console for errors
- Verify offline functionality works

## Questions?

Feel free to open an issue with the "question" label or reach out to the maintainers.

---

Thank you for contributing! 🚀
