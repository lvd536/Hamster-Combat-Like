import { getUsersTop } from './database.js'

export const initTop = async () => {
    const navElements = document.querySelectorAll('.navigation__item');
    navElements[2].addEventListener('click', async () => {
        navElements[0].classList.toggle('active', false)
        navElements[1].classList.toggle('active', false)
        navElements[2].classList.toggle('active', true)
        const topUsers = await getUsersTop()
        let topItemsElement = ``
        for (let i = 0; i < topUsers.length; i++) {
            const crownElement = i === 0 ? `<i class="material-icons crown-gold">emoji_events</i>`
                : i === 1 ? `<i class="material-icons crown-gold">emoji_events</i>`
                    : i === 2 ? `<i class="material-icons crown-gold">emoji_events</i>`
                        : ``
            topItemsElement += `<li class="top__item border-gold">
                            <div class="top__info">
                                <div class="top__position">
                                    <span class="top__number">${i+1}</span>
                                </div>
                                <div class="top__stats">
                                    <p class="top__username">${topUsers[i].username}</p>
                                    <p class="top__rank">${topUsers[i].rank}</p>
                                </div>
                                ${crownElement}
                            </div>
                            <div class="top__balance">
                                <p class="top__balance-value">${topUsers[i].balanceEarned}</p>
                                <p class="top__balance-text">Balance Earned</p>
                            </div>
                        </li>`
        }
        document.querySelector('.main__body-clicker').innerHTML =
            `<div class="main__body-top"><ul class="top__items">${topItemsElement}</ul></div>`
    })
}