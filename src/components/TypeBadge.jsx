import { typeBadgeStyle } from "../typeColors.js";

function TypeBadge({ type }) {
  return (
    <span className="type-badge" style={typeBadgeStyle(type)}>
      {type}
    </span>
  );
}

export default TypeBadge;
