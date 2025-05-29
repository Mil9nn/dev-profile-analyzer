// backend/src/utils/analyzers/ComponentDetector.js

class ComponentDetector {
    checkReactComponent(node, content, filepath, metrics) {
        if (this.isReactComponent(node, content)) {
            const componentInfo = {
                name: this.getComponentName(node, filepath),
                type: this.getComponentType(node),
                filepath,
                hasProps: this.hasProps(node, content),
                hasState: /this\.state|useState\(|useReducer\(/.test(content),
                hasHooks: /use[A-Z]\w*\(/.test(content),
                size: node.loc ? node.loc.end.line - node.loc.start.line + 1 : 0
            };
            metrics.architecture.components.push(componentInfo);
            console.log(`✅ Detected React component: ${componentInfo.name} in ${filepath}`);
        }
    }

    isReactComponent(node, content) {
        return (
            (node.type === 'FunctionDeclaration' && this.isCapitalized(node.id?.name) && this.containsJSX(content)) ||
            (node.type === 'ClassDeclaration' && this.extendsComponent(node)) ||
            (node.type === 'ArrowFunctionExpression' && this.isCapitalizedArrow(node) && this.containsJSX(content))
        );
    }

    containsJSX(content) {
        // Matches JSX elements like <ComponentName>, <div>, or fragments like <>
        return /<([A-Z][a-zA-Z0-9]*|\s*>)|<\/[a-zA-Z0-9]+>/.test(content) || /return\s*\(?\s*</.test(content);
    }

    isCapitalized(name) {
        return name && name[0] === name[0].toUpperCase();
    }

    extendsComponent(node) {
        const superClass = node.superClass;
        if (superClass) {
            const name = superClass.name || superClass.property?.name;
            return name === 'Component' || name === 'PureComponent';
        }
        return false;
    }

    isCapitalizedArrow(node) {
        const parent = node.parent;
        return parent?.type === 'VariableDeclarator' && this.isCapitalized(parent.id?.name);
    }

    getComponentName(node, filepath) {
        return node.id?.name ||
               node.parent?.id?.name ||
               filepath.split('/').pop().replace(/\.(jsx?|tsx?)$/, '').replace(/^\w/, c => c.toUpperCase());
    }

    getComponentType(node) {
        const types = {
            'FunctionDeclaration': 'Function Component',
            'ArrowFunctionExpression': 'Arrow Function Component',
            'ClassDeclaration': 'Class Component'
        };
        return types[node.type] || 'Unknown';
    }

    hasProps(node, content) {
        return (node.params && node.params.length > 0) || /\bprops\.|{[^}]*}.*=/.test(content);
    }
}

export default ComponentDetector;
