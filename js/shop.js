import {setEventListener, setClickerMultiplier, getBalanceInfo, setBalance} from "./clicker.js"
import {setUserUpgrades, getUserUpgrades} from "./database.js"
import {UPGRADES_CONFIG, UPGRADES_CONFIG_VERSION} from './upgradesConfig.js'

let tgID = ''
let upgrades = {}
let upgradesConfigVersion = 0
const clickerElement = `<img src="./img/hamster.png" alt="" class="clicker__image" style="width: 253px; height: 254px">`

export const initShop = async (telegramID) => {
    tgID = telegramID

    await updateUserLocalUpgrades(tgID).then(() => setClickerMultiplier(upgrades))

    const navElements = document.querySelectorAll('.navigation__item')

    navElements[0].addEventListener('click', () => {
        navElements[0].classList.toggle('active', true)
        navElements[1].classList.toggle('active', false)
        navElements[2].classList.toggle('active', false)
        document.querySelector('.main__body-clicker').innerHTML = clickerElement
        setEventListener()
    })
    navElements[1].addEventListener('click', () => {
        navElements[1].classList.toggle('active', true)
        navElements[0].classList.toggle('active', false)
        navElements[2].classList.toggle('active', false)

        const shopItemsHTML = Object.values(upgrades)
            .sort((a, b) => a.order - b.order)
            .map(upgrade => `
            <li class="shop__item mix ${upgrade.category}" data-order="${upgrade.id}">
                <div class="shop__item-info">
                    <img src="${upgrade.image}" alt="" class="shop__item-image">
                    <div class="shop__item-pricing">
                        <span class="shop__item-name">${upgrade.name}</span>
                        <span class="shop__item-profit-label">Profit per ${upgrade.type === 'multiplier' ? 'click' : upgrade.type === 'auto' ? 'second' : upgrade.type === 'passive' ? 'hour' : 'click'}</span>
                        <span class="shop__item-profit">
                            <img src="./img/coin.png" alt="" class="profit__image">
                            <span class="profit__value">${upgrade.profit}</span>
                        </span>
                    </div>
                </div>
                <div class="shop__item-details">
                    <span class="shop__item-level">lvl ${upgrade.level}</span>
                    <span class="shop__item-price">
                        <img src="./img/coin.png" alt="" class="price__image">
                        <span class="price__value">${upgrade.price}</span>
                    </span>
                </div>
            </li>
        `).join('')

        document.querySelector('.main__body-clicker').innerHTML = `
            <div class="sort__buttons">
                <button class="sort__button" type="button" data-filter=".category-a">Click</button>
                <button class="sort__button" type="button" data-filter=".category-b">Auto Click</button>
                <button class="sort__button" type="button" data-filter=".category-c">Passive</button>
            </div>
            <ul class="shop__items">
                ${shopItemsHTML}
            </ul>
        `

        const shopContainer = document.querySelector('.shop__items')
        const mixer = mixitup(shopContainer)
        mixer.filter('.category-a')
    })
    document.addEventListener('click', async (event) => await onUpgradeClick(event))
}

const updateUserLocalUpgrades = async (telegramID) => {
    try {
        const data = await getUserUpgrades(telegramID)

        const userUpgrades = data.upgrades || {}
        const userConfigVersion = data.upgradesConfigVersion || 0

        const { upgrades: migratedUpgrades, configVersion } =
            migrateUserUpgrades(userUpgrades, userConfigVersion)

        upgrades = migratedUpgrades
        upgradesConfigVersion = userConfigVersion
        if (configVersion > userConfigVersion) {
            await setUserUpgrades(migratedUpgrades, configVersion, telegramID)
        }
    } catch (err) {
        console.error('Не удалось обновить апгрейды:', err.message)
        throw err
    }
}

const onUpgradeClick = async (event) => {
    if (event.target.closest('.shop__item-price')) {
        const shopItem = event.target.closest('.shop__item')
        if (shopItem) {
            const itemNameElement = shopItem.querySelector('.shop__item-name')
            if (itemNameElement) {
                const itemName = itemNameElement.textContent
                const targetObjName = Object.keys(upgrades).find(key => upgrades[key].name === itemName)
                const upgrade = upgrades[targetObjName]
                const currentBalance = getBalanceInfo().balance
                if (currentBalance >= upgrade.price) {
                    const newBalance = currentBalance - upgrade.price

                    const newLevel = upgrade.level + 1
                    const newPrice = calculatePrice(upgrade, newLevel)
                    const newProfit = calculateProfit(upgrade, newLevel)

                    upgrades[targetObjName] = {
                        ...upgrade,
                        level: newLevel,
                        price: newPrice,
                        profit: newProfit,
                        isBought: true
                    }

                    setBalance(newBalance)
                    await setUserUpgrades(upgrades, upgradesConfigVersion, tgID)
                    setClickerMultiplier(upgrades)
                    updateUpgradeUI(shopItem, upgrades[targetObjName])
                }
            }
        }
    }
}

const updateUpgradeUI = (shopItem, upgrade) => {
    const priceElement = shopItem.querySelector('.price__value')
    const profitElement = shopItem.querySelector('.profit__value')
    const levelElement = shopItem.querySelector('.shop__item-level')

    if (priceElement) priceElement.textContent = upgrade.price
    if (profitElement) profitElement.textContent = upgrade.profit
    if (levelElement) levelElement.textContent = `lvl ${upgrade.level}`
}

const migrateUserUpgrades = (userUpgrades, userConfigVersion = 0) => {
    if (userConfigVersion < UPGRADES_CONFIG_VERSION) {
        const migratedUpgrades = { ...userUpgrades }

        Object.keys(UPGRADES_CONFIG).forEach(upgradeId => {
            if (!migratedUpgrades[upgradeId]) {
                migratedUpgrades[upgradeId] = createNewUpgrade(upgradeId)
            } else {
                const config = UPGRADES_CONFIG[upgradeId]
                migratedUpgrades[upgradeId] = {
                    ...config,
                    level: migratedUpgrades[upgradeId].level,
                    price: calculatePrice(config, migratedUpgrades[upgradeId].level),
                    profit: calculateProfit(config, migratedUpgrades[upgradeId].level),
                    isBought: migratedUpgrades[upgradeId].level > 1
                }
            }
        })

        Object.keys(migratedUpgrades).forEach(upgradeId => {
            if (!UPGRADES_CONFIG[upgradeId]) {
                delete migratedUpgrades[upgradeId]
            }
        })

        return {
            upgrades: migratedUpgrades,
            configVersion: UPGRADES_CONFIG_VERSION
        }
    }

    return {
        upgrades: userUpgrades,
        configVersion: userConfigVersion
    }
}

const createNewUpgrade = (upgradeId) => {
    const config = UPGRADES_CONFIG[upgradeId]
    return {
        ...config,
        level: 0,
        price: calculatePrice(config, 0),
        profit: calculateProfit(config, 0),
        isBought: false
    }
}

const calculatePrice = (config, level) => {
    return Math.round(config.basePrice * Math.pow(config.priceMultiplier, level))
}

const calculateProfit = (config, level) => {
    return config.profit + (config.increaseClickPerLevel * level)
}