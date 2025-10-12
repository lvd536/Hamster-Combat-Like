window.Telegram = window.Telegram || {}
window.Telegram.WebApp = {
    initData: "auth_date=169xxx&user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Dev%22%7D&hash=fakehash",
    initDataUnsafe: {
        auth_date: Math.floor(Date.now() / 1000),
        user: {id: 1016623551, first_name: "Dev", username: "lvdshka"},
        hash: "fakehash"
    },
    isExpanded: false,
    ready: true,
    sendData: (data) => {
        console.log("sendData called:", data);
    },
    expand: () => {
        console.log("expand called");
    },
    MainButton: {
        text: "OK", onClick: (fn) => {
            window._mainClick = fn
        }
    }
}
