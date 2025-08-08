# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a full-stack bid management system with:
- FastAPI backend (Python) with PostgreSQL database
- React frontend (TypeScript/JavaScript)
- Business logic for tender and product management
- Margin calculations and visualization

Key business rules:
- Sale price must be greater than cost
- No tender registration without products
- Margin calculation: (price - cost) * quantity

When suggesting code changes:
1. Follow RESTful API patterns for backend endpoints
2. Use proper error handling and validation
3. Implement responsive React components
4. Follow TypeScript best practices for frontend
5. Ensure database relationships are properly maintained
