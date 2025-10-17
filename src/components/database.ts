import * as upgradesConfig from './configs/upgradesConfig.ts'
import {createClient, type PostgrestSingleResponse} from '@supabase/supabase-js'
import type {UpgradesConfigType} from "./configs/upgradesConfig.ts"

export type BalanceInfoType = {
    balance: number
    balanceEarned: number
}

export type UpgradesWithConfigVerType =  {
    upgrades: {
        topFarmers: {
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
            isBought: false
        },
        memeCoins: {
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
            isBought: false
        },
        marginX10: {
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
            isBought: false
        },
        marginX20: {
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
            isBought: false
        },
        passiveTrader: {
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
            isBought: false
        }
    },
    configVersion: number
}

export type SessionType = {
    lastSessionEnd: string
}

export interface TopUser {
    id: number;
    username: string;
    balance: number;
    balanceEarned: number;
    upgrades: UpgradesConfigType;
    telegramID: number;
    rank: string;
    upgradesConfigVersion: number;
    lastSessionEnd: string | null;
}

const supabase = createClient(import.meta.env.VITE_DB_URL, import.meta.env.VITE_DB_KEY)

export const createUser = async (): Promise<object> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .insert([{
                username: window.Telegram.WebApp.initDataUnsafe.user.username,
                telegramID: window.Telegram.WebApp.initDataUnsafe.user.id,
                upgrades: upgradesConfig.UPGRADES_CONFIG,
                upgradesConfigVersion: upgradesConfig.UPGRADES_CONFIG_VERSION
            }])

        if (error) throw error

        return data
    } catch (error: any) {
        console.warn(`Ошибка в создании пользователя: ${error.message}`)
        return error
    }
}

export const getUser = async (id: number): Promise<any> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .select('*')
            .eq('telegramID', id)
            .maybeSingle()

        if (error) throw error
        
        if (data === null) { await createUser() }
        else return data
    } catch (error: any) {
        console.warn(`Ошибка в получении пользователя: ${error.message}`)
        return error
    }
}

export const setUserRank = async (rank: string, id: number): Promise<object> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .update({
                    rank: rank,
                })
            .match({ telegramID: id })

        if (error) throw error

        return data
    } catch (error: any) {
        console.warn(`Ошибка в установлении апгрейдов ${error.message}`)
        throw error
    }
}

export const getUserUpgrades = async (id: number): Promise<UpgradesWithConfigVerType> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .select('upgrades, upgradesConfigVersion')
            .eq('telegramID', id)
            .single()

        if (error) throw error

        return data
    } catch (error: any) {
        console.warn(`Ошибка в получении апгрейдов: ${error.message}`)
        throw error
    }
}

export const setUserUpgrades = async (upgrades: UpgradesConfigType, configVersion: number, id: number): Promise<UpgradesWithConfigVerType> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .update({
                upgrades: upgrades,
                upgradesConfigVersion: configVersion
            })
            .eq('telegramID', id)

        if (error) throw error

        return data
    } catch (error: any) {
        console.warn(`Ошибка в установлении апгрейдов: ${error.message}`)
        throw error
    }
}

export const getUserBalance = async (id: number): Promise<BalanceInfoType> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .select('balance, balanceEarned')
            .eq('telegramID', id)
            .single()

        if (error) throw error

        return data
    } catch (error: any) {
        console.warn(`Ошибка в получении баланса пользователя: ${error.message}`)
        throw error
    }
}

export const setUserBalance = async (newBalance: number, newBalanceEarned: number, id: number): Promise<object> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .update({
                    balance: newBalance,
                    balanceEarned: newBalanceEarned,
                })
            .match({ telegramID: id })

        if (error) throw error

        return data
    } catch (error: any) {
        console.warn(`Ошибка в установлении баланса: ${error.message}`)
        return error
    }
}

export const getUsersTop = async (): Promise<TopUser[]> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .select()
            .order('balanceEarned', { ascending: false })
            .limit(5)

        if (error) throw error
        return data
    } catch (error: any) {
        console.warn(`Ошибка в получении топа: ${error.message}`)
        return error
    }
}

export const setUserSessionEnd = async (date: object = new Date(), id: number): Promise<object> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .update({
                    lastSessionEnd: date
                })
            .match({ telegramID: id })

        if (error) throw error

        return data
    } catch (error: any) {
        console.warn(`Ошибка в обновлении даты окончания последней сессии: ${error.message}`)
        return error
    }
}

export const getUserSessionEnd = async (id: number): Promise<SessionType> => {
    try {
        const { data, error }: PostgrestSingleResponse<any> = await supabase
            .from('Users')
            .select('lastSessionEnd')
            .eq('telegramID', id)
            .single()

        if (error) throw error

        return data
    } catch (error: any) {
        console.warn(`Ошибка в получении даты окончания последней сессии: ${error.message}`)
        return error
    }
}