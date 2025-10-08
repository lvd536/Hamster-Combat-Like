import * as supabase from './database.js'
import { getBalanceInfo } from './clicker.js'
import { initShop } from './shop.js'
import { initTop } from './top.js'
import { LOCAL_USER } from './localUserData.js'
import { setUserSessionEnd } from "./database.js";

const tg = window.Telegram.WebApp
const loadingElement = document.querySelector('[data-js-loading-screen-main]')
loadingElement.classList.add('active')

LOCAL_USER.telegram.tgID = tg.initDataUnsafe.user.id
LOCAL_USER.telegram.username = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name

await supabase.getUser()
    .then( () => tg.expand() )
    .then( async () => await initShop())
    .then( async () => await initTop())
    .then( () => loadingElement.classList.remove('active'))
    .catch(() => location.reload())

setInterval( async () => {
    const balanceInfo = getBalanceInfo()
    await supabase.syncBalance(balanceInfo)
    await setUserSessionEnd()
}, 5000)
