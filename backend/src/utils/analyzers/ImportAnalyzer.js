// backend/src/utils/analyzers/ImportAnalyzer.js

class ImportAnalyzer {
    constructor() {
        this.categories = {
            frameworks: {
                'react': 'React', 'vue': 'Vue.js', '@angular': 'Angular', 'express': 'Express.js',
                'fastify': 'Fastify', 'next': 'Next.js', 'nuxt': 'Nuxt.js', 'svelte': 'Svelte'
            },
            databases: {
                'mongoose': 'MongoDB', 'sequelize': 'SQL/Sequelize', 'prisma': 'Prisma',
                'firebase': 'Firebase', 'mysql': 'MySQL', 'pg': 'PostgreSQL', 'redis': 'Redis'
            },
            utilities: {
                'lodash': 'Lodash', 'axios': 'Axios', 'socket.io': 'Socket.IO',
                'joi': 'Validation', 'yup': 'Validation', 'bcrypt': 'Security',
                'jsonwebtoken': 'JWT', 'cors': 'CORS'
            }
        };
    }

    analyzeImport(source, metrics) {
        // Check each category
        Object.entries(this.categories).forEach(([category, mapping]) => {
            Object.entries(mapping).forEach(([key, value]) => {
                if (source.includes(key)) {
                    if (category === 'frameworks') metrics.technologies.frameworks.add(value);
                    else if (category === 'databases') metrics.technologies.database.add(value);
                    else metrics.technologies.libraries.add(value);
                }
            });
        });

        // Add external libraries
        if (!source.startsWith('.') && !source.startsWith('/')) {
            const libName = source.split('/')[0];
            if (libName.length > 1) {
                metrics.technologies.libraries.add(libName);
            }
        }
    }

    analyzeDependencies(deps, metrics) {
        Object.keys(deps).forEach(dep => this.analyzeImport(dep, metrics));
    }
}

export default ImportAnalyzer;