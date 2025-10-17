import {useGame} from "../../GameContext.tsx";

export default function NavigationItem({name, icon}) {
    const {page, setPage} = useGame()
    return (
        <li key={name} className={page === name.toLowerCase() ? "navigation__item active" : "navigation__item"} onClick={() => setPage(`${name.toLowerCase()}`)}>
            <i className="material-icons navigation__item-icon">{icon}</i>
            <h3 className="navigation__item-name">{name}</h3>
        </li>
    )
}