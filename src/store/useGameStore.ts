import {create} from 'zustand'
import {
    getUserUpgrades,
    setUserUpgrades,
    getUserSessionEnd,
    setUserRank,
    setUserBalance,
    getUserBalance, setUserSessionEnd
} from "../components/database.ts"
import { RANKS_CONFIG } from "../components/configs/ranksConfig.ts"
import { UPGRADES_CONFIG, UPGRADES_CONFIG_VERSION} from "../components/configs/upgradesConfig.ts"
import type {UpgradesConfigType, UpgradeType} from "../components/configs/upgradesConfig.ts"
import type {Rank} from "../components/configs/ranksConfig.ts"
import type {BalanceInfoType, UpgradesWithConfigVerType, SessionType} from "../components/database.ts"
import {devtools} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";

type MultipliersType = { click: number, auto: number, passive: number }

interface IGameContext {
    isLoading: boolean;
    balance: number;
    balanceEarned: number;
    clickMultiplier: number;
    autoClick: number;
    passiveEarn: number;
    page: string;
    rank: Rank;
    upgrades: UpgradesConfigType | object;
    earnedInPassive: number;
    userId: number;
    sessionIntervalId: number | undefined;
    autoIntervalId: number | undefined;
    syncIntervalId: number | undefined;
    setPage: (page: string) => void;
    onClick: () => void;
    buyUpgrade: (shopItem: Element) => void;
    setBalance: (balance: number) => void;
    setBalanceEarned: (balanceEarned: number) => void;
    calculateRankBarPercent: () => number;
    calculateReachNextRankValue: () => number;
    calculateRank: (balanceEarnedValue: number) => Rank;
    calculatePrice: (config: UpgradeType, lvl: number) => number;
    calculateProfit: (config: UpgradeType, lvl: number) => number;
    calculateMultipliers: (upgradesData: UpgradesConfigType) => MultipliersType;
    createUpgrade: (config: UpgradeType, lvl: number) => UpgradeType
    loadUpgrades: () => Promise<MultipliersType>;
    loadPassiveIncome: (passiveEarn: number, balance: number) => Promise<void>;
    loadUserBalance: () => Promise<BalanceInfoType>;
    updateUserRank: () => Promise<void>;
    migrateUpgrades: (userUpgrades: UpgradesConfigType, userConfigVersion: number) => Promise<{upgrades: UpgradesConfigType, configVersion: number}>;
    initSessionIntervalId: () => void;
    initAutoIntervalId: () => void;
    initSyncIntervalId: () => void;
    init: () => Promise<void>;
};

