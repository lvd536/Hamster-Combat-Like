export default function LoadingScreen(isActive= false) {
    return (
        <div className={isActive ? 'loading__screen active' : 'loading__screen'}>
            <h1 className="loading__screen-title">Shovel coin</h1>
            <div className="loading__screen-circle"></div>
            <span className="loading__screen-description">Loading...</span>
        </div>
    )
}