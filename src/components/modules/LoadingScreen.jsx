export default function LoadingScreen({children, styles= {}}) {
    return (
        <div className='loading__screen active' style={styles}>
            <h1 className="loading__screen-title">Shovel coin</h1>
            <div className="loading__screen-circle"></div>
            <span className="loading__screen-description">{children}</span>
        </div>
    )
}