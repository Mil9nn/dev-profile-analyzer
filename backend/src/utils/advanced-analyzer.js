// utils/advanced-analyzer.js - Advanced AST analysis patterns
const traverse = require('@babel/traverse').default;

class AdvancedPatternDetector {
  constructor() {
    this.patterns = {
      // Frontend Patterns
      stateManagement: [],
      reactPatterns: [],
      performanceOptimizations: [],
      architecturalPatterns: [],
      
      // Backend Patterns
      designPatterns: [],
      securityPatterns: [],
      databasePatterns: [],
      apiPatterns: []
    };
  }

  detectReactPatterns(ast, filename) {
    const patterns = [];
    
    traverse(ast, {
      // Custom Hooks Detection
      FunctionDeclaration: (path) => {
        const name = path.node.id?.name;
        if (name && name.startsWith('use') && name.length > 3) {
          patterns.push({
            type: 'custom-hook',
            name: name,
            complexity: this.calculateFunctionComplexity(path.node)
          });
        }
      },

      // Higher-Order Components
      CallExpression: (path) => {
        const callee = path.node.callee;
        if (callee.name === 'withRouter' || 
            callee.name === 'connect' ||
            (callee.type === 'Identifier' && callee.name.startsWith('with'))) {
          patterns.push({ type: 'hoc', name: callee.name });
        }
      },

      // React.memo usage
      MemberExpression: (path) => {
        if (path.node.object.name === 'React' && path.node.property.name === 'memo') {
          patterns.push({ type: 'performance-optimization', pattern: 'React.memo' });
        }
      },

      // useCallback and useMemo
      CallExpression: (path) => {
        const callee = path.node.callee;
        if (callee.name === 'useCallback' || callee.name === 'useMemo') {
          patterns.push({ 
            type: 'performance-optimization', 
            pattern: callee.name,
            dependencies: path.node.arguments[1]?.elements?.length || 0
          });
        }
      },

      // Context API Usage
      JSXElement: (path) => {
        const elementName = path.node.openingElement.name.name;
        if (elementName && elementName.includes('Provider')) {
          patterns.push({ type: 'state-management', pattern: 'Context API' });
        }
      },

      // Error Boundaries
      ClassDeclaration: (path) => {
        const methods = path.node.body.body.filter(item => item.type === 'MethodDefinition');
        const hasErrorBoundary = methods.some(method => 
          method.key.name === 'componentDidCatch' || 
          method.key.name === 'getDerivedStateFromError'
        );
        
        if (hasErrorBoundary) {
          patterns.push({ type: 'error-handling', pattern: 'Error Boundary' });
        }
      }
    });

    return patterns;
  }

  detectBackendPatterns(ast, filename) {
    const patterns = [];
    
    traverse(ast, {
      // Middleware Pattern
      CallExpression: (path) => {
        const callee = path.node.callee;
        if (callee.type === 'MemberExpression' && 
            callee.object.name === 'app' && 
            callee.property.name === 'use') {
          patterns.push({ type: 'middleware', pattern: 'Express Middleware' });
        }
      },

      // Authentication Patterns
      FunctionDeclaration: (path) => {
        const name = path.node.id?.name;
        if (name && (name.includes('auth') || name.includes('Auth') || 
                    name.includes('jwt') || name.includes('JWT'))) {
          patterns.push({ type: 'security', pattern: 'Authentication Handler' });
        }
      },

      // Database Patterns
      CallExpression: (path) => {
        const callee = path.node.callee;
        
        // Mongoose patterns
        if (callee.type === 'MemberExpression' && 
            (callee.property.name === 'find' || 
             callee.property.name === 'findOne' ||
             callee.property.name === 'create' ||
             callee.property.name === 'updateOne')) {
          patterns.push({ type: 'database', pattern: 'Mongoose ODM' });
        }

        // Prisma patterns
        if (callee.type === 'MemberExpression' && 
            callee.object.name === 'prisma') {
          patterns.push({ type: 'database', pattern: 'Prisma ORM' });
        }
      },

      // Error Handling Patterns
      TryStatement: (path) => {
        patterns.push({ 
          type: 'error-handling', 
          pattern: 'Try-Catch',
          hasFinally: !!path.node.finalizer
        });
      },

      // Async/Await Patterns
      FunctionDeclaration: (path) => {
        if (path.node.async) {
          patterns.push({ 
            type: 'async-patterns', 
            pattern: 'Async Function',
            name: path.node.id?.name
          });
        }
      },

      // Validation Patterns
      CallExpression: (path) => {
        const callee = path.node.callee;
        if (callee.name === 'validate' || 
            (callee.type === 'MemberExpression' && 
             callee.property.name === 'validate')) {
          patterns.push({ type: 'validation', pattern: 'Input Validation' });
        }
      }
    });

    return patterns;
  }

