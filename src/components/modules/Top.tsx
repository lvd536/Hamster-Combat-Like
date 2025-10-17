import {getUsersTop} from "../database.ts"
import {useEffect, useState} from "react"
import LoadingScreen from "./LoadingScreen.tsx";
import type {TopUser} from '../database.ts'

export default function Top() {
    const [topUsers, setTopUsers] = useState<TopUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        async function fetchTopUsers() {
            await getUsersTop()
                .then(res => setTopUsers(res))
                .then(() => setIsLoading(false))
        }
        fetchTopUsers()
    }, [])
    if (isLoading) return <LoadingScreen styles={{borderTopLeftRadius: '20px', borderTopRightRadius: '20px'}}>Loading Top...</LoadingScreen>
    return (<>
        {topUsers.map((user, index: number) => (
            <li key={index} className={`top__item ${index === 0 ? `top__item border-gold`
                : index === 1 ? `top__item border-silver`
                    : index === 2 ? `top__item border-bronze`
                        : ``}`}>
                <div className="top__info">
                    <div className="top__position">
                        <span className="top__number">{index + 1}</span>
                    </div>
                    <div className="top__stats">
                        <p className="top__username">{user.username}</p>
                        <p className="top__rank">{user.rank}</p>
                    </div>
                    {index === 0 ? <i className="material-icons crown-gold">emoji_events</i>
                    : index === 1 ? <i className="material-icons crown-silver">emoji_events</i>
                        : index === 2 ? <i className="material-icons crown-bronze">emoji_events</i>
                            : ``}
                </div>
                <div className="top__balance">
                    <p className="top__balance-value">{user.balanceEarned || 0}</p>
                    <p className="top__balance-text">Balance Earned</p>
                </div>
            </li>
        ))}
    </>)
}