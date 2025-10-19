import hamster from '../../assets/hamster.png'
import {useGame} from "../GameContext.tsx"
import {useState} from "react"

type Click = { id: number; x: number; y: number }

export default function Clicker() {
    const [clicks, setClicks] = useState<Click[]>([])
    const gameContext = useGame()
    if (!gameContext) return null
    const {onClick, clickMultiplier} = gameContext
    function handleClick(event: React.MouseEvent<HTMLDivElement>) {
        onClick()
        const card = event.currentTarget
        const rect = card.getBoundingClientRect()
        const x = event.clientX - rect.left - rect.width / 2
        const y = event.clientY - rect.top - rect.height / 2
        card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`
        setTimeout(() => {
            card.style.transform = ""
        }, 100)

        const newClick: Click = { id: Date.now(), x: event.pageX, y: event.pageY }
        setClicks(prev => [...prev, newClick])
    }
    const handleAnimationEnd = (id: number) => {
        setClicks((prev) => prev.filter((click) => click.id !== id))
    }

    return (
        <>
        <div className="main__body-clicker" onClick={(e: React.MouseEvent<HTMLDivElement>) => { handleClick(e) }}>
            <img src={hamster} alt="" className="clicker__image" style={{width: '253px', height: '254px'}}/>
        </div>
        {clicks.map((click) => (
            <div
                key={click.id}
                className="click_amount"
                style={{
                    top: `${click.y - 170}px`,
                    left: `${click.x - 10}px`,
                }}
                onAnimationEnd={() => handleAnimationEnd(click.id)}
            >
                {clickMultiplier}
            </div>
        ))}
        </>
    )
}