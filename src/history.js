const SUPPORTED_UTILITIES = new Set(['electricity', 'water']);

function asFiniteNumber(value, field) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        throw new Error(`${field} must be a finite number.`);
    }
    return number;
}

function asShortString(value, field, maxLength) {
    if (typeof value !== 'string' || value.length > maxLength) {
        throw new Error(`${field} must be a string no longer than ${maxLength} characters.`);
    }
    return value;
}

function normalizeHistory(value) {
    if (!Array.isArray(value) || value.length > 1000) {
        throw new Error('History must be an array with at most 1000 records.');
    }

    return value.map((record) => {
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
            throw new Error('Each history record must be an object.');
        }

        const utility = record.utility ?? 'electricity';
        if (!SUPPORTED_UTILITIES.has(utility)) {
            throw new Error('Unsupported utility type.');
        }

        const id = asFiniteNumber(record.id, 'id');
        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new Error('id must be a positive safe integer.');
        }
        if (!Array.isArray(record.details) || record.details.length === 0 || record.details.length > 50) {
            throw new Error('details must contain between 1 and 50 rooms.');
        }

        const details = record.details.map((detail) => {
            const prev = asFiniteNumber(detail.prev, 'previous reading');
            const curr = asFiniteNumber(detail.curr, 'current reading');
            const usage = asFiniteNumber(detail.usage, 'usage');
            const cost = asFiniteNumber(detail.cost, 'cost');
            if (prev < 0 || curr < prev || usage < 0 || cost < 0) {
                throw new Error('Meter readings, usage, and cost must be non-negative and consistent.');
            }
            return { name: asShortString(detail.name, 'room name', 30), prev, curr, usage, cost };
        });

        const billTotal = asFiniteNumber(record.billTotal, 'bill total');
        const totalUsage = asFiniteNumber(record.totalUsage, 'total usage');
        const unitPrice = asFiniteNumber(record.unitPrice, 'unit price');
        if (billTotal <= 0 || totalUsage <= 0 || unitPrice <= 0) {
            throw new Error('Bill total, total usage, and unit price must be positive.');
        }

        return {
            id,
            utility,
            date: asShortString(record.date, 'date', 100),
            billTotal,
            totalUsage,
            unitPrice,
            details,
            period: asShortString(record.period ?? '', 'period', 100),
            note: asShortString(record.note ?? '', 'note', 500)
        };
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

if (typeof module !== 'undefined') {
    module.exports = { escapeHtml, normalizeHistory };
}
