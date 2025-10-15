export default function LoadingScreen() {
    return (
        <div className='loading__screen active'>
            <h1 className="loading__screen-title">Shovel coin</h1>
            <div className="loading__screen-circle"></div>
            <span className="loading__screen-description">Loading...</span>
        </div>
    )
}