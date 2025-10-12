import hamster from '../../assets/hamster.png'

export default function Clicker({balance, setBalance}) {
    return (
        <div className="main__body-clicker" onClick={() => {
            setBalance(balance + 1)
        }}>
            <img src={hamster} alt="" className="clicker__image" style={{width: '253px', height: '254px'}}/>
        </div>
    )
}