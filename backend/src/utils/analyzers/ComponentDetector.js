// backend/src/utils/analyzers/ComponentDetector.js

class ComponentDetector {
    constructor() {
        this.components = new Map();
        this.componentRelationships = [];
        this.reusabilityMetrics = {
            reusedComponents: new Set(),
            singleUseComponents: new Set(),
            componentImports: new Map()
        };
    }

    // Method that JavaScriptAnalyzer is looking for
    checkReactComponent(node, content, filepath, metrics) {
        if (this.isReactComponent(node, content)) {
            const componentInfo = this.extractReactComponentInfo(node, content, filepath);
            if (componentInfo) {
                metrics.architecture.components.push(componentInfo);
                console.log(`✅ Detected React component: ${componentInfo.name} in ${filepath}`);
            }
        }
    }

    isReactComponent(node, content) {
        // Check if this is a React component
        return (
            // Function component returning JSX
            this.isFunctionReturningJSX(node, content) ||
            // Class component extending React.Component
            this.isClassComponent(node, content) ||
            // Arrow function returning JSX
            this.isArrowFunctionReturningJSX(node, content)
        );
    }

    isFunctionReturningJSX(node, content) {
        if (node.type !== 'FunctionDeclaration') return false;
        
        // Check if function name starts with capital letter (React convention)
        const name = node.id?.name;
        if (!name || name[0] !== name[0].toUpperCase()) return false;
        
        // Check if content contains JSX patterns
        return this.containsJSX(content);
    }

    isClassComponent(node, content) {
        if (node.type !== 'ClassDeclaration') return false;
        
        // Check if extends React.Component or Component
        const superClass = node.superClass;
        if (superClass) {
            const superClassName = superClass.name || 
                (superClass.property && superClass.property.name);
            return superClassName === 'Component' || 
                   superClassName === 'PureComponent';
        }
        
        return false;
    }

    isArrowFunctionReturningJSX(node, content) {
        if (node.type !== 'ArrowFunctionExpression') return false;
        
        // Check if this arrow function is assigned to a capitalized variable
        const parent = node.parent;
        if (parent && parent.type === 'VariableDeclarator') {
            const name = parent.id?.name;
            if (name && name[0] === name[0].toUpperCase()) {
                return this.containsJSX(content);
            }
        }
        
        return false;
    }

