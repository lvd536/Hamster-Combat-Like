import { setUIBalance, setUserRank, getUserSessionEnd } from './database.js'
import { RANKS_CONFIG } from './ranksConfig.js'
import { LOCAL_USER } from './localUserData.js'
import { addInfoNotification } from './notifications.js'

let isInitialized = false
let autoClickInterval = undefined

export const initClicker = async (userBalance, userBalanceEarned, rank) => {
    if (isInitialized) return
    LOCAL_USER.clickerData.balance = userBalance
    LOCAL_USER.clickerData.balanceEarned = userBalanceEarned
    setEventListener()
    await initializeUserRank(rank)
    isInitialized = true
}

export const setEventListener = () => {
    const button = document.querySelector('.clicker__image')
    button.addEventListener('click', async (event) => await onClick(event, button))
}

const onClick = async (event, buttonElement) => {
    addClickAmountUI(event)
    const rect = buttonElement.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    buttonElement.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`
    setTimeout(async () => {
        buttonElement.style.transform = ``
    }, 100)
    LOCAL_USER.clickerData.balance += LOCAL_USER.clickerData.clickMultiplier
    LOCAL_USER.clickerData.balanceEarned += LOCAL_USER.clickerData.clickMultiplier
    setUIBalance(LOCAL_USER.clickerData.balance)
    if (LOCAL_USER.clickerData.balanceEarned >= LOCAL_USER.clickerData.currentRank.coinsToReach) await increaseUserRank()
    updateRankBar()
}

export const setClickerMultiplier = async (upgrades) => {
    LOCAL_USER.clickerData.clickMultiplier = 1
    LOCAL_USER.clickerData.autoClick = 0
    LOCAL_USER.clickerData.passiveEarn = 0
    for (const item in upgrades) {
        if (upgrades[item].isBought) {
            switch (upgrades[item].type) {
                case 'multiplier':
                    LOCAL_USER.clickerData.clickMultiplier += upgrades[item].profit
                    break
                case 'auto':
                    LOCAL_USER.clickerData.autoClick += upgrades[item].profit
                    break
                case 'passive':
                    LOCAL_USER.clickerData.passiveEarn += upgrades[item].profit
                    break
            }
        }
    }
    setClickerInterval()
    await addUserPassiveEarn()
    document.querySelector('#coinPerTap').textContent = `+${LOCAL_USER.clickerData.clickMultiplier}`
}

export const getBalanceInfo = () => {
    return {
        balance: LOCAL_USER.clickerData.balance, balanceEarned: LOCAL_USER.clickerData.balanceEarned,
    }
}

export const setBalance = (newBalance) => {
    LOCAL_USER.clickerData.balance = newBalance
    setUIBalance(LOCAL_USER.clickerData.balance)
}

const getNextRank = () => {
    let nextObj = RANKS_CONFIG.find(rank => rank.coinsToReach >= LOCAL_USER.clickerData.balanceEarned)
    if (!nextObj) nextObj = RANKS_CONFIG[RANKS_CONFIG.length - 1];
    return nextObj
}

const calculateUserRank = async (currentRank = 'newbie') => {
    const nextObj = RANKS_CONFIG.find(rank => rank.coinsToReach >= LOCAL_USER.clickerData.balanceEarned)
    let targetObj = RANKS_CONFIG.find(rank => rank.id === nextObj.id - 1)
    if (!targetObj) targetObj = RANKS_CONFIG[RANKS_CONFIG.length - 1];
    if (targetObj.name !== currentRank) {
        await setUserRank(targetObj.name)
    }
    return targetObj
}

const increaseUserRank = async () => {
    const newRank = getNextRank()
    await setUserRank(newRank.name)
    await initializeUserRank(newRank.name)
}

const updateRankBar = () => {
    const rankBarElement = document.querySelector('.stats__ranking-filled-bar')
    const nextRankObj = getNextRank()
    const rankReachPercent = (LOCAL_USER.clickerData.balanceEarned / nextRankObj.coinsToReach) * 100
    rankBarElement.style.width = `${rankReachPercent}%`
}

const initializeUserRank = async (rank = 'newbie') => {
    const coinsToReachElement = document.querySelector('#coinToLevelUp')
    const currentRankElement = document.querySelector('.stats__ranking-rank')

    const userRankObj = await calculateUserRank(rank)
    const nextRankObj = getNextRank(userRankObj.name)

    updateRankBar(userRankObj)

    coinsToReachElement.textContent = nextRankObj.coinsToReachUI
    currentRankElement.textContent = userRankObj.name
    LOCAL_USER.clickerData.currentRank = userRankObj
}

const addClickAmountUI = (event) => {
    const amountElement = document.createElement(`div`)
    amountElement.classList.add('click_amount')
    amountElement.innerText = `${LOCAL_USER.clickerData.clickMultiplier}`
    const clicker = document.querySelector('.main__body-clicker')
    const rect = clicker.getBoundingClientRect()
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    amountElement.style.top = y - 30 + 'px'
    amountElement.style.left = x - 10 + 'px'
    const amountCreatedElement = clicker.insertAdjacentElement('afterbegin', amountElement)
    setTimeout(() => {
        amountCreatedElement.remove()
    }, 500)
}

const setClickerInterval = () => {
    clearInterval(autoClickInterval)
    autoClickInterval = setInterval(async () => {
        LOCAL_USER.clickerData.balance += LOCAL_USER.clickerData.autoClick
        LOCAL_USER.clickerData.balanceEarned += LOCAL_USER.clickerData.autoClick
        setUIBalance(LOCAL_USER.clickerData.balance)
    }, 1000)
}

const addUserPassiveEarn = async () => {
    const lastSessionDate = await getUserSessionEnd().then((date) => {
        return new Date(date.lastSessionEnd)
    })
    const dateNow = new Date()
    const resultInSeconds = Math.round((dateNow - lastSessionDate) / 1000)
    if (resultInSeconds <= 20) return
    const earnValue = resultInSeconds * LOCAL_USER.clickerData.passiveEarn
    LOCAL_USER.clickerData.balance += earnValue
    LOCAL_USER.clickerData.balanceEarned += earnValue
    setUIBalance(LOCAL_USER.clickerData.balance)
    addInfoNotification(`Вы успешно получили пассивный доход: ${earnValue}`)
}