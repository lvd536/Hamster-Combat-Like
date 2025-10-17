export default function Modal({active, setActive, children}) {
    return(
        <>
            <div className={active ? 'modal active' : 'modal'}>
                <div className="modal__info">
                    <i className="material-icons modal__icon">bolt</i>
                    <p className="modal__name">Information</p>
                </div>
                <div className={active ? 'modal__content active' : 'modal__content'}>{children}</div>
                <button className={active ? 'modal__close active' : 'modal__close'} onClick={() => setActive()}>Close modal</button>
            </div>
        </>
    )
}