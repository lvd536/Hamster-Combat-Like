import { setUIBalance, setUserRank } from './database.js'

let balance = 0
let balanceEarned = 0
let clickMultiplier = 1
let currentRank = {}
let isInitialized = false
let userID = 0

const rankList = [
    {
        name: 'newbie',
        id: 1,
        coinsToReach: 0,
        coinsToReachUI: '0'
    },
    {
        name: 'sucker',
        id: 2,
        coinsToReach: 5000,
        coinsToReachUI: '5K'
    },
    {
        name: 'budding',
        id: 3,
        coinsToReach: 50000,
        coinsToReachUI: '50K'
    },
    {
        name: 'respected',
        id: 4,
        coinsToReach: 150000,
        coinsToReachUI: '150K'
    },
    {
        name: 'avid',
        id: 5,
        coinsToReach: 500000,
        coinsToReachUI: '500k'
    },
    {
        name: 'reliable',
        id: 6,
        coinsToReach: 1000000,
        coinsToReachUI: '1M'
    },
    {
        name: 'farmer',
        id: 7,
        coinsToReach: 2000000,
        coinsToReachUI: '2M'
    },
    {
        name: 'supplier',
        id: 8,
        coinsToReach: 5000000,
        coinsToReachUI: '5M'
    },
    {
        name: 'magnate',
        id: 9,
        coinsToReach: 10000000,
        coinsToReachUI: '10M'
    },
    {
        name: 'shovel',
        id: 10,
        coinsToReach: 100000000,
        coinsToReachUI: '100M'
    },
    {
        name: 'shavel',
        id: 11,
        coinsToReach: 500000000,
        coinsToReachUI: '500M'
    }
];

export const initClicker = async (userBalance, userBalanceEarned, rank, telegramID) => {
    if (isInitialized) return
    balance = userBalance
    balanceEarned = userBalanceEarned
    userID = telegramID
    setEventListener()
    await initializeUserRank(rank, userID)
    isInitialized = true
}

export const setEventListener = () => {
    const button = document.querySelector('.clicker__image')
    button.addEventListener('click', async () => await onClick(button))
}

const onClick = async (buttonElement) => {
    buttonElement.classList.add('clicked');
    setTimeout(async () => {
        buttonElement.classList.remove('clicked')
    }, 200)
    balance += clickMultiplier
    balanceEarned += clickMultiplier
    setUIBalance(balance)
    if (balanceEarned >= currentRank.coinsToReach) await increaseUserRank()
    updateRankBar(currentRank)
}

export const setClickerMultiplier = (upgrades) => {
    clickMultiplier = 1
    for (const item in upgrades) {
        if (upgrades[item].isBought) clickMultiplier += upgrades[item].profit
    }
    document.querySelector('#coinPerTap').textContent = `+${clickMultiplier}`
}

export const getBalanceInfo = () => {
    return {
        balance: balance, balanceEarned: balanceEarned,
    }
}

export const setBalance = (newBalance) => {
    balance = newBalance
    setUIBalance(balance)
}

const getNextRank = (currentRank = 'newbie') => {
    let nextObj = rankList.find(rank => rank.coinsToReach >= balanceEarned)
    if (!nextObj) nextObj = rankList[rankList.length - 1];
    return nextObj
}

const calculateUserRank = async (currentRank = 'newbie', telegramID) => {
    const nextObj = rankList.find(rank => rank.coinsToReach >= balanceEarned)
    let targetObj = rankList.find(rank => rank.id === nextObj.id - 1)
    if (!targetObj) targetObj = rankList[rankList.length - 1];
    if (targetObj.name !== currentRank) {
        await setUserRank(targetObj.name, telegramID)
    }
    return targetObj
}

const increaseUserRank = async () => {
    const newRank = getNextRank(currentRank)
    await setUserRank(newRank.name, userID)
    await initializeUserRank(newRank.name, userID)
}

const updateRankBar = (userRankObj) => {
    const rankBarElement = document.querySelector('.stats__ranking-filled-bar')
    const nextRankObj = getNextRank(userRankObj.name)
    const rankReachPercent = (balanceEarned / nextRankObj.coinsToReach) * 100
    rankBarElement.style.width = `${rankReachPercent}%`
}

const initializeUserRank = async (rank = 'newbie', telegramID) => {
    const coinsToReachElement = document.querySelector('#coinToLevelUp')
    const currentRankElement = document.querySelector('.stats__ranking-rank')

    const userRankObj = await calculateUserRank(rank, telegramID)
    const nextRankObj = getNextRank(userRankObj.name)

    updateRankBar(userRankObj)

    coinsToReachElement.textContent = nextRankObj.coinsToReachUI
    currentRankElement.textContent = userRankObj.name
    currentRank = userRankObj
}