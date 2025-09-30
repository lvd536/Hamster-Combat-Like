import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { initClicker } from './clicker.js'
import * as env from './environment.js'
const url = env.DB_URL
const key = env.DB_KEY
let telegram = ''
const supabase = createClient(url, key)

export const createUser = async (username, telegramID) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .insert([{
                username: username,
                telegramID: telegramID,
            }])

        if (error) throw error

        return data
    } catch (error) {
        console.log('Ошибка в создании пользователя: ', error)
    }
}

export const getUser = async (tg, telegramID) => {
    telegram = tg
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('telegramID', telegramID)
            .single()

        if (error) throw error

        if (data) {
            const {balance, balanceEarned, username, rank} = data
            setUIUsername(username)
            setUIBalance(balance)
            await initClicker(balance, balanceEarned, rank, telegramID)
            return data
        }
    } catch (error) {
        console.log('Ошибка в получении пользователя: ', error)
        const { username, id } = tg.initDataUnsafe.user
        await createUser(username, id)
        setUIUsername(username)
        setUIBalance(1)
        initClicker(1, 1)
    }
}

export const getUserUpgrades = async (telegramID) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('upgrades')
            .eq('telegramID', telegramID)
            .single()

        if (error) throw error

        return data
    } catch (error) {
        console.log('Ошибка в получении апгрейдов: ', error)
        throw error
    }
}

export const getUserRank = async (telegramID) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('rank')
            .eq('telegramID', telegramID)
            .single()

        if (error) throw error
        
        return data
    } catch (error) {
        console.log('Ошибка в получении ранга: ', error)
        throw error
    }
}

export const setUserRank = async (rank, telegramID) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .update({
                    rank: rank,
                },
                {
                    returning: 'presentation'
                })
            .match({ telegramID: telegramID })

        if (error) throw error

        return data
    } catch (error) {
        console.log('Ошибка в установлении апгрейдов: ', error)
        throw error
    }
}

export const setUserUpgrades = async (upgrades, telegramID) => {
    try {
        const {data, error} = await supabase
            .from('Users')
            .update({ upgrades: upgrades }) // Передаем новый объект целиком
            .eq('telegramID', telegramID);

        if (error) throw error

        return data
    } catch (error) {
        console.log('Ошибка в установлении апгрейдов: ', error)
        throw error
    }
}

export const setUserBalance = async (newBalance, newBalanceEarned, telegramID) => {
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
            .match({ telegramID: telegramID })

        if (error) throw error

        return data
    } catch (error) {
        console.log('Ошибка в установлении баланса: ', error)
        return undefined
    }
}

export const setUserName = async (newUsername, telegramID) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .update({
                    username: newUsername,
                },
                {
                    returning: 'presentation'
                })
            .match({ telegramID: telegramID })

        if (error) throw error

        return data
    } catch (error) {
        console.log('Ошибка в установлении username: ', error)
        return undefined
    }
}

export const setUIUsername = (username) => {
    const usernameElement = document.querySelector('.username__text')
    usernameElement.innerText = username
}

export const setUIBalance = (balance) => {
    const balanceElement = document.querySelector('.stats__value-text')
    balanceElement.innerText = balance
}

export const syncBalance = async (balanceInfo = {}, telegramID) => {
    const balanceDetails = balanceInfo
    await setUserBalance(balanceDetails.balance, balanceDetails.balanceEarned, telegramID)
}