// backend/src/utils/analyzers/ComponentDetector.js

class ComponentDetector {
    checkReactComponent(node, content, filepath, metrics) {
        if (this.isReactComponent(node, content)) {
            const componentName = this.getComponentName(node);
            const lines = this.getFunctionLines(node);
            
            metrics.architecture.components.push({
                name: componentName,
                type: node.type === 'FunctionDeclaration' ? 'function' : 'arrow',
                file: filepath,
                lines: lines
            });
            
            metrics.technologies.frameworks.add('React');
        }
    }

    isReactComponent(node, content) {
        // Check if function returns JSX or contains JSX
        return content.includes('return (') && (
            content.includes('<') && content.includes('>') ||
            content.includes('jsx') ||
            content.includes('React.createElement')
        );
    }

    getComponentName(node) {
        if (node.type === 'FunctionDeclaration' && node.id?.name) {
            return node.id.name;
        }
        return 'ArrowComponent';
    }

    getFunctionLines(node) {
        if (node.loc) {
            return node.loc.end.line - node.loc.start.line + 1;
        }
        return 10; // default estimate
    }
}

export default ComponentDetector;