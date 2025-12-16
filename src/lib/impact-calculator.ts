/**
 * Food Impact Points (FIP) Calculation System
 * 
 * This module calculates environmental impact scores for food donations
 * based on category, unit, and quantity.
 * 
 * @see docs/IMPACT_MEASUREMENT_SYSTEM.md for full methodology
 */

export interface ImpactMatrixEntry {
    avgWeight: number;        // Average weight in kilograms
    impactMultiplier: number; // Environmental impact factor (0-1)
}

export interface ImpactMatrix {
    [category: string]: {
        [unit: string]: ImpactMatrixEntry;
    };
}

/**
 * Food Impact Matrix
 * Maps food category + unit combinations to weight estimates and impact multipliers
 * 
 * Weight sources: Malaysian dietary studies, WHO guidelines, industry standards
 * Multiplier rationale: Based on carbon footprint, perishability, nutritional value
 */
export const FOOD_IMPACT_MATRIX: ImpactMatrix = {
    'Meals': {
        'portions': { avgWeight: 0.35, impactMultiplier: 1.0 },  // 350g per portion
        'pax': { avgWeight: 0.35, impactMultiplier: 1.0 },       // 350g per person
        'boxes': { avgWeight: 0.5, impactMultiplier: 1.0 },      // 500g bento box
        'pieces': { avgWeight: 0.35, impactMultiplier: 1.0 },    // 350g per piece
    },
    'Bakery': {
        'portions': { avgWeight: 0.15, impactMultiplier: 0.8 },  // 150g slice
        'pieces': { avgWeight: 0.08, impactMultiplier: 0.8 },    // 80g donut/muffin
        'boxes': { avgWeight: 0.4, impactMultiplier: 0.8 },      // 400g box (6 items)
        'pax': { avgWeight: 0.15, impactMultiplier: 0.8 },       // 150g per person
    },
    'Snacks': {
        'portions': { avgWeight: 0.1, impactMultiplier: 0.6 },   // 100g bag
        'pieces': { avgWeight: 0.05, impactMultiplier: 0.6 },    // 50g bar
        'boxes': { avgWeight: 0.3, impactMultiplier: 0.6 },      // 300g variety box
        'pax': { avgWeight: 0.1, impactMultiplier: 0.6 },        // 100g per person
    },
    'Beverages': {
        'portions': { avgWeight: 0.25, impactMultiplier: 0.4 },  // 250ml cup
        'pieces': { avgWeight: 0.5, impactMultiplier: 0.4 },     // 500ml bottle
        'boxes': { avgWeight: 2.0, impactMultiplier: 0.4 },      // 2L multi-pack
        'pax': { avgWeight: 0.25, impactMultiplier: 0.4 },       // 250ml per person
    },
    'Fruits': {
        'portions': { avgWeight: 0.2, impactMultiplier: 0.9 },   // 200g fruit
        'pieces': { avgWeight: 0.2, impactMultiplier: 0.9 },     // 200g per piece
        'boxes': { avgWeight: 1.5, impactMultiplier: 0.9 },      // 1.5kg basket
        'pax': { avgWeight: 0.2, impactMultiplier: 0.9 },        // 200g per person
    },
    'Others': {
        'portions': { avgWeight: 0.2, impactMultiplier: 0.7 },   // Default fallback
        'pieces': { avgWeight: 0.2, impactMultiplier: 0.7 },     // Default fallback
        'boxes': { avgWeight: 0.5, impactMultiplier: 0.7 },      // Default fallback
        'pax': { avgWeight: 0.2, impactMultiplier: 0.7 },        // Default fallback
    },
};

/**
 * Default fallback values for invalid category/unit combinations
 */
const DEFAULT_IMPACT: ImpactMatrixEntry = {
    avgWeight: 0.2,
    impactMultiplier: 0.7,
};

/**
 * Calculate Food Impact Points (FIP) for a food item
 * 
 * @param category - Food category (Meals, Bakery, Snacks, Beverages, Fruits, Others)
 * @param unit - Measurement unit (portions, pieces, pax, boxes)
 * @param quantity - Number of units
 * @returns Food Impact Points (FIP) - environmental impact score
 * 
 * @example
 * // 10 portions of Meals
 * calculateFoodImpactPoints('Meals', 'portions', 10)
 * // Returns: 3.5 FIP (10 * 0.35kg * 1.0 multiplier)
 * 
 * @example
 * // 10 pieces of Bakery
 * calculateFoodImpactPoints('Bakery', 'pieces', 10)
 * // Returns: 0.64 FIP (10 * 0.08kg * 0.8 multiplier)
 */
