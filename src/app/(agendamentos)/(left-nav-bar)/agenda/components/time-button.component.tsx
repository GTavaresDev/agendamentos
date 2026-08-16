export function TimeButton({
  time,
  selected,
  disabled,
  onClick,
}: {
  time: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  let className =
    "h-11 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50";

  if (disabled) {
    className =
      "h-11 cursor-not-allowed rounded-lg border border-transparent bg-zinc-100 text-sm font-medium text-zinc-300 line-through transition";
  } else if (selected) {
    className =
      "h-11 rounded-lg border border-zinc-950 bg-zinc-950 text-sm font-medium text-white shadow-sm transition";
  }

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {time}
    </button>
  );
}
