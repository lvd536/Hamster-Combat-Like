import {setEventListener, setClickerMultiplier, getBalanceInfo, setBalance} from "./clicker.js";
import {setUserUpgrades, getUserUpgrades} from "./database.js"

let upgrades = {
    topFarmers: {
        name: 'Тоp 10 farmers',
        image: './img/x10.svg',
        profit: 1,
        price: 500,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 1,
        increasePricePerLevel: 3,
        isBought: false,
    },
    memeCoins: {
        name: 'Meme coins',
        image: './img/memeCoins.png',
        profit: 2,
        price: 1500,
        level: 1,
        maxLevel: 20,
        increaseClickPerLevel: 2,
        increasePricePerLevel: 4,
        isBought: false,
    },
    marginX10: {
        name: 'Margin trading x10',
        image: './img/x10.svg',
        profit: 3,
        price: 5000,
        level: 1,
        maxLevel: 30,
        increaseClickPerLevel: 3,
        increasePricePerLevel: 5,
        isBought: false,
    },
    marginX20: {
        name: 'Margin trading x20',
        image: './img/x10.svg',
        profit: 5,
        price: 15000,
        level: 1,
        maxLevel: 40,
        increaseClickPerLevel: 4,
        increasePricePerLevel: 6,
        isBought: false,
    },
}
let tgID = ''

const clickerElement = `<img src="./img/hamster.png" alt="" class="clicker__image" style="width: 253px;height: 254px;">`

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
        document.querySelector('.main__body-clicker').innerHTML = `<ul class="shop__items">
                        <li class="shop__item">
                            <div class="shop__item-info">
                                <img src="${upgrades.topFarmers.image}" alt="" class="shop__item-image">
                                <div class="shop__item-pricing">
                                    <span class="shop__item-name">${upgrades.topFarmers.name}</span>
                                    <span class="shop__item-profit-label">Profit per click</span>
                                    <span class="shop__item-profit">
                                            <img src="./img/coin.png" alt="" class="profit__image">
                                            <span class="profit__value">${upgrades.topFarmers.profit}</span>
                                        </span>
                                </div>
                            </div>
                            <div class="shop__item-details">
                                <span class="shop__item-level">lvl ${upgrades.topFarmers.level}</span>
                                <span class="shop__item-price">
                                        <img src="./img/coin.png" alt="" class="price__image">
                                        <span class="price__value">${upgrades.topFarmers.price}</span>
                                    </span>
                            </div>
                        </li>
                        <li class="shop__item">
                            <div class="shop__item-info">
                                <img src="${upgrades.memeCoins.image}" alt="" class="shop__item-image">
                                <div class="shop__item-pricing">
                                    <span class="shop__item-name">${upgrades.memeCoins.name}</span>
                                    <span class="shop__item-profit-label">Profit per click</span>
                                    <span class="shop__item-profit">
                                            <img src="./img/coin.png" alt="" class="profit__image">
                                            <span class="profit__value">${upgrades.memeCoins.profit}</span>
                                        </span>
                                </div>
                            </div>
                            <div class="shop__item-details">
                                <span class="shop__item-level">lvl ${upgrades.memeCoins.level}</span>
                                <span class="shop__item-price">
                                        <img src="./img/coin.png" alt="" class="price__image">
                                        <span class="price__value">${upgrades.memeCoins.price}</span>
                                    </span>
                            </div>
                        </li>
                        <li class="shop__item">
                            <div class="shop__item-info">
                                <img src="${upgrades.marginX10.image}" alt="" class="shop__item-image">
                                <div class="shop__item-pricing">
                                    <span class="shop__item-name">${upgrades.marginX10.name}</span>
                                    <span class="shop__item-profit-label">Profit per click</span>
                                    <span class="shop__item-profit">
                                            <img src="./img/coin.png" alt="" class="profit__image">
                                            <span class="profit__value">${upgrades.marginX10.profit}</span>
                                        </span>
                                </div>
                            </div>
                            <div class="shop__item-details">
                                <span class="shop__item-level">lvl ${upgrades.marginX10.level}</span>
                                <span class="shop__item-price">
                                        <img src="./img/coin.png" alt="" class="price__image">
                                        <span class="price__value">${upgrades.marginX10.price}</span>
                                    </span>
                            </div>
                        </li>
                        <li class="shop__item">
                            <div class="shop__item-info">
                                <img src="${upgrades.marginX20.image}" alt="" class="shop__item-image">
                                <div class="shop__item-pricing">
                                    <span class="shop__item-name">${upgrades.marginX20.name}</span>
                                    <span class="shop__item-profit-label">Profit per click</span>
                                    <span class="shop__item-profit">
                                            <img src="./img/coin.png" alt="" class="profit__image">
                                            <span class="profit__value">${upgrades.marginX20.profit}</span>
                                        </span>
                                </div>
                            </div>
                            <div class="shop__item-details">
                                <span class="shop__item-level">lvl ${upgrades.marginX20.level}</span>
                                <span class="shop__item-price">
                                        <img src="./img/coin.png" alt="" class="price__image">
                                        <span class="price__value">${upgrades.marginX20.price}</span>
                                    </span>
                            </div>
                        </li>
                    </ul>`
    })
    document.addEventListener('click', async (event) => await onUpgradeClick(event))
}

const updateUserLocalUpgrades = async (telegramID) => {
    try {
        const data = await getUserUpgrades(telegramID)
        upgrades = data.upgrades
    } catch (err) {
        console.error('Не удалось обновить апгрейды:', err.message)
        throw err
    }
}
const onUpgradeClick = async (event) => {
    if (event.target.closest('.shop__item-price')) {
        const shopItem = event.target.closest('.shop__item');
        if (shopItem) {
            const itemNameElement = shopItem.querySelector('.shop__item-name');
            const itemPriceElement = shopItem.querySelector('.price__value');
            const itemProfitElement = shopItem.querySelector('.profit__value');
            if (itemNameElement) {
                const itemName = itemNameElement.textContent;
                const targetObjName = Object.keys(upgrades).find(key => upgrades[key].name === itemName)
                const currentBalance = getBalanceInfo().balance
                if (currentBalance >= upgrades[targetObjName].price) {
                    const newBalance = currentBalance - upgrades[targetObjName].price
                    upgrades[targetObjName].isBought = true
                    upgrades[targetObjName].price *= upgrades[targetObjName].increasePricePerLevel
                    upgrades[targetObjName].level++
                    upgrades[targetObjName].profit += upgrades[targetObjName].increaseClickPerLevel
                    itemPriceElement.textContent = upgrades[targetObjName].price
                    itemProfitElement.textContent = upgrades[targetObjName].profit
                    setBalance(newBalance)
                    await setUserUpgrades(upgrades, tgID)
                    await updateUserLocalUpgrades(tgID)
                    setClickerMultiplier(upgrades)
                }
            }
        }
    }
}