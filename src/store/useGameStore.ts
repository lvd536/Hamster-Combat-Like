import {create} from 'zustand'
import {useEffect} from "react"
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
import * as React from "react";

interface IGameContext {
    isLoading: boolean;
    balance: number;
    setBalance: () => void;
    balanceEarned: number;
    clickMultiplier: number;
    autoClick: number;
    passiveEarn: number;
    page: string;
    setPage: React.Dispatch<React.SetStateAction<string>>;
    rank: Rank;
    upgrades: UpgradesConfigType | object;
    onClick: () => void;
    buyUpgrade: (shopItem: Element) => void;
    calculateRankBarPercent: () => number;
    calculateReachNextRankValue: () => number;
    calculateRank: (balanceEarnedValue: number) => Rank;
    earnedInPassive: number;
    userId: number;
    sessionIntervalId: ReturnType<typeof window.setInterval> | undefined;
    autoIntervalId: ReturnType<typeof window.setInterval> | undefined;
    syncIntervalId: ReturnType<typeof window.setInterval> | undefined;
    init: () => Promise<void>;
    destroy: () => void;
};

const useGameStore = create<IGameContext>((set, get) => {
        // ------------------- Setting Balance -------------------
        async function loadUserBalance() {
            const balanceInfo: BalanceInfoType = await getUserBalance(get().userId && window.Telegram.WebApp.initDataUnsafe.user.id)
            set({balance: balanceInfo.balance})
            set({balanceEarned: balanceInfo.balanceEarned})
            return balanceInfo
        }
        // ------------------- LOADING UPGRADES -------------------
        async function loadUpgrades() {
            const data: UpgradesWithConfigVerType = await getUserUpgrades(get().userId)
            const userUpgrades : UpgradesConfigType = data.upgrades || {}
            const userConfigVersion: number = data?.configVersion || 0

            const { upgrades: migrated, configVersion } = migrateUpgrades(userUpgrades, userConfigVersion)
            set({upgrades: migrated})
            if (configVersion > userConfigVersion) await setUserUpgrades(migrated, configVersion, get().userId)
            return calculateMultipliers(migrated)
        }

        // ------------------- RANK SYSTEM ;) -------------------
        async function updateUserRank() {
            const newRank: Rank = calculateRank()
            set({rank: newRank})
            await setUserRank(newRank.name, get().userId)
        }

        function calculateRank() {
            const next: any = RANKS_CONFIG.find(r => r.coinsToReach > get().balanceEarned) || RANKS_CONFIG.at(-1)
            return RANKS_CONFIG.find(r => r.id === next.id - 1) || RANKS_CONFIG[0]
        }

        function calculateRankBarPercent() {
            const next: any = RANKS_CONFIG.find(r => r.coinsToReach > get().balanceEarned) || RANKS_CONFIG.at(-1)
            return (get().balanceEarned / next.coinsToReach) * 100
        }

        function calculateReachNextRankValue() {
            const next: any = RANKS_CONFIG.find(r => r.coinsToReach > get().balanceEarned) || RANKS_CONFIG.at(-1)
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
            set({clickMultiplier:click, autoClick:auto, passiveEarn:passive})

            return { click, auto, passive }
        }

        // ------------------- CLICK LOGIC -------------------
        function onClick() {
            if (!get().balance) return
            set((state) => ({
                balance: state.balance + get().clickMultiplier,
                balanceEarned: state.balanceEarned + get().clickMultiplier,
            }))
            if (get().balance >= get().rank.coinsToReach) updateUserRank()
        }

        // ------------------- AUTO CLICK -------------------
        useEffect(() => {
            const interval = setInterval(() => {
                if (get().balance) {
                    set((state) => ({
                        balance: state.balance + get().autoClick,
                        balanceEarned: state.balanceEarned + get().autoClick,
                    }))
                }
            }, 1000)
            return () => clearInterval(interval)
        }, [get().isLoading, get().autoClick])

        // ------------------- PASSIVE INCOME -------------------
        async function loadPassiveIncome(passiveEarn: number, balance: number) {
            const session: SessionType = await getUserSessionEnd(get().userId)
            if (!session.lastSessionEnd) return
            const last: string = new Date(session.lastSessionEnd).toISOString()
            const now: string = new Date().toISOString()
            const lastDate: Date = new Date(last)
            const nowDate: Date = new Date(now)
            const diffSeconds: number = Math.round((nowDate.valueOf() - lastDate.valueOf()) / 1000)
            if (passiveEarn > 0 && balance) {
                const earned = diffSeconds * passiveEarn
                set((state) => ({
                    balance: state.balance + earned,
                    balanceEarned: state.balanceEarned + earned,
                    earnedInPassive: earned,
                }))
            }
        }
        // ------------------- Balance Sync -------------------
        useEffect(() => {
            const interval = setInterval(async () => {
                if (get().balance) await setUserBalance(get().balance, get().balanceEarned, get().userId)
            }, 1000)
            return () => clearInterval(interval)
        }, [get().balance, get().balanceEarned, get().userId])
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
                    const upgrade: UpgradeType = Object.values(get().upgrades).find((item: UpgradeType): boolean => item.name === itemName)
                    if (get().balance >= upgrade.price) {
                        const newBalance = get().balance - upgrade.price
                        const newLevel = upgrade.level + 1
                        const newPrice = calculatePrice(upgrade, newLevel)
                        const newProfit = calculateProfit(upgrade, newLevel)

                        const newUpgrades: UpgradesConfigType = {
                            ...get().upgrades,
                            [upgrade.id]: { // Обновляем элемент по его id
                                ...upgrade,
                                level: newLevel,
                                price: newPrice,
                                profit: newProfit,
                                isBought: true
                            }
                        };
                        const userUpgrades: UpgradesWithConfigVerType = await getUserUpgrades(get().userId)
                        const configVersion: number = userUpgrades.configVersion
                        await setUserUpgrades(newUpgrades, configVersion, get().userId)
                            .then(() => set({balance: newBalance}))
                            .then(async () => await loadUpgrades())
                    }
                }
            }
        }

    async function init() {
        if (get().isLoading === false && get().userId !== null) return;
        set({ isLoading: true });

        const userId =
            typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initDataUnsafe
                ? (window as any).Telegram.WebApp.initDataUnsafe.user.id
                : null;
        set({ userId });

        const multis = await loadUpgrades();
        const balanceInfo = await loadUserBalance();
        await loadPassiveIncome(multis.passive, balanceInfo.balance);
        await updateUserRank();

        if (userId) {
            if (get().sessionIntervalId) {
                window.clearInterval(get().sessionIntervalId!);
            }
            const sid = window.setInterval(async () => {
                await setUserSessionEnd(new Date(), userId);
            }, 3000);
            set({ sessionIntervalId: sid });
        }

        if (get().autoIntervalId) window.clearInterval(get().autoIntervalId);
        const autoId = window.setInterval(() => {
            const { autoClick } = get();
            if (autoClick) {
                set((s) => ({ balance: s.balance + autoClick, balanceEarned: s.balanceEarned + autoClick }));
            }
        }, 1000);
        set({ autoIntervalId: autoId });

        if (get().syncIntervalId) window.clearInterval(get().syncIntervalId);
        const syncId = window.setInterval(async () => {
            const { balance, balanceEarned, userId } = get();
            if (userId && balance) {
                await setUserBalance(balance, balanceEarned, userId);
            }
        }, 1000);
        set({ syncIntervalId: syncId });

        set({ isLoading: false });
    }

    function destroy() {
        if (get().sessionIntervalId) {
            window.clearInterval(get().sessionIntervalId);
            set({ sessionIntervalId: undefined });
        }
        if (get().autoIntervalId) {
            window.clearInterval(get().autoIntervalId);
            set({ autoIntervalId: undefined });
        }
        if (get().syncIntervalId) {
            window.clearInterval(get().syncIntervalId);
            set({ syncIntervalId: undefined });
        }
    }

    if (typeof window !== "undefined") {
        setTimeout(() => {
            get().init().catch((e) => console.error("Game store init failed:", e));
        }, 0);
        window.addEventListener("beforeunload", () => {
            get().destroy();
        });
    }

        return {
            isLoading: true,
            balance: 0,
            balanceEarned: 0,
            rank: RANKS_CONFIG[0],
            upgrades: {},
            clickMultiplier: 1,
            autoClick: 0,
            passiveEarn: 0,
            earnedInPassive: 0,
            page: "mine",
            userId: null,

            sessionIntervalId: undefined,
            autoIntervalId: undefined,
            syncIntervalId: undefined,

            init,
            destroy,
            onClick,
            buyUpgrade,
            calculateRankBarPercent,
            calculateReachNextRankValue,
            calculateRank,
        }
})
