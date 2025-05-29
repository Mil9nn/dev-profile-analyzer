// backend/src/utils/analyzers/ImportAnalyzer.js

class ImportAnalyzer {
    constructor() {
        this.frameworks = {
            'react': 'React',
            'vue': 'Vue.js',
            '@angular': 'Angular',
            'express': 'Express.js',
            'fastify': 'Fastify',
            'next': 'Next.js',
            'nuxt': 'Nuxt.js',
            'svelte': 'Svelte'
        };

        this.databases = {
            'mongoose': 'MongoDB',
            'sequelize': 'SQL/Sequelize',
            'prisma': 'Prisma',
            'firebase': 'Firebase',
            'mysql': 'MySQL',
            'pg': 'PostgreSQL',
            'redis': 'Redis'
        };

        this.utilities = {
            'lodash': 'Lodash',
            'axios': 'Axios',
            'socket.io': 'Socket.IO',
            'joi': 'Validation',
            'yup': 'Validation',
            'bcrypt': 'Security',
            'jsonwebtoken': 'JWT',
            'cors': 'CORS'
        };
    }

    analyzeImport(source, metrics) {
        this.categorizeFramework(source, metrics);
        this.categorizeDatabase(source, metrics);
        this.categorizeUtility(source, metrics);
        this.categorizeExternalLibrary(source, metrics);
    }

    categorizeFramework(source, metrics) {
        for (const [key, value] of Object.entries(this.frameworks)) {
            if (source.includes(key)) {
                metrics.technologies.frameworks.add(value);
                break;
            }
        }
    }

    categorizeDatabase(source, metrics) {
        for (const [key, value] of Object.entries(this.databases)) {
            if (source.includes(key)) {
                metrics.technologies.database.add(value);
                break;
            }
        }
    }

    categorizeUtility(source, metrics) {
        for (const [key, value] of Object.entries(this.utilities)) {
            if (source.includes(key)) {
                metrics.technologies.libraries.add(value);
                break;
            }
        }
    }

    categorizeExternalLibrary(source, metrics) {
        // Add external libraries (not relative imports)
        if (!source.startsWith('.') && !source.startsWith('/')) {
            const libName = source.split('/')[0];
            if (libName.length > 1) {
                metrics.technologies.libraries.add(libName);
            }
        }
    }

    analyzeDependencies(deps, metrics) {
        Object.keys(deps).forEach(dep => {
            this.analyzeImport(dep, metrics);
        });
    }
}

export default ImportAnalyzer;