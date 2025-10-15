import Info from "./Info"
import Stats from "./Stats"
import Clicker from "./Clicker"
import Top from "./Top"
import Shop from "./Shop"
import {useGame} from "../GameContext.jsx"
import Navigation from "./Navigation/Navigation.jsx";
import Modal from "./Modal.jsx";
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