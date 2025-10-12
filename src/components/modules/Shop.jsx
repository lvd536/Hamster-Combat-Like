import {useGame} from "../GameContext.jsx"
import {useEffect} from "react"
import mixitup from "mixitup"
import coin from '../../assets/coin.png'

export default function Shop() {
    const {upgrades, buyUpgrade} = useGame()
    useEffect(() => {
        const mixer = mixitup('.shop__items')
        mixer.filter('.category-a')
    }, [])

    async function onUpgradeClick(event){
        if (event.target.closest('.shop__item-price')) {
            const shopItem = event.target.closest('.shop__item')
            if (shopItem) {
                await buyUpgrade(shopItem)
            }
        }
    }

    return (<>
        <div className="sort__buttons">
            <button className="sort__button" type="button" data-filter=".category-a">Click</button>
            <button className="sort__button" type="button" data-filter=".category-b">Auto Click</button>
            <button className="sort__button" type="button" data-filter=".category-c">Passive</button>
        </div>
        <ul className="shop__items">
            {Object.values(upgrades)
                .sort((a, b) => a.order - b.order)
                .map((upgrade) => (<li
                    key={upgrade.id}
                    className={`shop__item mix ${upgrade.category}`}
                    data-order={upgrade.id}
                >
                    <div className="shop__item-info">
                        <img
                            src={upgrade.image}
                            alt=""
                            className="shop__item-image"
                        />
                        <div className="shop__item-pricing">
                            <span className="shop__item-name">{upgrade.name}</span>
                            <span className="shop__item-profit-label">
                  Profit per{" "}
                                {upgrade.type === "multiplier" ? "click" : upgrade.type === "auto" ? "second" : upgrade.type === "passive" ? "hour" : "click"}
                </span>
                            <span className="shop__item-profit">
                  <img
                      src={coin}
                      alt=""
                      className="profit__image"
                  />
                  <span className="profit__value">{upgrade.profit}</span>
                </span>
                        </div>
                    </div>

                    <div className="shop__item-details">
                        <span className="shop__item-level">lvl {upgrade.level}</span>
                        <span className="shop__item-price">
                <img
                    src={coin}
                    alt=""
                    className="price__image"
                />
                <span className="price__value" onClick={async (e) => await onUpgradeClick(e)}>{upgrade.price}</span>
              </span>
                    </div>
                </li>))}
        </ul>
    </>)
}