interface SortButtonProps {
    category: string;
    name: string;
}

export default function SortButton({category, name}: SortButtonProps) {
    return (
        <button className="sort__button" type="button" data-filter={`.category-${category}`}>{name}</button>
    )
}