export function calculateFoodImpactPoints(
    category: string,
    unit: string,
    quantity: number
): number {
    // Validate inputs
    if (!category || !unit || quantity <= 0) {
        return 0;
    }

    // Get matrix entry or fallback to default
    const matrix = FOOD_IMPACT_MATRIX[category]?.[unit] || DEFAULT_IMPACT;

    // Calculate FIP: quantity × weight × multiplier
    const estimatedWeightKg = quantity * matrix.avgWeight;
    const impactPoints = estimatedWeightKg * matrix.impactMultiplier;

    // Round to 2 decimal places
    return parseFloat(impactPoints.toFixed(2));
}

/**
 * Get impact breakdown showing weight and multiplier details
 * Useful for displaying calculation transparency to users
 * 
 * @param category - Food category
 * @param unit - Measurement unit
 * @param quantity - Number of units
 * @returns Detailed breakdown of the calculation
 */
export function getImpactBreakdown(
    category: string,
    unit: string,
    quantity: number
) {
    const matrix = FOOD_IMPACT_MATRIX[category]?.[unit] || DEFAULT_IMPACT;
    const estimatedWeightKg = quantity * matrix.avgWeight;
    const impactPoints = estimatedWeightKg * matrix.impactMultiplier;

    return {
        category,
        unit,
        quantity,
        avgWeightPerUnit: matrix.avgWeight,
        totalWeightKg: parseFloat(estimatedWeightKg.toFixed(2)),
        impactMultiplier: matrix.impactMultiplier,
        totalImpactPoints: parseFloat(impactPoints.toFixed(2)),
        equivalentKg: parseFloat(estimatedWeightKg.toFixed(2)),
        calculation: `${quantity} × ${matrix.avgWeight}kg × ${matrix.impactMultiplier} = ${impactPoints.toFixed(2)} FIP`,
    };
}

/**
 * Get all valid units for a given category
 * 
 * @param category - Food category
 * @returns Array of valid unit strings
 */
export function getValidUnitsForCategory(category: string): string[] {
    const categoryMatrix = FOOD_IMPACT_MATRIX[category];
    if (!categoryMatrix) {
        return ['portions', 'pieces', 'pax', 'boxes']; // Return all as fallback
    }
    return Object.keys(categoryMatrix);
}

/**
 * Get all available food categories
 * 
 * @returns Array of category strings
 */
export function getAvailableCategories(): string[] {
    return Object.keys(FOOD_IMPACT_MATRIX);
}

/**
 * Validate if a category + unit combination is valid
 * 
 * @param category - Food category
 * @param unit - Measurement unit
 * @returns true if combination exists in matrix
 */
export function isValidCategoryUnit(category: string, unit: string): boolean {
    return !!(FOOD_IMPACT_MATRIX[category]?.[unit]);
}

/**
 * Calculate carbon footprint estimate based on FIP
 * Rough conversion: 1 FIP ≈ 1.5 kg CO₂e
 * 
 * @param impactPoints - Food Impact Points
 * @returns Estimated CO₂ equivalent in kg
 */
export function estimateCarbonFootprint(impactPoints: number): number {
    const CO2_PER_FIP = 1.5; // kg CO₂e
    return parseFloat((impactPoints * CO2_PER_FIP).toFixed(2));
}

/**
 * Format FIP for display with appropriate units
 * 
 * @param impactPoints - Food Impact Points
 * @param includeUnit - Whether to include " FIP" suffix
 * @returns Formatted string
 */
export function formatImpactPoints(impactPoints: number, includeUnit = true): string {
    const formatted = impactPoints.toFixed(1);
    return includeUnit ? `${formatted} FIP` : formatted;
}

/**
 * Get impact level description based on FIP score
 * 
 * @param impactPoints - Food Impact Points
 * @returns Object with level and description
 */
export function getImpactLevel(impactPoints: number) {
    if (impactPoints >= 10) {
        return {
            level: 'Exceptional',
            color: 'green',
            description: 'Major environmental impact! 🌟',
        };
    } else if (impactPoints >= 5) {
        return {
            level: 'High',
            color: 'blue',
            description: 'Significant waste prevention 💚',
        };
    } else if (impactPoints >= 2) {
        return {
            level: 'Good',
            color: 'yellow',
            description: 'Good contribution 👍',
        };
    } else if (impactPoints >= 0.5) {
        return {
            level: 'Moderate',
            color: 'orange',
            description: 'Every bit helps 🌱',
        };
    } else {
        return {
            level: 'Small',
            color: 'gray',
            description: 'Small but meaningful 💪',
        };
    }
}
