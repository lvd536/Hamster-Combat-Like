import NavigationItem from "./NavigationItem.jsx";

export default function Navigation() {
    return (
        <nav className="navigation">
            <ul className="navigation__list" style={{display: 'flex'}}>
                <NavigationItem icon="construction" name="Mine"/>
                <NavigationItem icon="account_balance_wallet" name="Shop"/>
                <NavigationItem icon="leaderboard" name="Top"/>
            </ul>
        </nav>
    )
}