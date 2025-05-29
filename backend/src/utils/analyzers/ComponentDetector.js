// ProperComponentArchitectureDetector.js

class ComponentArchitectureDetector {
    constructor() {
        this.components = new Map();
        this.componentRelationships = [];
        this.reusabilityMetrics = {
            reusedComponents: new Set(),
            singleUseComponents: new Set(),
            componentImports: new Map()
        };
    }

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
            const ast = this.parseFile(content);
            const component = {
                name: this.extractComponentName(filepath, ast),
                hasProps: this.hasPropsInterface(ast, content),
                isReusable: this.checkReusability(ast, content),
                hasSingleResponsibility: this.checkSingleResponsibility(ast, content),
                isIndependent: this.checkIndependence(content),
                hasDefinedInterface: this.hasDefinedInterface(ast, content),
                size: this.calculateComponentSize(ast),
                dependencies: this.extractDependencies(ast),
                exports: this.extractExports(ast)
            };
            
            return component;
        } catch (error) {
            console.warn(`Failed to analyze component ${filepath}:`, error.message);
            return null;
        }
    }

    hasPropsInterface(ast, content) {
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

    checkReusability(ast, content) {
        // Component is reusable if it:
        // 1. Accepts configuration through props
        // 2. Doesn't have hardcoded values
        // 3. Doesn't directly access global state
        // 4. Has generic naming
        
        const hasConfigurableProps = this.hasPropsInterface(ast, content);
        const hasHardcodedValues = this.countHardcodedValues(content) > 3;
        const accessesGlobalState = this.checksGlobalStateAccess(content);
        const hasGenericName = this.hasGenericComponentName(content);
        
        return hasConfigurableProps && !hasHardcodedValues && !accessesGlobalState && hasGenericName;
    }

    checkSingleResponsibility(ast, content) {
        // Check if component has a single, clear responsibility
        const functionCount = this.countInternalFunctions(ast);
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

    hasDefinedInterface(ast, content) {
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
        // Check if components properly separate:
        // 1. Presentation logic from business logic
        // 2. State management from UI rendering
        // 3. Data fetching from component rendering
        
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
        // Check for proper composition patterns:
        // 1. Higher-order components
        // 2. Render props
        // 3. Component composition over inheritance
        // 4. Proper prop drilling vs context usage
        
        const compositionPatterns = {
            higherOrderComponents: 0,
            renderProps: 0,
            childrenPattern: 0,
            contextUsage: 0,
            deepPropDrilling: 0
        };
        
        this.components.forEach((component, filepath) => {
            // Analyze each component for composition patterns
            // This would require more detailed AST analysis
        });
        
        return compositionPatterns;
    }

    generateArchitectureScore() {
        const totalComponents = this.components.size;
        const reusedPercentage = this.reusabilityMetrics.reusedComponents.size / totalComponents;
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
        
        // Component composition patterns
        const compositionScore = this.analyzeComponentComposition();
        if (this.hasGoodCompositionPatterns(compositionScore)) score += 1;
        
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

    // Helper methods (simplified implementations)
    parseFile(content) {
        // Would use appropriate parser based on file type
        return {}; // Placeholder
    }

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

    countInternalFunctions(ast) {
        // Count function declarations inside component
        return 0; // Placeholder
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

    extractComponentImports(content) {
        const imports = [];
        const importMatches = content.matchAll(/import\s+(?:{[^}]*}|\w+)\s+from\s+['"][^'"]*['"]/g);
        
        for (const match of importMatches) {
            // Extract component names from imports
            // This would need more sophisticated parsing
        }
        
        return imports;
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
        
        // Add more pattern detection based on analysis
        
        return patterns;
    }
}

export default ComponentArchitectureDetector;