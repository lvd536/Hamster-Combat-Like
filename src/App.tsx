import Header from "./components/modules/Header.tsx"
import Body from "./components/modules/Body.tsx"
import LoadingScreen from "./components/modules/LoadingScreen.tsx"
import './components/telegramEmulator.ts'
import {useUserStore} from "./store/useGameStore.ts";
import {useEffect} from "react";

function App() {
    const isLoading = useUserStore(s => s.isLoading)
    const init = useUserStore(s => s.init)

    useEffect(() => {
        console.log('App useEffect — init identity:', typeof init)
        if (typeof init !== 'function') {
            console.error('init is not a function', init)
            return
        }

        let mounted = true;
        (async () => {
            try {
                console.log('Calling init()')
                await init()
                console.log('init() finished')
            } catch (err) {
                console.error('init() threw', err)
            } finally {
                if (!mounted) return
                console.log('init() finally block')
            }
        })()

        return () => { mounted = false }
    }, [init])

    if (isLoading) return <LoadingScreen>Loading...</LoadingScreen>

    return (
      <>
          <Header />
          <Body />
      </>
  )
}

export default App
