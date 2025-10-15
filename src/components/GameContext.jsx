import { createContext, useContext, useEffect, useState } from "react"
import {
    getUserUpgrades,
    setUserUpgrades,
    getUserSessionEnd,
    setUserRank,
    setUserBalance,
    getUserBalance, setUserSessionEnd
} from "./database.js"
import { RANKS_CONFIG } from "./configs/ranksConfig.js"
import { UPGRADES_CONFIG, UPGRADES_CONFIG_VERSION } from "./configs/upgradesConfig.js"

const GameContext = createContext()

export const useGame = () => useContext(GameContext)

export function GameProvider({ children }) {
    const [isLoading, setIsLoading] = useState(true)
    const [balance, setBalance] = useState(null)
    const [balanceEarned, setBalanceEarned] = useState(null)
    const [rank, setRank] = useState(RANKS_CONFIG[0])
    const [upgrades, setUpgradesState] = useState({})
    const [clickMultiplier, setClickMultiplier] = useState(1)
    const [autoClick, setAutoClick] = useState(0)
    const [passiveEarn, setPassiveEarn] = useState(0)
    const [earnedInPassive, setEarnedInPassive] = useState(0)
    const [page, setPage] = useState("mine")
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id

    // ------------------- INITIALIZATION -------------------
    useEffect(() => {
        async function init() {
            setIsLoading(true)
            const upgrades = await loadUpgrades()
            const balanceInfo = await loadUserBalance()
            await loadPassiveIncome(upgrades.passive, balanceInfo.balance)
            await updateUserRank()
            setIsLoading(false)
        }
        init()
    }, [])
    useEffect(() => {
        const sessionEndTracker = setInterval(async () => {
            await setUserSessionEnd(new Date(), userId)
        }, 3000)
        return () => clearInterval(sessionEndTracker)
    }, [userId])
    // ------------------- Setting Balance -------------------
    async function loadUserBalance() {
        const balanceInfo = await getUserBalance(userId && window.Telegram.WebApp.initDataUnsafe.user.id)
        setBalance(balanceInfo.balance)
        setBalanceEarned(balanceInfo.balanceEarned)
        return balanceInfo
    }
    // ------------------- LOADING UPGRADES -------------------
    async function loadUpgrades() {
        const data = await getUserUpgrades(userId)
        const userUpgrades = data?.upgrades || {}
        const userConfigVersion = data?.upgradesConfigVersion || 0

        const { upgrades: migrated, configVersion } = migrateUpgrades(userUpgrades, userConfigVersion)
        setUpgradesState(migrated)
        if (configVersion > userConfigVersion) await setUserUpgrades(migrated, configVersion, userId)
        const multipliers = calculateMultipliers(migrated)
        return multipliers
    }

    // ------------------- RANK SYSTEM ;) -------------------
    async function updateUserRank() {
        const newRank = calculateRank(balanceEarned)
        setRank(newRank)
        await setUserRank(newRank.name, userId)
    }

    function calculateRank(balanceEarnedValue) {
        const next = RANKS_CONFIG.find(r => r.coinsToReach > balanceEarnedValue) || RANKS_CONFIG.at(-1)
        const current = RANKS_CONFIG.find(r => r.id === next.id - 1) || RANKS_CONFIG[0]
        return current
    }

    function calculateRankBarPercent() {
        const next = RANKS_CONFIG.find(r => r.coinsToReach > balanceEarned) || RANKS_CONFIG.at(-1)
        const rankReachPercent = (balanceEarned / next.coinsToReach) * 100
        return rankReachPercent
    }

    function calculateReachNextRankValue() {
        const next = RANKS_CONFIG.find(r => r.coinsToReach > balanceEarned) || RANKS_CONFIG.at(-1)
        return next.coinsToReach
    }

    // ------------------- MULTIPLIERS -------------------
    function calculateMultipliers(upgradesData) {
        let click = 1, auto = 0, passive = 0
        Object.values(upgradesData).forEach(up => {
            if (!up.isBought) return
            if (up.type === "multiplier") click += up.profit
            else if (up.type === "auto") auto += up.profit
            else if (up.type === "passive") passive += up.profit
        })
        setClickMultiplier(click)
        setAutoClick(auto)
        setPassiveEarn(passive)

        return { click, auto, passive }
    }

    // ------------------- CLICK LOGIC -------------------
    function onClick() {
        if (!balance) return
        setBalance((currentBalance) => currentBalance + clickMultiplier)
        setBalanceEarned((currentBalanceEarned) => currentBalanceEarned + clickMultiplier)
        if (balance >= rank.coinsToReach) updateUserRank()
    }

    // ------------------- AUTO CLICK -------------------
    useEffect(() => {
        const interval = setInterval(() => {
            if (balance) {
                setBalance(b => b + autoClick)
                setBalanceEarned(be => be + autoClick)
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [isLoading, autoClick])

    // ------------------- PASSIVE INCOME -------------------
    async function loadPassiveIncome(passiveEarn, balance) {
        const session = await getUserSessionEnd(userId)
        if (!session.lastSessionEnd) return
        const last = new Date(session.lastSessionEnd).toISOString()
        const now = new Date().toISOString()
        console.log('now', now)
        console.log('last', last)
        const diffSeconds = Math.round((new Date(now) - new Date(last)) / 1000)
        if (passiveEarn > 0 && balance) {
            const earned = diffSeconds * passiveEarn
            setBalance(b => b + earned)
            setBalanceEarned(be => be + earned)
            setEarnedInPassive(earned)
            console.log(session.lastSessionEnd)
            console.log(`Пассивный доход: +${earned}`)
        }
    }
    // ------------------- Balance Sync -------------------
    useEffect(() => {
        const interval = setInterval(async () => {
            if (balance) await setUserBalance(balance, balanceEarned, userId)
        }, 1000)
        return () => clearInterval(interval)
    }, [balance, balanceEarned, userId])
    // ------------------- MIGRATION -------------------
    function migrateUpgrades(userUpgrades, userConfigVersion) {
        if (userConfigVersion < UPGRADES_CONFIG_VERSION) {
            const migrated = { ...userUpgrades }
            Object.keys(UPGRADES_CONFIG).forEach(id => {
                const config = UPGRADES_CONFIG[id]
                if (!migrated[id]) {
                    migrated[id] = createUpgrade(config, 0)
                } else {
                    const lvl = migrated[id].level
                    migrated[id] = {
                        ...config,
                        level: lvl,
                        price: calculatePrice(config, lvl),
                        profit: calculateProfit(config, lvl),
                        isBought: lvl > 0,
                    }
                }
            })
            return { upgrades: migrated, configVersion: UPGRADES_CONFIG_VERSION }
        }
        return { upgrades: userUpgrades, configVersion: userConfigVersion }
    }

    function createUpgrade(config, lvl = 0) {
        return {
            ...config,
            level: lvl,
            price: calculatePrice(config, lvl),
            profit: calculateProfit(config, lvl),
            isBought: lvl > 0,
        }
    }

    function calculatePrice(config, lvl) {
        return Math.round(config.basePrice * Math.pow(config.priceMultiplier, lvl))
    }

    function calculateProfit(config, lvl) {
        return config.profit + config.increaseClickPerLevel * lvl
    }

    async function buyUpgrade(shopItem) {
        if (shopItem) {
            const itemNameElement = shopItem.querySelector('.shop__item-name')
            if (itemNameElement) {
                const itemName = itemNameElement.textContent
                const targetObjName = Object.keys(upgrades).find(key => upgrades[key].name === itemName)
                const upgrade = upgrades[targetObjName]
                const currentBalance = balance
                if (currentBalance >= upgrade.price) {
                    const newBalance = currentBalance - upgrade.price
                    const newLevel = upgrade.level + 1
                    const newPrice = calculatePrice(upgrade, newLevel)
                    const newProfit = calculateProfit(upgrade, newLevel)

                    const newUpgrades = ({
                        ...upgrades,
                        [targetObjName]: {
                            ...upgrade,
                            level: newLevel,
                            price: newPrice,
                            profit: newProfit,
                            isBought: true
                        }
                    })
                    const configVersion = await getUserUpgrades(userId).configVersion
                    await setUserUpgrades(newUpgrades, configVersion, userId)
                        .then(() => setBalance(newBalance))
                        .then(async () => await loadUpgrades())
                }
            }
        }
    }

    return (
        <GameContext.Provider
            value={{
                isLoading,
                balance,
                setBalance,
                balanceEarned,
                clickMultiplier,
                autoClick,
                passiveEarn,
                page,
                setPage,
                rank,
                upgrades,
                onClick,
                buyUpgrade,
                calculateRankBarPercent,
                calculateReachNextRankValue,
                calculateRank,
                earnedInPassive,
                userId
            }}
        >
            {children}
        </GameContext.Provider>
    )
}
