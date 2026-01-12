// Currency conversion utilities
// Default exchange rates (can be updated by user or from API)
const DEFAULT_RATES = {
    ARS: 1,      // Base currency
    USD: 0.0011, // ~900 ARS = 1 USD (approximate)
    EUR: 0.001   // ~1000 ARS = 1 EUR (approximate)
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency (ARS, USD, EUR)
 * @param {string} toCurrency - Target currency (ARS, USD, EUR)
 * @param {object} customRates - Optional custom exchange rates
 * @returns {number} Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency, customRates = null) {
    const rates = customRates || DEFAULT_RATES;

    if (fromCurrency === toCurrency) {
        return amount;
    }

    // Convert to ARS first (base currency)
    const amountInARS = amount / rates[fromCurrency];

    // Then convert to target currency
    return amountInARS * rates[toCurrency];
}

/**
 * Format currency value with proper symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (ARS, USD, EUR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency) {
    const symbols = {
        ARS: '$',
        USD: 'US$',
        EUR: '€'
    };

    const decimals = currency === 'ARS' ? 2 : 2;
    const formatted = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${symbols[currency]} ${formatted}`;
}

/**
 * Get all available currencies
 * @returns {array} Array of currency objects
 */
export function getAvailableCurrencies() {
    return [
        { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
        { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$' },
        { code: 'EUR', name: 'Euro', symbol: '€' }
    ];
}

/**
 * Update exchange rates
 * @param {object} newRates - New exchange rates object
 * @returns {object} Updated rates
 */
export function updateExchangeRates(newRates) {
    return { ...DEFAULT_RATES, ...newRates };
}

export { DEFAULT_RATES };
