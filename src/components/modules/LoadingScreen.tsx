import loadingHamster from '../../assets/loadingHamster.png';

export default function LoadingScreen({children, styles= {}}) {
    return (
        <div className='loading__screen active' style={styles}>
            <img src={loadingHamster} alt="" className="loading__screen-image" style={{width:'230px',height:'230px'}}/>
            <h1 className="loading__screen-title">Shovel coin</h1>
            <span className="loading__screen-description">{children}</span>
        </div>
    )
}