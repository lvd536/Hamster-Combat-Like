import x10 from '../../assets/x10.png'
import x20 from '../../assets/x20.png'
import topFarmers from '../../assets/topFarmers.png'
import memeCoins from '../../assets/memeCoins.png'
import passiveTrader from '../../assets/passiveTraider.png'

export type UpgradesConfigType = {
    [key: string]: UpgradeType;
}

export type UpgradeType = {
    id: string,
    name: string,
    image: string,
    profit: number,
    price: number
    basePrice: number,
    level: number,
    maxLevel: number,
    increaseClickPerLevel: number,
    priceMultiplier: number,
    type: string,
    category: string,
    order: number,
    isBought: false | true
}

export const UPGRADES_CONFIG : UpgradesConfigType = {
    topFarmers: {
        id: 'topFarmers',
        name: 'Тоp 10 farmers',
        image: topFarmers,
        profit: 1,
        price: 100,
        basePrice: 500,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 1,
        priceMultiplier: 2,
        type: 'multiplier',
        category: 'category-a',
        order: 1,
        isBought: false
    },
    memeCoins: {
        id: 'memeCoins',
        name: 'Meme coins',
        image: memeCoins,
        profit: 2,
        price: 100,
        basePrice: 1500,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 2,
        priceMultiplier: 2,
        type: 'multiplier',
        category: 'category-a',
        order: 2,
        isBought: false
    },
    marginX10: {
        id: 'marginX10',
        name: 'Margin trading x10',
        image: x10,
        profit: 3,
        price: 100,
        basePrice: 5000,
        level: 1,
        maxLevel: 30,
        increaseClickPerLevel: 3,
        priceMultiplier: 2,
        type: 'auto',
        category: 'category-b',
        order: 3,
        isBought: false
    },
    marginX20: {
        id: 'marginX20',
        name: 'Margin trading x20',
        image: x20,
        profit: 4,
        price: 100,
        basePrice: 15000,
        level: 1,
        maxLevel: 40,
        increaseClickPerLevel: 4,
        priceMultiplier: 2,
        type: 'auto',
        category: 'category-b',
        order: 4,
        isBought: false
    },
    passiveTrader: {
        id: 'passiveTrader',
        name: 'Passive Trader',
        image: passiveTrader,
        profit: 4,
        price: 100,
        basePrice: 30000,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 4,
        priceMultiplier: 2,
        type: 'passive',
        category: 'category-c',
        order: 5,
        isBought: false
    }
}

export const UPGRADES_CONFIG_VERSION : number = 13