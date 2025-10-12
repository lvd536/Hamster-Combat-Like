import * as upgradesConfig from './configs/upgradesConfig.js'
import {createClient} from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_DB_URL, import.meta.env.VITE_DB_KEY)

export const createUser = async (username, id) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .insert([{
                username: username,
                telegramID: id,
                upgrades: upgradesConfig.UPGRADES_CONFIG,
                upgradesConfigVersion: upgradesConfig.UPGRADES_CONFIG_VERSION
            }])

        if (error) throw error

        return data
    } catch (error) {
        console.warn(`Ошибка в создании пользователя: ${error.message}`)
    }
}

export const getUser = async (id) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('telegramID', id)
            .maybeSingle()

        if (error) throw error
        
        if (data === null) { await createUser() }
        else return data
    } catch (error) {
        console.warn(`Ошибка в получении пользователя: ${error.message}`)
    }
}

export const setUserRank = async (rank, id) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .update({
                    rank: rank,
                },
                {
                    returning: 'presentation'
                })
            .match({ telegramID: id })

        if (error) throw error

        return data
    } catch (error) {
        console.warn(`Ошибка в установлении апгрейдов ${error.message}`)
        throw error
    }
}

export const getUserUpgrades = async (id) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('upgrades, upgradesConfigVersion')
            .eq('telegramID', id)
            .single()

        if (error) throw error

        return data
    } catch (error) {
        console.warn(`Ошибка в получении апгрейдов: ${error.message}`)
        throw error
    }
}

export const setUserUpgrades = async (upgrades, configVersion, id) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .update({
                upgrades: upgrades,
                upgradesConfigVersion: configVersion
            })
            .eq('telegramID', id)

        if (error) throw error

        return data
    } catch (error) {
        console.warn(`Ошибка в установлении апгрейдов: ${error.message}`)
        throw error
    }
}

export const getUserBalance = async (id) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('balance, balanceEarned')
            .eq('telegramID', id)
            .single()

        if (error) throw error

        return data
    } catch (error) {
        console.warn(`Ошибка в получении баланса пользователя: ${error.message}`)
        throw error
    }
}

export const setUserBalance = async (newBalance, newBalanceEarned, id) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .update({
                    balance: newBalance,
                    balanceEarned: newBalanceEarned,
                },
                {
                    returning: 'presentation'
                })
            .match({ telegramID: id })

        if (error) throw error

        return data
    } catch (error) {
        console.warn(`Ошибка в установлении баланса: ${error.message}`)
        return undefined
    }
}

export const getUsersTop = async () => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .select()
            .order('balanceEarned', { ascending: false })
            .limit(5)

        if (error) throw error
        return data
    } catch (error) {
        console.warn(`Ошибка в получении топа: ${error.message}`)
        return undefined
    }
}

export const setUserSessionEnd = async (date = new Date(), id) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .update({
                    lastSessionEnd: date
                },
                {
                    returning: 'presentation'
                })
            .match({ telegramID: id })

        if (error) throw error

        return data
    } catch (error) {
        console.warn(`Ошибка в обновлении даты окончания последней сессии: ${error.message}`)
        return undefined
    }
}

export const getUserSessionEnd = async (id) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('lastSessionEnd')
            .eq('telegramID', id)
            .single()

        if (error) throw error

        return data
    } catch (error) {
        console.warn(`Ошибка в получении даты окончания последней сессии: ${error.message}`)
        return undefined
    }
}