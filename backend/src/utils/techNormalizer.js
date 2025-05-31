// utils/techNormalizer.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const techGroups = require('../config/techGroups.json');

export function normalizeTech(pkg) {
  // Check exceptions first
  if (techGroups.exceptions[pkg]) {
    return techGroups.exceptions[pkg];
  }

  // Check groups
  for (const [group, patterns] of Object.entries(techGroups.groups)) {
    if (patterns.some(pattern => pkg.startsWith(pattern))) {
      return group;
    }
  }

  // Fallback to first segment
  return pkg.split('/')[0].replace(/^@/, '');
}