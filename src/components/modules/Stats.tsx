import coin from '../../assets/coin.png'
import {useGame} from "../GameContext.tsx";

export default function Stats() {
    const gameContext = useGame()
    if (!gameContext) return
    const { balance } = gameContext
    return (
        <div className="main__body-stats">
            <div className="stats__value">
                <img src={coin} alt="" className="stats__image" style={{marginRight: '10px', width: '35px', height: '35px'}}/>
                <h2 className="stats__value-text">{balance}</h2>
            </div>
        </div>
    )
}