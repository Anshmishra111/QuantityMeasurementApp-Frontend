const BASE_URL = 'http://localhost:8081';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        window.location.href = 'index.html'; // Redirect to auth
        return;
    }
    const currentUser = JSON.parse(currentUserJson);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Handle History Button click
    document.getElementById('historyBtn').addEventListener('click', (e) => {
        e.preventDefault();
        alert('History feature not fully implemented in UI mock, but data is being saved to json-server!');
    });

    // STATE -> Contains mapping of our units for mockup display
    const unitConfigs = {
        length: {
            baseUnit: 'Centimetres',
            options: ['Metres', 'Centimetres', 'Feet', 'Inches', 'Yards'],
            // Value in Centimetres
            conversions: {
                'Centimetres': 1,
                'Metres': 100,
                'Feet': 30.48,
                'Inches': 2.54,
                'Yards': 91.44
            }
        },
        temperature: {
            baseUnit: 'Celsius',
            options: ['Celsius', 'Fahrenheit', 'Kelvin']
        },
        volume: {
            baseUnit: 'Millilitres',
            options: ['Litres', 'Millilitres', 'Gallons'],
            // Value in Millilitres
            conversions: {
                'Millilitres': 1,
                'Litres': 1000,
                'Gallons': 3785.41178
            }
        }
    };

    let activeType = 'length';

    // DOM Elements
    const cards = {
        length: document.getElementById('type-length'),
        temperature: document.getElementById('type-temperature'),
        volume: document.getElementById('type-volume')
    };

    const fromUnitEl = document.getElementById('fromUnit');
    const toUnitEl = document.getElementById('toUnit');
    const fromValueEl = document.getElementById('fromValue');
    const toValueEl = document.getElementById('toValue');

    // Populate dropdowns based on type
    const populateDropdowns = (type) => {
        fromUnitEl.innerHTML = '';
        toUnitEl.innerHTML = '';

        const options = unitConfigs[type].options;
        options.forEach(opt => {
            fromUnitEl.innerHTML += `<option value="${opt}">${opt}</option>`;
            toUnitEl.innerHTML += `<option value="${opt}">${opt}</option>`;
        });

        // Set default based on active type
        if (type === 'length') {
            fromUnitEl.value = 'Metres';
            toUnitEl.value = 'Centimetres';
            fromValueEl.value = 1;
        } else if (type === 'temperature') {
            fromUnitEl.value = 'Celsius';
            toUnitEl.value = 'Fahrenheit';
            fromValueEl.value = 0;
        } else if (type === 'volume') {
            fromUnitEl.value = 'Litres';
            toUnitEl.value = 'Millilitres';
            fromValueEl.value = 1;
        }

        recalculate(); // initial calc
    };


    // Conversion Math
    const calculateValue = (val, from, to, type) => {
        const valNum = parseFloat(val);
        if (isNaN(valNum)) return '';

        if (from === to) return valNum;

        if (type === 'temperature') {
            if (from === 'Celsius' && to === 'Fahrenheit') return (valNum * 9 / 5) + 32;
            if (from === 'Fahrenheit' && to === 'Celsius') return (valNum - 32) * 5 / 9;
            if (from === 'Celsius' && to === 'Kelvin') return valNum + 273.15;
            if (from === 'Kelvin' && to === 'Celsius') return valNum - 273.15;
            if (from === 'Fahrenheit' && to === 'Kelvin') return ((valNum - 32) * 5 / 9) + 273.15;
            if (from === 'Kelvin' && to === 'Fahrenheit') return ((valNum - 273.15) * 9 / 5) + 32;
        } else {
            // Volume or Length
            const mapping = unitConfigs[type].conversions;
            // Convert 'from' to base
            const baseValue = valNum * mapping[from];
            // Convert base to 'to'
            const finalValue = baseValue / mapping[to];

            // Round to 4 decimal places
            return Math.round(finalValue * 10000) / 10000;
        }
        return '';
    };

    // Calculate and async save history
    const recalculate = () => {
        const result = calculateValue(fromValueEl.value, fromUnitEl.value, toUnitEl.value, activeType);
        toValueEl.value = result;

        // Debounce network request to avoid spamming json-server
        clearTimeout(window.calcTimeout);
        window.calcTimeout = setTimeout(() => {
            saveHistory(fromValueEl.value, fromUnitEl.value, result, toUnitEl.value, activeType);
        }, 1000);
    };

    const saveHistory = async (fVal, fUnit, tVal, tUnit, mType) => {
        if (!fVal || !tVal) return;

        try {
            let history = JSON.parse(localStorage.getItem('mockHistory') || '[]');
            history.push({
                userId: currentUser.id || 1,
                measurementType: mType,
                fromValue: fVal,
                fromUnit: fUnit,
                toValue: tVal,
                toUnit: tUnit,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('mockHistory', JSON.stringify(history));
            console.log('History locally saved.');
        } catch (e) {
            console.error('Failed to log history', e);
        }
    };

    // Attach Card Listeners
    Object.keys(cards).forEach(key => {
        cards[key].addEventListener('click', () => {
            // Remove active classes
            cards.length.classList.remove('active-length');
            cards.temperature.classList.remove('active-temperature');
            cards.volume.classList.remove('active-volume');

            // Set active class
            cards[key].classList.add(`active-${key}`);
            activeType = key;

            // Re-populate and recal
            populateDropdowns(key);
        });
    });

    // Attach Input Listeners
    fromValueEl.addEventListener('input', recalculate);
    fromUnitEl.addEventListener('change', recalculate);
    toUnitEl.addEventListener('change', recalculate);

    // Initial load
    populateDropdowns('length');
});
