import {useGame} from "../GameContext.jsx"

export default function LoadingScreen() {
    const {isLoading} = useGame()
    return (
        <div className={isLoading ? 'loading__screen active' : 'loading__screen'}>
            <h1 className="loading__screen-title">Shovel coin</h1>
            <div className="loading__screen-circle"></div>
            <span className="loading__screen-description">Loading...</span>
        </div>
    )
}