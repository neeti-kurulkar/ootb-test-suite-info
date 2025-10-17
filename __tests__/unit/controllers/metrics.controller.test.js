const { describe, it, expect } = require('@jest/globals');

// Helper function to format impact values with K/M/B/T suffixes (from metrics.controller.js)
// Note: These are isolated pure functions being tested, so no mocking needed
function formatImpactValue(value) {
    if (value === null || value === undefined || isNaN(value) || value === 0) {
        return '0';
    }

    let abs_value = Math.abs(value);
    let units = ['k', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];
    let unit = '';
    let i = 0;

    while (abs_value >= 1000 && i < units.length) {
        abs_value /= 1000;
        unit = units[i];
        i++;
    }

    let formatted_value;
    if (abs_value < 1) {
        // For small values, use 1 decimal place but ensure we don't show 0.0 for very small non-zero values
        if (abs_value < 0.1 && abs_value > 0) {
            // For very small values, show enough precision to avoid 0.0
            let decimalPlaces = Math.max(1, Math.ceil(-Math.log10(abs_value)) + 1);
            let numStr = abs_value.toFixed(decimalPlaces);
            // Remove trailing zeros
            numStr = parseFloat(numStr).toString();
            formatted_value = `${value < 0 ? '-' : ''}${numStr}${unit}`;
        } else {
            let numStr = abs_value.toFixed(1);
            // Remove trailing zeros (e.g., "1.0" becomes "1")
            numStr = parseFloat(numStr).toString();
            formatted_value = `${value < 0 ? '-' : ''}${numStr}${unit}`;
        }
    } else {
        // For values >= 1, always use 1 decimal place but remove trailing zeros
        let numStr = abs_value.toFixed(1);
        // Remove trailing zeros (e.g., "93.0" becomes "93")
        numStr = parseFloat(numStr).toString();
        formatted_value = `${value < 0 ? '-' : ''}${numStr}${unit}`;
    }

    return formatted_value;
}

// Helper function to format percentage values ensuring small decimals are preserved (from metrics.controller.js)
function formatImpactPercentage(value) {
    if (value === null || value === undefined || isNaN(value) || value === 0) {
        return '0%';
    }

    let pct_value = value * 100;
    let abs_pct_value = Math.abs(pct_value);

    let formatted_value;
    if (abs_pct_value < 0.1 && abs_pct_value > 0) {
        // For very small percentages, show enough precision to avoid 0.0%
        let decimalPlaces = Math.max(1, Math.ceil(-Math.log10(abs_pct_value)) + 1);
        let numStr = abs_pct_value.toFixed(decimalPlaces);
        // Remove trailing zeros
        numStr = parseFloat(numStr).toString();
        formatted_value = `${value < 0 ? '-' : ''}${numStr}%`;
    } else {
        // For all other values, use 1 decimal place but remove trailing zeros
        let numStr = abs_pct_value.toFixed(1);
        // Remove trailing zeros (e.g., "93.0" becomes "93")
        numStr = parseFloat(numStr).toString();
        formatted_value = `${value < 0 ? '-' : ''}${numStr}%`;
    }

    return formatted_value;
}

