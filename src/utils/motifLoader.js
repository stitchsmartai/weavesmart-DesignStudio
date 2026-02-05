/**
 * Auto-loads motifs from /public/motifs folder
 * 
 * Naming Convention: {category}-{name}.svg
 * Example: flower-bouquet.svg → category="flower", name="bouquet"
 * 
 * This function:
 * 1. Auto-discovers all SVG files in /public/motifs using Vite's import.meta.glob
 * 2. Parses filenames to extract category and name
 * 3. Auto-generates motif objects with proper formatting
 * 4. Groups motifs by category
 * 
 * ✨ NEW: No need to manually update array - just drop SVG files in /public/motifs!
 */

// Auto-discover all SVG files in /public/motifs folder
// Vite's import.meta.glob scans the folder at build time
const motifModules = import.meta.glob('/public/motifs/*.svg', {
    eager: true,
    as: 'url'
});

/**
 * Converts kebab-case to Title Case
 * Example: "flower-bouquet" → "Flower Bouquet"
 */
function toTitleCase(str) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Parses filename to extract category and name
 * Example: "flower-bouquet.svg" → { category: "flower", name: "bouquet" }
 */
function parseFilename(filename) {
    const nameWithoutExt = filename.replace('.svg', '').replace('.png', '');
    const parts = nameWithoutExt.split('-');

    if (parts.length === 1) {
        // Single word: use as both category and name
        return {
            category: parts[0],
            name: parts[0],
        };
    }

    // First part is category, rest is name
    const category = parts[0];
    const name = parts.slice(1).join('-');

    return { category, name };
}

/**
 * Generates a motif object from filename
 */
function generateMotif(filename) {
    const { category, name } = parseFilename(filename);
    const id = filename.replace('.svg', '').replace('.png', '');

    return {
        id,
        name: toTitleCase(name),
        category,
        thumbnail: `/motifs/${filename}`,
        svg: `/motifs/${filename}`,
        isSvg: filename.endsWith('.svg'),
    };
}

/**
 * Loads all motifs and groups them by category
 */
export function loadMotifs() {
    // Extract filenames from the auto-discovered paths
    const motifPaths = Object.keys(motifModules);

    const motifs = motifPaths.map(path => {
        // Extract filename from path: '/public/motifs/flower-bouquet.svg' → 'flower-bouquet.svg'
        const filename = path.split('/').pop();
        return generateMotif(filename);
    });

    // Group by category
    const categories = {};
    motifs.forEach(motif => {
        if (!categories[motif.category]) {
            categories[motif.category] = {
                name: toTitleCase(motif.category),
                motifs: [],
            };
        }
        categories[motif.category].motifs.push(motif);
    });

    return {
        all: motifs,
        byCategory: categories,
        categories: Object.keys(categories).map(key => ({
            id: key,
            name: categories[key].name,
            count: categories[key].motifs.length,
        })),
    };
}

/**
 * Gets all motifs as a flat array (for backward compatibility)
 */
export function getAllMotifs() {
    return loadMotifs().all;
}

/**
 * Gets motifs grouped by category
 */
export function getMotifsByCategory() {
    return loadMotifs().byCategory;
}

/**
 * Gets list of categories
 */
export function getCategories() {
    return loadMotifs().categories;
}
