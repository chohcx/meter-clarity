function allocateBill(billTotal, readings) {
    if (!Number.isFinite(billTotal) || billTotal <= 0) {
        throw new Error('Bill total must be a positive number.');
    }
    if (!Array.isArray(readings) || readings.length === 0) {
        throw new Error('At least one meter reading is required.');
    }

    const details = readings.map((reading) => {
        const prev = Number(reading.prev);
        const curr = Number(reading.curr);
        if (!Number.isFinite(prev) || !Number.isFinite(curr)) {
            throw new Error('Meter readings must be finite numbers.');
        }
        if (prev < 0 || curr < 0) {
            throw new Error('Meter readings cannot be negative.');
        }
        if (curr < prev) {
            throw new Error(`Current reading cannot be lower than previous reading for ${reading.name}.`);
        }
        return { ...reading, prev, curr, usage: curr - prev };
    });

    const totalUsage = details.reduce((sum, room) => sum + room.usage, 0);
    if (totalUsage <= 0) {
        throw new Error('Total usage must be greater than zero.');
    }

    const roundedBill = Math.round(billTotal);
    const shares = details.map((room, index) => {
        const exactCost = roundedBill * room.usage / totalUsage;
        const cost = Math.floor(exactCost);
        return { ...room, cost, remainder: exactCost - cost, index };
    });
    let dollarsLeft = roundedBill - shares.reduce((sum, room) => sum + room.cost, 0);

    [...shares]
        .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
        .slice(0, dollarsLeft)
        .forEach((room) => room.cost += 1);

    return {
        billTotal,
        totalUsage,
        unitPrice: billTotal / totalUsage,
        details: shares.map(({ remainder, index, ...room }) => room)
    };
}

if (typeof module !== 'undefined') {
    module.exports = { allocateBill };
}