export const useUserStore = create<IGameContext>()(
    devtools(
        immer((set, get) => ({
            isLoading: true,
            userId: 0,
            clickMultiplier: 0,
            autoClick: 0,
            passiveEarn: 0,
            page: 'mine',
            rank: { name: '', id: 1, coinsToReach: 1, coinsToReachUI: '1' },
            balance: 0,
            balanceEarned: 0,
            earnedInPassive: 0,
            upgrades: {},
            sessionIntervalId: undefined,
            autoIntervalId: undefined,
            syncIntervalId: undefined,

            initSessionIntervalId: () => {
                if (get().sessionIntervalId) return
                const interval: number = setInterval(async () => {
                    await setUserSessionEnd(new Date(), window.Telegram.WebApp.initDataUnsafe.user.id);
                }, 3000)
                set(s => {s.sessionIntervalId = interval})
            },
            initAutoIntervalId: () => {
                if (get().autoIntervalId) return
                const interval: number = setInterval(async () => {
                    if (get().balance) {
                        get().setBalance(get().balance + get().autoClick)
                        get().setBalanceEarned(get().balanceEarned + get().autoClick)
                    }
                }, 1000)
                set(s => {s.autoIntervalId = interval})
            },
            initSyncIntervalId: () => {
                if (get().syncIntervalId) return
                const interval: number = setInterval(async () => {
                    if (get().balance) await setUserBalance(get().balance, get().balanceEarned, window.Telegram.WebApp.initDataUnsafe.user.id)
                }, 3000)
                set(s => {s.syncIntervalId = interval})
            },

            setPage: (page: string) => {
                set(s => { s.page = page })
            },
            onClick: () => {
                if (!get().balance) return
                set(s => { s.balance = s.balance + get().clickMultiplier })
                set(s => { s.balanceEarned = s.balanceEarned + get().clickMultiplier })
                if (get().balance >= get().rank.coinsToReach) get().updateUserRank()
            },
            buyUpgrade: async (shopItem: Element) => {
                if (shopItem) {
                    const itemNameElement: Element | null = shopItem.querySelector('.shop__item-name')
                    if (itemNameElement) {
                        const itemName: string = itemNameElement.textContent || ''
                        const upgrade: UpgradeType = Object.values(get().upgrades).find((item: UpgradeType): boolean => item.name === itemName)
                        if (!upgrade) return
                        if (get().balance >= upgrade.price) {
                            const newBalance = get().balance - upgrade.price
                            const newLevel = upgrade.level + 1
                            const newPrice = get().calculatePrice(upgrade, newLevel)
                            const newProfit = get().calculateProfit(upgrade, newLevel)

                            const newUpgrades: UpgradesConfigType = {
                                ...get().upgrades,
                                [upgrade.id]: {
                                    ...upgrade,
                                    level: newLevel,
                                    price: newPrice,
                                    profit: newProfit,
                                    isBought: true
                                }
                            };
                            const userUpgrades: UpgradesWithConfigVerType = await getUserUpgrades(window.Telegram.WebApp.initDataUnsafe.user.id)
                            const configVersion: number = userUpgrades.configVersion
                            await setUserUpgrades(newUpgrades, configVersion, window.Telegram.WebApp.initDataUnsafe.user.id)
                                .then(() => get().setBalance(newBalance))
                                .then(async () => await get().loadUpgrades())
                        }
                    }
                }
            },
            setBalance: (balance: number) => { set(s => { s.balance = balance }) },
            setBalanceEarned: (balanceEarned: number) => { set(s => { s.balanceEarned = balanceEarned }) },
            calculateRankBarPercent: () => {
                const next: any = RANKS_CONFIG.find(r => r.coinsToReach > get().balanceEarned) || RANKS_CONFIG.at(-1)
                return (get().balanceEarned / next.coinsToReach) * 100
            },
            calculateReachNextRankValue: () => {
                const next: any = RANKS_CONFIG.find(r => r.coinsToReach > get().balanceEarned) || RANKS_CONFIG.at(-1)
                return next.coinsToReach
            },
            calculateRank: (balanceEarnedValue: number) => {
                const next: any = RANKS_CONFIG.find(r => r.coinsToReach > balanceEarnedValue) || RANKS_CONFIG.at(-1)
                return RANKS_CONFIG.find(r => r.id === next.id - 1) || RANKS_CONFIG[0]
            },
            calculatePrice: (config, lvl) => {
                return Math.round(config.basePrice * Math.pow(config.priceMultiplier, lvl))
            },
            calculateProfit: (config, lvl) => {
                return config.profit + config.increaseClickPerLevel * lvl
            },
            loadUpgrades: async () => {
                const data: UpgradesWithConfigVerType = await getUserUpgrades(window.Telegram.WebApp.initDataUnsafe.user.id)
                const userUpgrades: UpgradesConfigType = data.upgrades || {}
                const userConfigVersion: number = data?.configVersion || 0

                const {upgrades, configVersion} = await get().migrateUpgrades(userUpgrades, userConfigVersion)
                set(s => { s.upgrades = upgrades })
                if (configVersion > userConfigVersion) await setUserUpgrades(upgrades, configVersion, window.Telegram.WebApp.initDataUnsafe.user.id)
                return get().calculateMultipliers(upgrades)
            },
            migrateUpgrades: async (userUpgrades: UpgradesConfigType, userConfigVersion: number)=> {
                if (userConfigVersion < UPGRADES_CONFIG_VERSION) {
                    const migrated: UpgradesConfigType = {...userUpgrades}
                    Object.keys(UPGRADES_CONFIG).forEach(id => {
                        const config: any = UPGRADES_CONFIG[id]
                        if (!migrated[id]) {
                            migrated[id] = get().createUpgrade(config, 0)
                        } else {
                            const lvl = migrated[id].level
                            migrated[id] = {
                                ...config,
                                level: lvl,
                                price: get().calculatePrice(config, lvl),
                                profit: get().calculateProfit(config, lvl),
                                isBought: lvl > 0,
                            }
                        }
                    })
                    return {upgrades: migrated, configVersion: UPGRADES_CONFIG_VERSION}
                }
                return {upgrades: userUpgrades, configVersion: userConfigVersion}
            },
            calculateMultipliers: (upgradesData) => {
                let click = 1, auto = 0, passive = 0
                Object.values(upgradesData).forEach(up => {
                    if (!up.isBought) return
                    if (up.type === "multiplier") click += up.profit
                    else if (up.type === "auto") auto += up.profit
                    else if (up.type === "passive") passive += up.profit
                })
                set(s => { s.clickMultiplier = click })
                set(s => { s.autoClick = auto })
                set(s => { s.passiveEarn = passive })

                return {click, auto, passive}
            },
            createUpgrade: (config, lvl = 0) => {
                return {
                    ...config,
                    level: lvl,
                    price: get().calculatePrice(config, lvl),
                    profit: get().calculateProfit(config, lvl),
                    isBought: lvl > 0,
                }
            },
            updateUserRank: async ()=> {
                const newRank: Rank = get().calculateRank(get().balanceEarned)
                set(s => { s.rank = newRank })
                await setUserRank(newRank.name, window.Telegram.WebApp.initDataUnsafe.user.id)
            },
            loadPassiveIncome: async (passiveEarn, balance)=> {
                const session: SessionType = await getUserSessionEnd(window.Telegram.WebApp.initDataUnsafe.user.id)
                if (!session.lastSessionEnd) return
                const last: string = new Date(session.lastSessionEnd).toISOString()
                const now: string = new Date().toISOString()
                const lastDate: Date = new Date(last)
                const nowDate: Date = new Date(now)
                const diffSeconds: number = Math.round((nowDate.valueOf() - lastDate.valueOf()) / 1000)
                if (passiveEarn > 0 && balance) {
                    const earned = diffSeconds * passiveEarn
                    set(s => { s.balance = s.balance + earned })
                    set(s => { s.balanceEarned = s.balanceEarned + earned })
                    set(s => { s.earnedInPassive = earned })
                }
            },
            loadUserBalance: async () => {
                const id = window.Telegram.WebApp.initDataUnsafe.user.id || window.Telegram.WebApp.initDataUnsafe.user.id
                const balanceInfo: BalanceInfoType = await getUserBalance(id)
                set(s => { s.balance = balanceInfo.balance })
                set(s => { s.balanceEarned = balanceInfo.balanceEarned })
                return balanceInfo
            },
            init: async () => {
                set(s => { s.userId = window.Telegram.WebApp.initDataUnsafe.user.id })
                set(s => { s.isLoading = true })
                const upgrades: MultipliersType = await get().loadUpgrades()
                const balanceInfo: BalanceInfoType = await get().loadUserBalance()
                console.log(window.Telegram.WebApp.initDataUnsafe.user.id)
                await get().loadPassiveIncome(upgrades.passive, balanceInfo.balance)
                await get().updateUserRank()
                get().initSessionIntervalId()
                get().initAutoIntervalId()
                get().initSyncIntervalId()
                set(s => { s.isLoading = false })
            },
        }))
    )
);
