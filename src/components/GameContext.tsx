import {createContext, type ReactNode, useContext, useEffect, useState} from "react"
import {
    getUserUpgrades,
    setUserUpgrades,
    getUserSessionEnd,
    setUserRank,
    setUserBalance,
    getUserBalance, setUserSessionEnd
} from "./database.ts"
import { RANKS_CONFIG } from "./configs/ranksConfig.ts"
import { UPGRADES_CONFIG, UPGRADES_CONFIG_VERSION} from "./configs/upgradesConfig.ts"
import type {UpgradesConfigType, UpgradeType} from "./configs/upgradesConfig.ts"
import type {Rank} from "./configs/ranksConfig.ts"
import type {BalanceInfoType, UpgradesWithConfigVerType, SessionType} from "../components/database.ts"
import * as React from "react";

interface GameProviderProps {
    children: ReactNode;
}

type PageState = 'mine' | 'top' | 'shop'

type GameContextType = {
    isLoading: boolean;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    balanceEarned: number;
    clickMultiplier: number;
    autoClick: number;
    passiveEarn: number;
    page: PageState;
    setPage: React.Dispatch<React.SetStateAction<PageState>>;
    rank: Rank;
    upgrades: UpgradesConfigType | {};
    onClick: () => void;
    buyUpgrade: (shopItem: Element) => void;
    calculateRankBarPercent: () => number;
    calculateReachNextRankValue: () => number;
    calculateRank: (balanceEarnedValue: number) => Rank;
    earnedInPassive: number;
    userId: number;
};

type MultipliersType = { click: number, auto: number, passive: number }

const GameContext = createContext<GameContextType | null>(null)

export const useGame = () => useContext(GameContext)

export function GameProvider({ children } : GameProviderProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [balance, setBalance] = useState<number>(0)
    const [balanceEarned, setBalanceEarned] = useState<number>(0)
    const [rank, setRank] = useState<Rank>(RANKS_CONFIG[0])
    const [upgrades, setUpgradesState] = useState<UpgradesConfigType | object>({})
    const [clickMultiplier, setClickMultiplier] = useState<number>(1)
    const [autoClick, setAutoClick] = useState<number>(0)
    const [passiveEarn, setPassiveEarn] = useState<number>(0)
    const [earnedInPassive, setEarnedInPassive] = useState<number>(0)
    const [page, setPage] = useState<PageState>("mine")
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id

    // ------------------- INITIALIZATION -------------------
    useEffect(() => {
        async function init() {
            setIsLoading(true)
            const upgrades: MultipliersType = await loadUpgrades()
            const balanceInfo: BalanceInfoType = await loadUserBalance()
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
        const balanceInfo: BalanceInfoType = await getUserBalance(userId && window.Telegram.WebApp.initDataUnsafe.user.id)
        setBalance(balanceInfo.balance)
        setBalanceEarned(balanceInfo.balanceEarned)
        return balanceInfo
    }
    // ------------------- LOADING UPGRADES -------------------
    async function loadUpgrades() {
        const data: UpgradesWithConfigVerType = await getUserUpgrades(userId)
        const userUpgrades : UpgradesConfigType = data.upgrades || {}
        const userConfigVersion: number = data?.configVersion || 0

        const { upgrades: migrated, configVersion } = migrateUpgrades(userUpgrades, userConfigVersion)
        setUpgradesState(migrated)
        if (configVersion > userConfigVersion) await setUserUpgrades(migrated, configVersion, userId)
        const multipliers = calculateMultipliers(migrated)
        return multipliers
    }

    // ------------------- RANK SYSTEM ;) -------------------
    async function updateUserRank() {
        const newRank: Rank = calculateRank(balanceEarned)
        setRank(newRank)
        await setUserRank(newRank.name, userId)
    }

    function calculateRank(balanceEarnedValue: number) {
        const next: any = RANKS_CONFIG.find(r => r.coinsToReach > balanceEarnedValue) || RANKS_CONFIG.at(-1)
        const current = RANKS_CONFIG.find(r => r.id === next.id - 1) || RANKS_CONFIG[0]
        return current
    }

    function calculateRankBarPercent() {
        const next: any = RANKS_CONFIG.find(r => r.coinsToReach > balanceEarned) || RANKS_CONFIG.at(-1)
        const rankReachPercent = (balanceEarned / next.coinsToReach) * 100
        return rankReachPercent
    }

    function calculateReachNextRankValue() {
        const next: any = RANKS_CONFIG.find(r => r.coinsToReach > balanceEarned) || RANKS_CONFIG.at(-1)
        return next.coinsToReach
    }

    // ------------------- MULTIPLIERS -------------------
    function calculateMultipliers(upgradesData: UpgradesConfigType) {
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
    async function loadPassiveIncome(passiveEarn: number, balance: number) {
        const session: SessionType = await getUserSessionEnd(userId)
        if (!session.lastSessionEnd) return
        const last: string = new Date(session.lastSessionEnd).toISOString()
        const now: string = new Date().toISOString()
        const lastDate: Date = new Date(last)
        const nowDate: Date = new Date(now)
        const diffSeconds: number = Math.round((nowDate.valueOf() - lastDate.valueOf()) / 1000)
        if (passiveEarn > 0 && balance) {
            const earned = diffSeconds * passiveEarn
            setBalance(b => b + earned)
            setBalanceEarned(be => be + earned)
            setEarnedInPassive(earned)
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
    function migrateUpgrades(userUpgrades: UpgradesConfigType, userConfigVersion: number) {
        if (userConfigVersion < UPGRADES_CONFIG_VERSION) {
            const migrated: UpgradesConfigType = { ...userUpgrades }
            Object.keys(UPGRADES_CONFIG).forEach(id => {
                const config: any = UPGRADES_CONFIG[id]
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

    function createUpgrade(config: UpgradeType, lvl: number = 0) {
        return {
            ...config,
            level: lvl,
            price: calculatePrice(config, lvl),
            profit: calculateProfit(config, lvl),
            isBought: lvl > 0,
        }
    }

    function calculatePrice(config: UpgradeType, lvl: number) {
        return Math.round(config.basePrice * Math.pow(config.priceMultiplier, lvl))
    }

    function calculateProfit(config: UpgradeType, lvl: number) {
        return config.profit + config.increaseClickPerLevel * lvl
    }

    async function buyUpgrade(shopItem: Element ) {
        if (shopItem) {
            const itemNameElement: Element | null = shopItem.querySelector('.shop__item-name')
            if (itemNameElement) {
                const itemName: string = itemNameElement.textContent
                const upgrade: UpgradeType = Object.values(upgrades).find((item: UpgradeType): boolean => item.name === itemName)
                if (balance >= upgrade.price) {
                    const newBalance = balance - upgrade.price
                    const newLevel = upgrade.level + 1
                    const newPrice = calculatePrice(upgrade, newLevel)
                    const newProfit = calculateProfit(upgrade, newLevel)

                    const newUpgrades: UpgradesConfigType = {
                        ...upgrades,
                        [upgrade.id]: { // Обновляем элемент по его id
                            ...upgrade,
                            level: newLevel,
                            price: newPrice,
                            profit: newProfit,
                            isBought: true
                        }
                    };
                    const userUpgrades: UpgradesWithConfigVerType = await getUserUpgrades(userId)
                    const configVersion: number = userUpgrades.configVersion
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