describe('Metrics Controller - Formatting Functions', () => {
    describe('formatImpactValue', () => {
        // Edge Cases: Zero, Null, Undefined, NaN
        describe('Edge Cases - Invalid Values', () => {
            it('should return "0" for zero value', () => {
                expect(formatImpactValue(0)).toBe('0');
            });

            it('should return "0" for null value', () => {
                expect(formatImpactValue(null)).toBe('0');
            });

            it('should return "0" for undefined value', () => {
                expect(formatImpactValue(undefined)).toBe('0');
            });

            it('should return "0" for NaN value', () => {
                expect(formatImpactValue(NaN)).toBe('0');
            });
        });

        // Basic Formatting - Numbers without suffixes
        describe('Basic Formatting - Small Numbers (<1000)', () => {
            it('should format whole number less than 1000 without suffix', () => {
                expect(formatImpactValue(500)).toBe('500');
            });

            it('should format decimal number less than 1000', () => {
                expect(formatImpactValue(123.456)).toBe('123.5');
            });

            it('should remove trailing zeros for values less than 1000', () => {
                expect(formatImpactValue(100.0)).toBe('100');
            });

            it('should format single digit number', () => {
                expect(formatImpactValue(5)).toBe('5');
            });
        });

        // Thousands (K)
        describe('Thousands (K) Formatting', () => {
            it.each([
                [1000, '1k'],
                [1500, '1.5k'],
                [1234, '1.2k'],
                [9999, '10k'],
                [50000, '50k'],
                [999999, '1000k']
            ])('formatImpactValue(%s) should return "%s"', (input, expected) => {
                expect(formatImpactValue(input)).toBe(expected);
            });
        });

        // Millions (M)
        describe('Millions (M) Formatting', () => {
            it.each([
                [1000000, '1M'],
                [1500000, '1.5M'],
                [2345678, '2.3M'],
                [999999999, '1000M']
            ])('formatImpactValue(%s) should return "%s"', (input, expected) => {
                expect(formatImpactValue(input)).toBe(expected);
            });
        });

        // Billions (B)
        describe('Billions (B) Formatting', () => {
            it.each([
                [1000000000, '1B'],
                [1500000000, '1.5B'],
                [2345678901, '2.3B'],
                [999999999999, '1000B']
            ])('formatImpactValue(%s) should return "%s"', (input, expected) => {
                expect(formatImpactValue(input)).toBe(expected);
            });
        });

        // Trillions (T)
        describe('Trillions (T) Formatting', () => {
            it.each([
                [1000000000000, '1T'],
                [1500000000000, '1.5T'],
                [2345678901234, '2.3T']
            ])('formatImpactValue(%s) should return "%s"', (input, expected) => {
                expect(formatImpactValue(input)).toBe(expected);
            });
        });

        // Very Large Numbers (>1T)
        describe('Very Large Numbers (>1T)', () => {
            it('should format Petabytes (P)', () => {
                expect(formatImpactValue(1e15)).toBe('1P');
            });

            it('should format Exabytes (E)', () => {
                expect(formatImpactValue(1e18)).toBe('1E');
            });

            it('should format Zettabytes (Z)', () => {
                expect(formatImpactValue(1e21)).toBe('1Z');
            });

            it('should format Yottabytes (Y)', () => {
                expect(formatImpactValue(1e24)).toBe('1Y');
            });

            it('should handle numbers beyond Yottabytes without overflow', () => {
                const hugeNumber = 1e27;
                const result = formatImpactValue(hugeNumber);
                expect(result).toContain('Y');
                expect(result).not.toBe('0');
            });
        });

        // Very Small Decimals (<0.001)
        describe('Very Small Decimals (<0.001)', () => {
            it('should preserve precision for very small decimals', () => {
                const result = formatImpactValue(0.0001);
                expect(result).not.toBe('0');
                expect(result).not.toBe('0.0');
            });

            it('should format 0.001 with appropriate precision', () => {
                expect(formatImpactValue(0.001)).toBe('0.001');
            });

            it('should format 0.01 with appropriate precision', () => {
                expect(formatImpactValue(0.01)).toBe('0.01');
            });

            it('should format 0.05 correctly', () => {
                expect(formatImpactValue(0.05)).toBe('0.05');
            });

            it('should handle extremely small values (scientific notation)', () => {
                const result = formatImpactValue(0.00001);
                expect(result).not.toBe('0');
                // Should show enough precision to be meaningful
                expect(parseFloat(result)).toBeGreaterThan(0);
            });
        });

        // Negative Values
        describe('Negative Values', () => {
            it('should format negative integers with minus sign', () => {
                expect(formatImpactValue(-500)).toBe('-500');
            });

            it('should format negative thousands with K suffix', () => {
                expect(formatImpactValue(-1500)).toBe('-1.5k');
            });

            it('should format negative millions with M suffix', () => {
                expect(formatImpactValue(-2500000)).toBe('-2.5M');
            });

            it('should format negative billions with B suffix', () => {
                expect(formatImpactValue(-3500000000)).toBe('-3.5B');
            });

            it('should format negative trillions with T suffix', () => {
                expect(formatImpactValue(-4500000000000)).toBe('-4.5T');
            });

            it('should format negative small decimals', () => {
                expect(formatImpactValue(-0.05)).toBe('-0.05');
            });
        });

        // Boundary Values
        describe('Boundary Values', () => {
            it('should handle exactly 1000', () => {
                expect(formatImpactValue(1000)).toBe('1k');
            });

            it('should handle exactly 1 million', () => {
                expect(formatImpactValue(1000000)).toBe('1M');
            });

            it('should handle exactly 1 billion', () => {
                expect(formatImpactValue(1000000000)).toBe('1B');
            });

            it('should handle exactly 1 trillion', () => {
                expect(formatImpactValue(1000000000000)).toBe('1T');
            });

            it('should handle 999 without suffix', () => {
                expect(formatImpactValue(999)).toBe('999');
            });

            it('should handle 999.9 with proper rounding', () => {
                // 999.9 rounds to 1 decimal place = 999.9 (no suffix, under 1000)
                expect(formatImpactValue(999.9)).toBe('999.9');
            });
        });

        // Trailing Zeros Removal
        describe('Trailing Zeros Removal', () => {
            it('should remove trailing zero for 1.0', () => {
                expect(formatImpactValue(1.0)).toBe('1');
            });

            it('should remove trailing zero for 100.0', () => {
                expect(formatImpactValue(100.0)).toBe('100');
            });

            it('should remove trailing zero for 1000 (1.0k)', () => {
                expect(formatImpactValue(1000)).toBe('1k');
            });

            it('should keep non-zero decimal for 1.5', () => {
                expect(formatImpactValue(1.5)).toBe('1.5');
            });
        });
    });

    describe('formatImpactPercentage', () => {
        // Edge Cases: Zero, Null, Undefined, NaN
        describe('Edge Cases - Invalid Values', () => {
            it('should return "0%" for zero value', () => {
                expect(formatImpactPercentage(0)).toBe('0%');
            });

            it('should return "0%" for null value', () => {
                expect(formatImpactPercentage(null)).toBe('0%');
            });

            it('should return "0%" for undefined value', () => {
                expect(formatImpactPercentage(undefined)).toBe('0%');
            });

            it('should return "0%" for NaN value', () => {
                expect(formatImpactPercentage(NaN)).toBe('0%');
            });
        });

        // Basic Percentage Formatting
        describe('Basic Percentage Formatting', () => {
            it('should multiply decimal by 100 and add % sign', () => {
                expect(formatImpactPercentage(0.5)).toBe('50%');
            });

            it('should format 0.125 as 12.5%', () => {
                expect(formatImpactPercentage(0.125)).toBe('12.5%');
            });

            it('should format 1.0 as 100%', () => {
                expect(formatImpactPercentage(1.0)).toBe('100%');
            });

            it('should format 0.01 as 1%', () => {
                expect(formatImpactPercentage(0.01)).toBe('1%');
            });
        });

        // Very Small Percentages (<0.1%)
        describe('Very Small Percentages (<0.1%)', () => {
            it('should preserve precision for very small percentages', () => {
                const result = formatImpactPercentage(0.0005);
                expect(result).toBe('0.05%');
            });

            it('should format 0.0001 (0.01%) with appropriate precision', () => {
                const result = formatImpactPercentage(0.0001);
                expect(result).not.toBe('0%');
                expect(result).not.toBe('0.0%');
                expect(result).toContain('%');
            });

            it('should format 0.00001 (0.001%) with high precision', () => {
                const result = formatImpactPercentage(0.00001);
                expect(result).not.toBe('0%');
                expect(result).toContain('%');
            });

            it('should handle extremely small percentages', () => {
                const result = formatImpactPercentage(0.000001);
                expect(result).not.toBe('0%');
                // Should show enough precision to be meaningful
                expect(parseFloat(result)).toBeGreaterThan(0);
            });
        });

        // Large Percentages
        describe('Large Percentages (>100%)', () => {
            it('should format 2.0 as 200%', () => {
                expect(formatImpactPercentage(2.0)).toBe('200%');
            });

            it('should format 10.5 as 1050%', () => {
                expect(formatImpactPercentage(10.5)).toBe('1050%');
            });

            it('should format very large percentage', () => {
                expect(formatImpactPercentage(100.0)).toBe('10000%');
            });
        });

        // Negative Percentages
        describe('Negative Percentages', () => {
            it('should format negative percentage with minus sign', () => {
                expect(formatImpactPercentage(-0.25)).toBe('-25%');
            });

            it('should format negative small percentage', () => {
                expect(formatImpactPercentage(-0.125)).toBe('-12.5%');
            });

            it('should format negative very small percentage', () => {
                expect(formatImpactPercentage(-0.0005)).toBe('-0.05%');
            });

            it('should format negative large percentage', () => {
                expect(formatImpactPercentage(-2.5)).toBe('-250%');
            });
        });

        // Decimal Precision
        describe('Decimal Precision', () => {
            it.each([
                [0.123, '12.3%'],
                [0.456, '45.6%'],
                [0.789, '78.9%'],
                [0.999, '99.9%']
            ])('formatImpactPercentage(%s) should return "%s"', (input, expected) => {
                expect(formatImpactPercentage(input)).toBe(expected);
            });
        });

        // Trailing Zeros Removal
        describe('Trailing Zeros Removal', () => {
            it('should remove trailing zero for 10.0%', () => {
                expect(formatImpactPercentage(0.1)).toBe('10%');
            });

            it('should remove trailing zero for 50.0%', () => {
                expect(formatImpactPercentage(0.5)).toBe('50%');
            });

            it('should remove trailing zero for 100.0%', () => {
                expect(formatImpactPercentage(1.0)).toBe('100%');
            });

            it('should keep non-zero decimal for 12.5%', () => {
                expect(formatImpactPercentage(0.125)).toBe('12.5%');
            });
        });

        // Boundary Values
        describe('Boundary Values', () => {
            it('should handle exactly 0.001 (0.1%)', () => {
                expect(formatImpactPercentage(0.001)).toBe('0.1%');
            });

            it('should handle exactly 0.01 (1%)', () => {
                expect(formatImpactPercentage(0.01)).toBe('1%');
            });

            it('should handle exactly 0.1 (10%)', () => {
                expect(formatImpactPercentage(0.1)).toBe('10%');
            });

            it('should handle exactly 1.0 (100%)', () => {
                expect(formatImpactPercentage(1.0)).toBe('100%');
            });
        });

        // Rounding Behavior
        describe('Rounding Behavior', () => {
            it('should round to 1 decimal place for normal percentages', () => {
                expect(formatImpactPercentage(0.1234)).toBe('12.3%');
            });

            it('should round up when appropriate', () => {
                expect(formatImpactPercentage(0.1256)).toBe('12.6%');
            });

            it('should round down when appropriate', () => {
                expect(formatImpactPercentage(0.1254)).toBe('12.5%');
            });
        });
    });
});
