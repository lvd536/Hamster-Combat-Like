import coin from "../../../assets/coin.png";
import {useGame} from "../../GameContext.tsx";

export default function UpgradeItems() {
    const gameContext = useGame()
    if (!gameContext) return
    const {upgrades, buyUpgrade} = gameContext

    async function onUpgradeClick(event: React.MouseEvent): Promise<void> {
        const target = event.target
        if (target instanceof Element)
        {
            if (target.closest('.shop__item-price')) {
                const shopItem = target.closest('.shop__item')
                if (shopItem) {
                    await buyUpgrade(shopItem)
                }
            }
        }
    }

    return (
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
    )
}