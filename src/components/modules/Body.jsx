import Info from "./Info";
import Stats from "./Stats";
import Clicker from "./Clicker";
import Top from "./Top";
import Shop from "./Shop";
import {useEffect, useState} from "react";
import {getUser, setUserBalance} from '../database.js'

export default function Body() {
    const [page, setPage] = useState('main')
    const [balance, setBalance] = useState(1)
    const [balanceEarned, setBalanceEarned] = useState(1)

    useEffect(() => {
        const result = async () => await getUser(window.Telegram.WebApp.initDataUnsafe.user.id)
            .then(({balance, balanceEarned}) => {
                setBalance(balance)
                setBalanceEarned(balanceEarned)
            })

        const syncBalanceInterval = setInterval(async () => {
            await setUserBalance(balance, balanceEarned, window.Telegram.WebApp.initDataUnsafe.user.id)
        }, 2500)

        return clearInterval(syncBalanceInterval)
    }, [])

    function changePage(page) {
        setPage(page)
    }

    return (
        <div className="main__body">
            { page === "main" && <Info balanceEarned={balanceEarned} /> }
            <Stats balance={balance}/>
            { page === "main" && <Clicker setBalance={setBalance} balance={balance}/> }
            { page === "shop" && <Shop /> }
            { page === "top" && <Top /> }
            <nav className="navigation">
                <ul className="navigation__list" style={{display: 'flex'}}>
                    <li className={page === 'main' ? "navigation__item active" : "navigation__item"} onClick={() => changePage('main')}>
                        <i className="material-icons navigation__item-icon">construction</i>
                        <h3 className="navigation__item-name">Mine</h3>
                    </li>
                    <li className={page === 'shop' ? "navigation__item active" : "navigation__item"} onClick={() => changePage('shop')}>
                        <i className="material-icons navigation__item-icon">account_balance_wallet</i>
                        <h3 className="navigation__item-name">Shop</h3>
                    </li>
                    <li className={page === 'top' ? "navigation__item active" : "navigation__item"} onClick={() => changePage('top')}>
                        <i className="material-icons navigation__item-icon">leaderboard</i>
                        <h3 className="navigation__item-name">Top</h3>
                    </li>
                </ul>
            </nav>
        </div>
    )
}