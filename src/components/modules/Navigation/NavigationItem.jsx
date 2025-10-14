import {useGame} from "../../GameContext.jsx";

export default function NavigationItem(props) {
    const {page, setPage} = useGame()
    return (
        <li key={props.name} className={page === props.name.toLowerCase() ? "navigation__item active" : "navigation__item"} onClick={() => setPage(`${props.name.toLowerCase()}`)}>
            <i className="material-icons navigation__item-icon">{props.icon}</i>
            <h3 className="navigation__item-name">{props.name}</h3>
        </li>
    )
}