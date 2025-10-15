import Header from "./components/modules/Header.jsx"
import Body from "./components/modules/Body.jsx"
import LoadingScreen from "./components/modules/LoadingScreen.jsx"
import {useGame} from "./components/GameContext.jsx";

function App() {
    const {isLoading} = useGame()

    if (isLoading) return <LoadingScreen />

    return (
      <>
          <Header />
          <Body />
      </>
  )
}

export default App
