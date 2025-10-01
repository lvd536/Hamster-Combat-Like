import * as supabase from './database.js'
import { getBalanceInfo } from './clicker.js'
import { initShop } from './shop.js'
import { initTop } from './top.js'

const tg = window.Telegram.WebApp
const loadingElement = document.querySelector('[data-js-loading-screen-main]')
loadingElement.classList.add('active')

let { username, id } = tg.initDataUnsafe.user

const validUserCheck = setInterval( async () => {
    if (document.querySelector('.username__text').innerText === 'loading...') {
        await supabase.getUser(tg, tg.initDataUnsafe.user.id)
    }
    else {
        username = tg.initDataUnsafe.user.username
        id = tg.initDataUnsafe.user.id
        tg.expand()
        await initShop(id)
        await initTop()
        setInterval( async () => {
            const balanceInfo = getBalanceInfo()
            await supabase.syncBalance(balanceInfo, id)
        }, 5000)

        loadingElement.classList.remove('active')
        clearInterval(validUserCheck)
    }
}, 2000)
