export const UPGRADES_CONFIG = {
    topFarmers: {
        id: 'topFarmers',
        name: 'Тоp 10 farmers',
        image: './img/x10.svg',
        profit: 1,
        basePrice: 500,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 1,
        priceMultiplier: 3,
        type: 'multiplier',
        category: 'category-a',
        description: 'Увеличивает прибыль с каждого клика',
        order: 1
    },
    memeCoins: {
        id: 'memeCoins',
        name: 'Meme coins',
        image: './img/memeCoins.png',
        profit: 2,
        basePrice: 1500,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 2,
        priceMultiplier: 4,
        type: 'multiplier',
        category: 'category-a',
        description: 'Увеличивает прибыль с каждого клика',
        order: 2
    },
    marginX10: {
        id: 'marginX10',
        name: 'Margin trading x10',
        image: './img/x10.svg',
        profit: 3,
        basePrice: 5000,
        level: 1,
        maxLevel: 30,
        increaseClickPerLevel: 3,
        priceMultiplier: 5,
        type: 'auto',
        category: 'category-b',
        description: 'Автоматически генерирует прибыль',
        order: 3
    },
    marginX20: {
        id: 'marginX20',
        name: 'Margin trading x20',
        image: './img/x10.svg',
        profit: 4,
        basePrice: 15000,
        level: 1,
        maxLevel: 40,
        increaseClickPerLevel: 4,
        priceMultiplier: 6,
        type: 'auto',
        category: 'category-b',
        description: 'Автоматически генерирует прибыль',
        order: 4
    }
};

export const UPGRADES_CONFIG_VERSION = 4;