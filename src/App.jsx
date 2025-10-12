import Header from "./components/modules/Header.jsx";
import Body from "./components/modules/Body.jsx";
import {useEffect, useState} from "react";
import {getUser} from "./components/database";

function App() {
    const [username, setUsername] = useState("none");
    const [rank, setRank] = useState("none");
    const [upgrades, setUpgrades] = useState({});
    const tg = window.Telegram.WebApp

    useEffect(() => {
        const user = async () => await getUser(tg.initDataUnsafe.user.id)
            .then(data => {
                setUsername(data.username)
            })
        return user
    }, []);
    return (
      <>
          <Header username={username} />
          <Body />
      </>
  )
}

export default App
