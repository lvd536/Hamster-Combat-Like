import {useGame} from "../../GameContext.tsx";

export default function NavigationItem({name, icon}) {
    const gameContext = useGame()
    if (!gameContext) return
    const {page, setPage} = gameContext
    return (
        <li key={name} className={page === name.toLowerCase() ? "navigation__item active" : "navigation__item"} onClick={() => setPage(`${name.toLowerCase()}`)}>
            <i className="material-icons navigation__item-icon">{icon}</i>
            <h3 className="navigation__item-name">{name}</h3>
        </li>
    )
}