import Info from "./Info.js"
import Stats from "./Stats.js"
import Clicker from "./Clicker.js"
import Top from "./Top.js"
import Shop from "./Shop.js"
import {useGame} from "../GameContext.tsx"
import Navigation from "./Navigation/Navigation.tsx";
import Modal from "./Modal.tsx";
import {useState} from "react";
import coin from '../../assets/coin.png'

export default function Body() {
    const {page, earnedInPassive} = useGame()
    const [passiveEarnModel, setPassiveEarnModel] = useState(true)

    return (
        <div className="main__body">
            { page === "mine" && <Info /> }
            <Stats />
            { page === "mine" && <Clicker /> }
            { page === "shop" && <Shop /> }
            { page === "top" && <Top /> }
            <Navigation/>
            {passiveEarnModel && <Modal active={passiveEarnModel} setActive={() => setPassiveEarnModel(false)}>
                Пока Вас небыло - Вы получили {earnedInPassive}
                <img src={coin} alt="" style={{width: '18px', height: '18px', marginLeft: '5px'}}/>
            </Modal>}
        </div>
    )
}