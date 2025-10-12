import logo from '../../assets/logo.png'

export default function Header({username}) {
    return (
        <div className="main__heading">
            <h2 className="main__heading-logo">Shovel Coin</h2>
            <div className="main__heading-username">
                <div className="username__icon-bg">
                    <img src={logo} alt="" className="username__icon-img"/>
                </div>
                <h3 className="username__text">{username}</h3>
            </div>
        </div>
    )
}