import SortButton from "./SortButton.jsx";
import {useEffect} from "react";
import mixitup from "mixitup";

export default function SortButtonList() {
    useEffect(() => {
        const mixer = mixitup('.shop__items')
        mixer.filter('.category-a')
    }, [])

    return (
        <div className="sort__buttons">
            <SortButton category='a' name='Click' />
            <SortButton category='b' name='Auto Click' />
            <SortButton category='c' name='Passive' />
        </div>
    )
}