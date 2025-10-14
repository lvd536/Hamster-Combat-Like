import Info from "./Info"
import Stats from "./Stats"
import Clicker from "./Clicker"
import Top from "./Top"
import Shop from "./Shop"
import {useGame} from "../GameContext.jsx"
import Navigation from "./Navigation/Navigation.jsx";

export default function Body() {
    const {page} = useGame()

    return (
        <div className="main__body">
            { page === "mine" && <Info /> }
            <Stats />
            { page === "mine" && <Clicker /> }
            { page === "shop" && <Shop /> }
            { page === "top" && <Top /> }
            <Navigation/>
        </div>
    )
}