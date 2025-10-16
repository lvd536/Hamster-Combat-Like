import x10 from '../../assets/x10.png'
import x20 from '../../assets/x20.png'
import topFarmers from '../../assets/topFarmers.png'
import memeCoins from '../../assets/memeCoins.png'
import passiveTrader from '../../assets/passiveTraider.png'

export const UPGRADES_CONFIG = {
    topFarmers: {
        id: 'topFarmers',
        name: 'Тоp 10 farmers',
        image: topFarmers,
        profit: 1,
        basePrice: 500,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 1,
        priceMultiplier: 2,
        type: 'multiplier',
        category: 'category-a',
        order: 1
    },
    memeCoins: {
        id: 'memeCoins',
        name: 'Meme coins',
        image: memeCoins,
        profit: 2,
        basePrice: 1500,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 2,
        priceMultiplier: 2,
        type: 'multiplier',
        category: 'category-a',
        order: 2
    },
    marginX10: {
        id: 'marginX10',
        name: 'Margin trading x10',
        image: x10,
        profit: 3,
        basePrice: 5000,
        level: 1,
        maxLevel: 30,
        increaseClickPerLevel: 3,
        priceMultiplier: 2,
        type: 'auto',
        category: 'category-b',
        order: 3
    },
    marginX20: {
        id: 'marginX20',
        name: 'Margin trading x20',
        image: x20,
        profit: 4,
        basePrice: 15000,
        level: 1,
        maxLevel: 40,
        increaseClickPerLevel: 4,
        priceMultiplier: 2,
        type: 'auto',
        category: 'category-b',
        order: 4
    },
    passiveTrader: {
        id: 'passiveTrader',
        name: 'Passive Trader',
        image: passiveTrader,
        profit: 4,
        basePrice: 30000,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 4,
        priceMultiplier: 2,
        type: 'passive',
        category: 'category-c',
        order: 5
    }
};

export const UPGRADES_CONFIG_VERSION = 12;