  detectArchitecturalPatterns(ast, filename) {
    const patterns = [];
    
    traverse(ast, {
      // Module Patterns
      ExportNamedDeclaration: (path) => {
        patterns.push({ type: 'module-pattern', pattern: 'Named Export' });
      },

      ExportDefaultDeclaration: (path) => {
        patterns.push({ type: 'module-pattern', pattern: 'Default Export' });
      },

      // Factory Pattern
      FunctionDeclaration: (path) => {
        const name = path.node.id?.name;
        if (name && (name.startsWith('create') || name.startsWith('make'))) {
          patterns.push({ type: 'design-pattern', pattern: 'Factory Pattern' });
        }
      },

      // Observer Pattern (Event Listeners)
      CallExpression: (path) => {
        const callee = path.node.callee;
        if (callee.type === 'MemberExpression' && 
            (callee.property.name === 'addEventListener' ||
             callee.property.name === 'on' ||
             callee.property.name === 'emit')) {
          patterns.push({ type: 'design-pattern', pattern: 'Observer Pattern' });
        }
      }
    });

    return patterns;
  }

  calculateFunctionComplexity(functionNode) {
    let complexity = 1; // Base complexity
    
    // Add complexity for each decision point
    traverse(functionNode, {
      IfStatement: () => complexity++,
      ConditionalExpression: () => complexity++,
      LogicalExpression: () => complexity++,
      SwitchCase: () => complexity++,
      ForStatement: () => complexity++,
      WhileStatement: () => complexity++,
      DoWhileStatement: () => complexity++,
      ForInStatement: () => complexity++,
      ForOfStatement: () => complexity++,
      CatchClause: () => complexity++
    });

    return complexity;
  }

  analyzeCodeQuality(ast, filename) {
    const quality = {
      score: 10,
      issues: [],
      strengths: []
    };

    traverse(ast, {
      // Long parameter lists
      FunctionDeclaration: (path) => {
        if (path.node.params.length > 5) {
          quality.score -= 0.5;
          quality.issues.push(`Function ${path.node.id?.name} has too many parameters`);
        }
      },

      // Nested function depth
      FunctionDeclaration: {
        enter: (path) => {
          const depth = this.calculateNestingDepth(path);
          if (depth > 4) {
            quality.score -= 1;
            quality.issues.push(`Function ${path.node.id?.name} is too deeply nested`);
          }
        }
      },

      // Magic numbers
      Literal: (path) => {
        if (typeof path.node.value === 'number' && 
            path.node.value > 1 && 
            !this.isInConstantDeclaration(path)) {
          quality.issues.push(`Magic number found: ${path.node.value}`);
        }
      },

      // TODO comments
      enter: (path) => {
        const comments = path.node.leadingComments || [];
        comments.forEach(comment => {
          if (comment.value.toLowerCase().includes('todo')) {
            quality.issues.push('TODO comment found - incomplete implementation');
          }
        });
      }
    });

    // Add strengths
    if (quality.issues.length === 0) {
      quality.strengths.push('Clean code with no obvious issues');
    }
    if (quality.score > 8) {
      quality.strengths.push('High code quality maintained');
    }

    return quality;
  }

  calculateNestingDepth(path) {
    let depth = 0;
    let current = path.parent;
    
    while (current) {
      if (current.type === 'BlockStatement' || 
          current.type === 'IfStatement' ||
          current.type === 'ForStatement' ||
          current.type === 'WhileStatement') {
        depth++;
      }
      current = current.parent;
    }
    
    return depth;
  }

  isInConstantDeclaration(path) {
    let parent = path.parent;
    while (parent) {
      if (parent.type === 'VariableDeclarator' && 
          parent.id.name && 
          parent.id.name.toUpperCase() === parent.id.name) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  generateDetailedReport(allPatterns) {
    return {
      summary: {
        totalPatterns: Object.values(allPatterns).flat().length,
        categories: Object.keys(allPatterns).length,
        complexity: this.calculateOverallComplexity(allPatterns)
      },
      patterns: allPatterns,
      recommendations: this.generateRecommendations(allPatterns)
    };
  }

  calculateOverallComplexity(patterns) {
    // Simple complexity calculation based on pattern types
    const weights = {
      'custom-hook': 3,
      'hoc': 4,
      'performance-optimization': 3,
      'error-handling': 2,
      'middleware': 2,
      'security': 4,
      'database': 2,
      'async-patterns': 2
    };

    let totalComplexity = 0;
    Object.values(patterns).flat().forEach(pattern => {
      totalComplexity += weights[pattern.type] || 1;
    });

    return totalComplexity;
  }

  generateRecommendations(patterns) {
    const recommendations = [];
    const patternTypes = Object.values(patterns).flat().map(p => p.type);
    
    if (!patternTypes.includes('error-handling')) {
      recommendations.push('Add comprehensive error handling');
    }
    
    if (!patternTypes.includes('performance-optimization')) {
      recommendations.push('Consider performance optimizations like React.memo or useMemo');
    }
    
    if (!patternTypes.includes('security')) {
      recommendations.push('Implement security best practices');
    }
    
    if (patternTypes.filter(t => t === 'custom-hook').length < 2) {
      recommendations.push('Create more reusable custom hooks');
    }

    return recommendations;
  }
}

module.exports = AdvancedPatternDetector;