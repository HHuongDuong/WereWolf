type FilterValue = "all" | "waiting" | "in-progress";

export function RoomsToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onCreateClick,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FilterValue;
  onFilterChange: (value: FilterValue) => void;
  onCreateClick: () => void;
}) {
  return (
    <div className="rooms-toolbar">
      <div className="rooms-search-wrap">
        <svg className="rooms-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="rooms-search"
          placeholder="Search rooms or hosts..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className="rooms-filters">
        {(["all", "waiting", "in-progress"] as const).map(f => (
          <button
            key={f}
            className={`rooms-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => onFilterChange(f)}
          >
            {f === "all" ? "All" : f === "waiting" ? "Open" : "In Progress"}
          </button>
        ))}
      </div>

      <button className="rooms-create-btn" onClick={onCreateClick}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Create Room
      </button>
    </div>
  );
}
