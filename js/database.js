import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { initClicker } from './clicker.js'
import * as env from './environment.js'
import { LOCAL_USER } from "./localUserData.js";
import * as upgradesConfig from './upgradesConfig.js'
import { addErrorNotification} from "./notifications.js";

const supabase = createClient(env.DB_URL, env.DB_KEY)

export const createUser = async () => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .insert([{
                username: LOCAL_USER.telegram.username,
                telegramID: LOCAL_USER.telegram.tgID,
                upgrades: upgradesConfig.UPGRADES_CONFIG,
                upgradesConfigVersion: upgradesConfig.UPGRADES_CONFIG_VERSION
            }])

        if (error) throw error

        return data
    } catch (error) {
        addErrorNotification(`Ошибка в создании пользователя: ${error.message}`)
    }
}

export const getUser = async () => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('telegramID', LOCAL_USER.telegram.tgID)
            .maybeSingle()

        if (error) throw error
        
        if (data === null) {
            await createUser()
            setUIUsername()
            setUIBalance()
            await initClicker(LOCAL_USER.clickerData.balance, LOCAL_USER.clickerData.balanceEarned, LOCAL_USER.clickerData.currentRank)
        }
        else {
            const {balance, balanceEarned, rank} = data
            setUIUsername()
            setUIBalance()
            await initClicker(balance, balanceEarned, rank)
            return data
        }
    } catch (error) {
        addErrorNotification(`Ошибка в получении пользователя: ${error.message}`)
    }
}

export const setUserRank = async (rank) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .update({
                    rank: rank,
                },
                {
                    returning: 'presentation'
                })
            .match({ telegramID: LOCAL_USER.telegram.tgID })

        if (error) throw error

        return data
    } catch (error) {
        addErrorNotification(`Ошибка в установлении апгрейдов ${error.message}`)
        throw error
    }
}

export const getUserUpgrades = async () => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('upgrades, upgradesConfigVersion')
            .eq('telegramID', LOCAL_USER.telegram.tgID)
            .single()

        if (error) throw error

        return data
    } catch (error) {
        addErrorNotification(`Ошибка в получении апгрейдов: ${error.message}`)
        throw error
    }
}

export const setUserUpgrades = async (upgrades, configVersion) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .update({
                upgrades: upgrades,
                upgradesConfigVersion: configVersion
            })
            .eq('telegramID', LOCAL_USER.telegram.tgID);

        if (error) throw error

        return data
    } catch (error) {
        addErrorNotification(`Ошибка в установлении апгрейдов: ${error.message}`)
        throw error
    }
}

export const setUserBalance = async (newBalance, newBalanceEarned) => {
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
            .match({ telegramID: LOCAL_USER.telegram.tgID })

        if (error) throw error

        return data
    } catch (error) {
        addErrorNotification(`Ошибка в установлении баланса: ${error.message}`)
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
        addErrorNotification(`Ошибка в получении топа: ${error.message}`)
        return undefined
    }
}

export const setUserSessionEnd = async (date = new Date()) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .update({
                    lastSessionEnd: date
                },
                {
                    returning: 'presentation'
                })
            .match({ telegramID: LOCAL_USER.telegram.tgID })

        if (error) throw error

        return data
    } catch (error) {
        addErrorNotification(`Ошибка в обновлении даты окончания последней сессии: ${error.message}`)
        return undefined
    }
}

export const getUserSessionEnd = async () => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('lastSessionEnd')
            .eq('telegramID', LOCAL_USER.telegram.tgID)
            .single()

        if (error) throw error

        return data
    } catch (error) {
        addErrorNotification(`Ошибка в получении даты окончания последней сессии: ${error.message}`)
        return undefined
    }
}

export const setUIUsername = () => {
    const usernameElement = document.querySelector('.username__text')
    usernameElement.innerText = LOCAL_USER.telegram.username
}

export const setUIBalance = () => {
    const balanceElement = document.querySelector('.stats__value-text')
    balanceElement.innerText = LOCAL_USER.clickerData.balance
}

export const syncBalance = async (balanceInfo = {}) => {
    const balanceDetails = balanceInfo
    await setUserBalance(balanceDetails.balance, balanceDetails.balanceEarned)
}