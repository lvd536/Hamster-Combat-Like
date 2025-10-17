import coin from '../../assets/coin.png'
import {useGame} from "../GameContext.tsx"

export default function Info() {
    const gameContext = useGame()
    if (!gameContext) return
    const {clickMultiplier, calculateRankBarPercent, calculateReachNextRankValue, balanceEarned, calculateRank} = gameContext
    return (
        <ul className="main__body-info">
            <li className="info__item">
                <h3 className="info__item-name" style={{color: '#f79841'}}>Earn per tap</h3>
                <div className="info__item-desc">
                    <img src={coin} alt="" className="info__item-image"/>
                    <h2 className="info__item-value" id="coinPerTap">{`+${clickMultiplier}`}</h2>
                </div>
            </li>
            <li className="info__item" style={{margin: '0 10px 0 10px', width: '130px'}}>
                <div className="stats__ranking">
                    <span className="stats__ranking-rank">{calculateRank(balanceEarned).name}</span>
                    <div className="stats__ranking-bar">
                        <div className="stats__ranking-filled-bar" style={{width: `${calculateRankBarPercent()}%`}}></div>
                    </div>
                </div>
            </li>
            <li className="info__item">
                <h3 className="info__item-name" style={{color: '#6f72e2'}}>Coins to level up</h3>
                <h2 className="info__item-value" id="coinToLevelUp">{calculateReachNextRankValue()}</h2>
            </li>
        </ul>
    )
}