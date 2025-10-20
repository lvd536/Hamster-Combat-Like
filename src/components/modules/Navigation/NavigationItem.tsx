import {useUserStore} from "../../../store/useGameStore.ts";

interface NavigationItemProps {
    name: string;
    icon: React.ReactNode;
}

export default function NavigationItem({name, icon}: NavigationItemProps) {
    const page = useUserStore(s => s.page)
    const setPage = useUserStore(s => s.setPage)
    return (
        <li key={name} className={page === name.toLowerCase() ? "navigation__item active" : "navigation__item"} onClick={() => setPage(`${name.toLowerCase()}`)}>
            <i className="material-icons navigation__item-icon">{icon}</i>
            <h3 className="navigation__item-name">{name}</h3>
        </li>
    )
}