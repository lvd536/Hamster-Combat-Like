import { setUIBalance, setUserRank } from './database.js'

// balance vars
let balance = 0
let balanceEarned = 0
// earnings vars
let clickMultiplier = 1
let autoClick = 0
let passiveEarn = 0
// other vars
let currentRank = {}
let isInitialized = false
let userID = 0
let autoClickInterval = undefined

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
    balance += clickMultiplier
    balanceEarned += clickMultiplier
    setUIBalance(balance)
    if (balanceEarned >= currentRank.coinsToReach) await increaseUserRank()
    updateRankBar(currentRank)
}

export const setClickerMultiplier = (upgrades) => {
    clickMultiplier = 1
    autoClick = 0
    passiveEarn = 0
    for (const item in upgrades) {
        if (upgrades[item].isBought) {
            switch (upgrades[item].type) {
                case 'multiplier':
                    clickMultiplier += upgrades[item].profit
                    break
                case 'auto':
                    autoClick += upgrades[item].profit
                    break
                case 'passive':
                    passiveEarn += upgrades[item].profit
                    break
            }
        }
    }
    setClickerInterval()
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

const getNextRank = () => {
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
    const newRank = getNextRank()
    await setUserRank(newRank.name, userID)
    await initializeUserRank(newRank.name, userID)
}

const updateRankBar = () => {
    const rankBarElement = document.querySelector('.stats__ranking-filled-bar')
    const nextRankObj = getNextRank()
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

const addClickAmountUI = (event) => {
    const amountElement = document.createElement(`div`)
    amountElement.classList.add('click_amount')
    amountElement.innerText = clickMultiplier
    const clicker = document.querySelector('.main__body-clicker')
    const rect = clicker.getBoundingClientRect()
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    amountElement.style.top = y + 'px'
    amountElement.style.left = x + 'px'
    const amountCreatedElement = clicker.insertAdjacentElement('afterbegin', amountElement)
    setTimeout(() => {
        amountCreatedElement.remove()
    }, 500)
}

const setClickerInterval = () => {
    clearInterval(autoClickInterval)
    autoClickInterval = setInterval(async () => {
        balance += autoClick
        balanceEarned += autoClick
        setUIBalance(balance)
    }, 1000)
}