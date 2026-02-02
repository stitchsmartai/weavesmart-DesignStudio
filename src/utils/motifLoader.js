/**
 * Auto-loads motifs from /public/motifs folder
 * 
 * Naming Convention: {category}-{name}.svg
 * Example: flower-bouquet.svg → category="flower", name="bouquet"
 * 
 * This function:
 * 1. Scans all SVG files in /public/motifs
 * 2. Parses filenames to extract category and name
 * 3. Auto-generates motif objects with proper formatting
 * 4. Groups motifs by category
 */

// List of all motif files (update this when adding new motifs)
// In production, this could be auto-generated at build time
const MOTIF_FILES = [
    'flower-bouquet.svg',
    'leaf-branch.svg',
    'paisley.svg',
    'peacock-detailed.svg',
    'peacock-simple.svg',
];

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
    const motifs = MOTIF_FILES.map(generateMotif);

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
