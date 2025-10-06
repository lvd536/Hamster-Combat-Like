import * as supabase from './database.js'
import { getBalanceInfo } from './clicker.js'
import { initShop } from './shop.js'
import { initTop } from './top.js'
import { LOCAL_USER } from './localUserData.js'
import {getUserSessionEnd, setUserSessionEnd} from "./database.js";

const tg = window.Telegram.WebApp
const loadingElement = document.querySelector('[data-js-loading-screen-main]')
loadingElement.classList.add('active')

LOCAL_USER.telegram.tgID = tg.initDataUnsafe.user.id
LOCAL_USER.telegram.username = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name

const validUserCheck = setInterval( async () => {
    if (document.querySelector('.username__text').innerText === 'loading...') {
        await supabase.getUser(tg)
    }
    else {
        LOCAL_USER.telegram.username = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name
        LOCAL_USER.telegram.tgID = tg.initDataUnsafe.user.id
        tg.expand()
        await initShop(LOCAL_USER.telegram.tgID).then(async () => await initTop())
        setInterval( async () => {
            const balanceInfo = getBalanceInfo()
            await supabase.syncBalance(balanceInfo, LOCAL_USER.telegram.tgID)
            await setUserSessionEnd()
        }, 5000)
        loadingElement.classList.remove('active')
        clearInterval(validUserCheck)
    }
}, 2000)