    containsJSX(content) {
        return (
            // JSX elements
            /<[A-Z][a-zA-Z0-9]*/.test(content) ||
            // JSX fragments
            /<>|<\/>/.test(content) ||
            // Common JSX patterns
            /return\s*\(?\s*</.test(content) ||
            // JSX with props
            /<\w+\s+\w+={/.test(content)
        );
    }

    extractReactComponentInfo(node, content, filepath) {
        const name = this.getComponentName(node, filepath);
        
        return {
            name,
            type: this.getComponentType(node),
            filepath,
            hasProps: this.hasPropsParameter(node, content),
            hasState: this.hasState(content),
            hasHooks: this.hasHooks(content),
            size: this.getComponentSize(node),
            dependencies: this.getComponentDependencies(content)
        };
    }

    getComponentName(node, filepath) {
        // Try to get name from node
        if (node.id && node.id.name) {
            return node.id.name;
        }
        
        // Try to get name from variable declarator (for arrow functions)
        if (node.parent && node.parent.type === 'VariableDeclarator') {
            return node.parent.id.name;
        }
        
        // Fallback to filename
        const filename = filepath.split('/').pop().replace(/\.(jsx?|tsx?)$/, '');
        return filename.charAt(0).toUpperCase() + filename.slice(1);
    }

    getComponentType(node) {
        if (node.type === 'FunctionDeclaration') return 'Function Component';
        if (node.type === 'ArrowFunctionExpression') return 'Arrow Function Component';
        if (node.type === 'ClassDeclaration') return 'Class Component';
        return 'Unknown';
    }

    hasPropsParameter(node, content) {
        // Check function parameters
        if (node.params && node.params.length > 0) {
            const firstParam = node.params[0];
            return firstParam.name === 'props' || firstParam.type === 'ObjectPattern';
        }
        
        // Check content for props usage
        return /\bprops\.|{[^}]*}.*=/.test(content);
    }

    hasState(content) {
        return (
            // Class component state
            /this\.state/.test(content) ||
            // useState hook
            /useState\(/.test(content) ||
            // useReducer hook
            /useReducer\(/.test(content)
        );
    }

    hasHooks(content) {
        const hookPatterns = [
            /useState\(/,
            /useEffect\(/,
            /useContext\(/,
            /useReducer\(/,
            /useCallback\(/,
            /useMemo\(/,
            /useRef\(/,
            /use[A-Z]\w+\(/  // Custom hooks
        ];
        
        return hookPatterns.some(pattern => pattern.test(content));
    }

    getComponentSize(node) {
        if (node.loc) {
            return node.loc.end.line - node.loc.start.line + 1;
        }
        return 0;
    }

    getComponentDependencies(content) {
        const dependencies = [];
        
        // Extract import statements
        const importRegex = /import\s+(?:{[^}]*}|\w+)\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];
            if (!importPath.startsWith('.')) {
                dependencies.push(importPath);
            }
        }
        
        return dependencies;
    }

    // Original methods from ComponentArchitectureDetector
    analyzeComponentArchitecture(files) {
        // Step 1: Identify actual components (not just JSX)
        this.identifyComponents(files);
        
        // Step 2: Analyze component relationships and dependencies
        this.analyzeComponentRelationships(files);
        
        // Step 3: Check for reusability patterns
        this.analyzeReusability(files);
        
        // Step 4: Evaluate separation of concerns
        this.analyzeSeparationOfConcerns();
        
        // Step 5: Check for proper component composition
        this.analyzeComponentComposition();
        
        return this.generateArchitectureScore();
    }

    identifyComponents(files) {
        for (const [filepath, content] of Object.entries(files)) {
            if (!this.isComponentFile(filepath)) continue;
            
            const component = this.extractComponentInfo(filepath, content);
            if (component && this.isActualComponent(component)) {
                this.components.set(filepath, component);
            }
        }
    }

    isComponentFile(filepath) {
        // More sophisticated component file detection
        return (
            // React component files
            /components?\/.*\.(jsx?|tsx?)$/i.test(filepath) ||
            // Vue component files
            /\.vue$/i.test(filepath) ||
            // Angular component files
            /\.component\.(ts|js)$/i.test(filepath) ||
            // Svelte component files
            /\.svelte$/i.test(filepath) ||
            // Generic component patterns
            /(?:ui|widgets?|elements?)\/.*\.(jsx?|tsx?)$/i.test(filepath)
        );
    }

    isActualComponent(component) {
        const criteria = {
            hasProps: component.hasProps,
            isReusable: component.isReusable,
            hasSingleResponsibility: component.hasSingleResponsibility,
            isIndependent: component.isIndependent,
            hasDefinedInterface: component.hasDefinedInterface
        };

        // A component should meet at least 3 of these criteria
        const score = Object.values(criteria).filter(Boolean).length;
        return score >= 3;
    }

    extractComponentInfo(filepath, content) {
        try {
            const component = {
                name: this.extractComponentName(filepath, content),
                hasProps: this.hasPropsInterface(content),
                isReusable: this.checkReusability(content),
                hasSingleResponsibility: this.checkSingleResponsibility(content),
                isIndependent: this.checkIndependence(content),
                hasDefinedInterface: this.hasDefinedInterface(content),
                size: this.calculateComponentSize(content),
                dependencies: this.extractDependencies(content),
                exports: this.extractExports(content)
            };
            
            return component;
        } catch (error) {
            console.warn(`Failed to analyze component ${filepath}:`, error.message);
            return null;
        }
    }

    extractComponentName(filepath, content) {
        // Try to find export default component name
        const exportMatch = content.match(/export\s+default\s+(\w+)/);
        if (exportMatch) {
            return exportMatch[1];
        }
        
        // Try to find function/class component name
        const componentMatch = content.match(/(?:function|class|const)\s+([A-Z]\w+)/);
        if (componentMatch) {
            return componentMatch[1];
        }
        
        // Fallback to filename
        const filename = filepath.split('/').pop().replace(/\.(jsx?|tsx?)$/, '');
        return filename.charAt(0).toUpperCase() + filename.slice(1);
    }

    hasPropsInterface(content) {
        // Check for props parameter, PropTypes, TypeScript interfaces, etc.
        return (
            // Function component with props parameter
            /function\s+\w+\s*\(\s*props\s*\)/.test(content) ||
            /const\s+\w+\s*=\s*\(\s*props\s*\)/.test(content) ||
            // Destructured props
            /\(\s*{[^}]+}\s*\)/.test(content) ||
            // PropTypes definition
            content.includes('.propTypes') ||
            // TypeScript interface
            /interface\s+\w*Props/.test(content) ||
            // Vue props
            content.includes('props:')
        );
    }

    checkReusability(content) {
        // Component is reusable if it:
        // 1. Accepts configuration through props
        // 2. Doesn't have hardcoded values
        // 3. Doesn't directly access global state
        // 4. Has generic naming
        
        const hasConfigurableProps = this.hasPropsInterface(content);
        const hasHardcodedValues = this.countHardcodedValues(content) > 3;
        const accessesGlobalState = this.checksGlobalStateAccess(content);
        const hasGenericName = this.hasGenericComponentName(content);
        
        return hasConfigurableProps && !hasHardcodedValues && !accessesGlobalState && hasGenericName;
    }

    checkSingleResponsibility(content) {
        // Check if component has a single, clear responsibility
        const functionCount = this.countInternalFunctions(content);
        const stateVariables = this.countStateVariables(content);
        const componentSize = content.split('\n').length;
        
        // Heuristics for single responsibility
        return (
            functionCount <= 3 &&           // Not too many internal functions
            stateVariables <= 2 &&          // Not managing too much state
            componentSize <= 100 &&         // Reasonable size
            !this.hasMixedConcerns(content) // Doesn't mix UI and business logic
        );
    }

    checkIndependence(content) {
        // Component is independent if it doesn't tightly couple to:
        // 1. Specific parent components
        // 2. Global application state (beyond props)
        // 3. Specific routing
        // 4. Hard-coded external services
        
        const hasParentCoupling = /useContext|connect\(/.test(content);
        const hasRoutingCoupling = /useRouter|useNavigate|this\.\$route/.test(content);
        const hasServiceCoupling = /fetch\(|axios\.|api\./.test(content);
        
        return !hasParentCoupling && !hasRoutingCoupling && !hasServiceCoupling;
    }

    hasDefinedInterface(content) {
        // Check for clear component interface definition
        return (
            // TypeScript interfaces
            /interface\s+\w*Props/.test(content) ||
            // PropTypes
            content.includes('.propTypes') ||
            // JSDoc comments with @param
            /@param/.test(content) ||
            // Vue props with types
            /props:\s*{[\s\S]*type:/.test(content) ||
            // Clear parameter destructuring
            /\(\s*{\s*\w+[^}]*}\s*\)/.test(content)
        );
    }

    // Helper method implementations
    countHardcodedValues(content) {
        // Count string literals, magic numbers, etc.
        const stringLiterals = (content.match(/["'`][^"'`]*["'`]/g) || []).length;
        const numbers = (content.match(/\b\d+\b/g) || []).length;
        return stringLiterals + numbers;
    }

    checksGlobalStateAccess(content) {
        return /useSelector|connect|vuex|store\./i.test(content);
    }

    hasGenericComponentName(content) {
        // Check if component name is not too specific to one use case
        const specificPatterns = /UserProfile|LoginForm|CheckoutButton|HomePage/;
        return !specificPatterns.test(content);
    }

    countInternalFunctions(content) {
        // Count function declarations inside component
        const functionMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)\s*=>|function)/g) || [];
        return functionMatches.length;
    }

    countStateVariables(content) {
        const useState = (content.match(/useState\(/g) || []).length;
        const data = (content.match(/data\(\)/g) || []).length;
        return useState + data;
    }

    hasMixedConcerns(content) {
        const hasDataFetching = /fetch\(|axios\.|useEffect.*fetch/s.test(content);
        const hasBusinessLogic = /calculate|validate|process|transform/i.test(content);
        const hasUILogic = /render|return.*</s.test(content);
        
        // Mixed concerns if it has multiple types
        return [hasDataFetching, hasBusinessLogic, hasUILogic].filter(Boolean).length > 1;
    }

    extractDependencies(content) {
        const dependencies = [];
        const importRegex = /import\s+(?:{[^}]*}|\w+)\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            dependencies.push(match[1]);
        }
        
        return dependencies;
    }

    extractExports(content) {
        const exports = [];
        const exportRegex = /export\s+(?:default\s+)?(?:function|class|const)\s+(\w+)/g;
        let match;
        
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
        
        return exports;
    }

    calculateComponentSize(content) {
        return content.split('\n').length;
    }

    // Additional methods for component architecture analysis
    analyzeComponentRelationships(files) {
        for (const [filepath, content] of Object.entries(files)) {
            const imports = this.extractComponentImports(content);
            const componentName = this.getComponentNameFromPath(filepath);
            
            imports.forEach(importedComponent => {
                this.componentRelationships.push({
                    parent: componentName,
                    child: importedComponent,
                    file: filepath
                });
            });
        }
    }

    analyzeReusability(files) {
        // Track which components are imported/used multiple times
        const componentUsage = new Map();
        
        for (const [filepath, content] of Object.entries(files)) {
            const imports = this.extractComponentImports(content);
            
            imports.forEach(componentName => {
                if (!componentUsage.has(componentName)) {
                    componentUsage.set(componentName, []);
                }
                componentUsage.get(componentName).push(filepath);
            });
        }
        
        // Categorize components by reusability
        componentUsage.forEach((usages, componentName) => {
            if (usages.length > 1) {
                this.reusabilityMetrics.reusedComponents.add(componentName);
            } else {
                this.reusabilityMetrics.singleUseComponents.add(componentName);
            }
        });
    }

    analyzeSeparationOfConcerns() {
        // Check if components properly separate concerns
        const concerns = {
            presentation: 0,
            business: 0,
            dataFetching: 0,
            routing: 0,
            mixed: 0
        };
        
        this.components.forEach((component, filepath) => {
            const concernType = this.identifyPrimaryConcern(component);
            concerns[concernType]++;
        });
        
        // Good separation means fewer mixed concerns
        return {
            ...concerns,
            separationScore: concerns.mixed < (this.components.size * 0.3) ? 'Good' : 'Poor'
        };
    }

    analyzeComponentComposition() {
        // Check for proper composition patterns
        const compositionPatterns = {
            higherOrderComponents: 0,
            renderProps: 0,
            childrenPattern: 0,
            contextUsage: 0,
            deepPropDrilling: 0
        };
        
        // This would require more detailed analysis
        return compositionPatterns;
    }

    generateArchitectureScore() {
        const totalComponents = this.components.size;
        const reusedPercentage = totalComponents > 0 ? 
            this.reusabilityMetrics.reusedComponents.size / totalComponents : 0;
        const separationAnalysis = this.analyzeSeparationOfConcerns();
        
        let score = 1; // Base score
        
        // Component count and quality
        if (totalComponents > 10 && this.averageComponentQuality() > 0.7) {
            score += 3; // Excellent component architecture
        } else if (totalComponents > 5 && this.averageComponentQuality() > 0.5) {
            score += 2; // Good component architecture
        } else if (totalComponents > 2) {
            score += 1; // Basic component architecture
        }
        
        // Reusability bonus
        if (reusedPercentage > 0.3) score += 1;
        
        // Separation of concerns bonus
        if (separationAnalysis.separationScore === 'Good') score += 1;
        
        return {
            score: Math.min(score, 10),
            totalComponents,
            reusedComponents: this.reusabilityMetrics.reusedComponents.size,
            singleUseComponents: this.reusabilityMetrics.singleUseComponents.size,
            reusabilityPercentage: Math.round(reusedPercentage * 100),
            separationOfConcerns: separationAnalysis.separationScore,
            averageComponentQuality: this.averageComponentQuality(),
            architecturePatterns: this.identifyArchitecturePatterns()
        };
    }

    // Helper methods
    extractComponentImports(content) {
        const imports = [];
        const importRegex = /import\s+(?:{[^}]*}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            const importedName = match[1];
            const importPath = match[2];
            
            // Check if it's a component import (starts with capital letter)
            if (importedName && importedName[0] === importedName[0].toUpperCase()) {
                imports.push(importedName);
            }
        }
        
        return imports;
    }

    getComponentNameFromPath(filepath) {
        const filename = filepath.split('/').pop().replace(/\.(jsx?|tsx?)$/, '');
        return filename.charAt(0).toUpperCase() + filename.slice(1);
    }

    identifyPrimaryConcern(component) {
        // Analyze component to identify its primary concern
        // This is a simplified implementation
        return 'presentation'; // Default to presentation
    }

    averageComponentQuality() {
        if (this.components.size === 0) return 0;
        
        let totalQuality = 0;
        this.components.forEach(component => {
            const qualityFactors = [
                component.hasProps,
                component.isReusable,
                component.hasSingleResponsibility,
                component.isIndependent,
                component.hasDefinedInterface
            ];
            totalQuality += qualityFactors.filter(Boolean).length / qualityFactors.length;
        });
        
        return totalQuality / this.components.size;
    }

    identifyArchitecturePatterns() {
        const patterns = [];
        
        if (this.reusabilityMetrics.reusedComponents.size > 0) {
            patterns.push('Component Reusability');
        }
        
        if (this.componentRelationships.length > 5) {
            patterns.push('Component Composition');
        }
        
        return patterns;
    }
}

export default ComponentDetector;