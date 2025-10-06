export const addInfoNotification = (message) => {
    const notificationElement = document.createElement('div')
    notificationElement.classList.add('notification', 'info')
    notificationElement.innerHTML = `<div class="notification__main">
            <div class="notification__type">
                <i class="material-icons" style="color: rgba(255,255,255,0.47); padding-right: 2px">info</i>
                <span class="notification__type-text">Info</span>
            </div>
            <span class="notification__message">${message}</span>
        </div>`
    document.querySelector('.container').insertAdjacentElement('beforeend', notificationElement)

    setTimeout(() => {
        notificationElement.remove()
    }, 5000)
}
export const addErrorNotification = (message) => {
    const notificationElement = document.createElement('div')
    notificationElement.classList.add('notification', 'error')
    notificationElement.innerHTML = `<div class="notification__main">
            <div class="notification__type">
                <i class="material-icons" style="color: rgba(255,255,255,0.47); padding-right: 2px">error</i>
                <span class="notification__type-text">Error</span>
            </div>
            <span class="notification__message">${message}</span>
        </div>`
    document.querySelector('.container').insertAdjacentElement('beforeend', notificationElement)

    setTimeout(() => {
        notificationElement.remove()
    }, 5000)
}
export const addWarningNotification = (message) => {
    const notificationElement = document.createElement('div')
    notificationElement.classList.add('notification', 'warning')
    notificationElement.innerHTML = `<div class="notification__main">
            <div class="notification__type">
                <i class="material-icons" style="color: rgba(255,255,255,0.47); padding-right: 2px">warning</i>
                <span class="notification__type-text">Warning</span>
            </div>
            <span class="notification__message">${message}</span>
        </div>`
    document.querySelector('.container').insertAdjacentElement('beforeend', notificationElement)

    setTimeout(() => {
        notificationElement.remove()
    }, 5000)
}