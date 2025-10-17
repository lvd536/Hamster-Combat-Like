import Header from "./components/modules/Header.tsx"
import Body from "./components/modules/Body.tsx"
import LoadingScreen from "./components/modules/LoadingScreen.tsx"
import {useGame} from "./components/GameContext.tsx";
import './components/telegramEmulator.ts'

function App() {
    const {isLoading} = useGame()
    if (isLoading) return <LoadingScreen>Loading...</LoadingScreen>

    return (
      <>
          <Header />
          <Body />
      </>
  )
}

export default App
