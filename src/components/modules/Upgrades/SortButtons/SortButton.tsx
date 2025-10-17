export default function SortButton({category, name}) {
    return (
        <button className="sort__button" type="button" data-filter={`.category-${category}`}>{name}</button>
    )
}