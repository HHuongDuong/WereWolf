import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  key: string;
  icon: string;
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: "play",        icon: "/img/assets/logo.svg",            label: "Wolfy",    href: "/rooms"                               },
  { key: "skin",        icon: "/img/icons/skin-icon.svg",        label: "My skin",  href: "/skin"                                },
  { key: "leaderboard", icon: "/img/icons/leaderboard-icon.svg", label: "Ranking",  href: "/leaderboard"                         },
  { key: "shop",        icon: "/img/icons/shop-icon.svg",        label: "Shop",     href: "/shop",  badge: "New"                 },
  { key: "help",        icon: "/img/icons/help-icon.svg",        label: "Help",     href: "https://help.wolfy.net", external: true },
];

export function PlayHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="ph-header">
      {/* Left: navigation */}
      <div className="ph-left">
        <nav className="ph-nav">
          {NAV_ITEMS.map(item => {
            const isActive = !item.external && location.pathname.startsWith(item.href);
            if (item.external) {
              return (
                <a
                  key={item.key}
                  className="ph-nav-item"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={item.icon} alt={item.label} className="ph-nav-icon" />
                  <span className="ph-nav-label">{item.label}</span>
                </a>
              );
            }
            return (
              <div
                key={item.key}
                className={`ph-nav-item${isActive ? " active" : ""}`}
                onClick={() => navigate(item.href)}
                role="button"
                tabIndex={0}
              >
                <img src={item.icon} alt={item.label} className="ph-nav-icon" />
                <span className="ph-nav-label">{item.label}</span>
                {"badge" in item && item.badge && (
                  <span className="ph-nav-badge">{item.badge}</span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right: wallet + notifications */}
      <div className="ph-right">
        <div className="ph-money-box">
          <a className="ph-money-item ph-money-coins" href="/shop">
            <img src="/img/icons/piece.svg" alt="Coins" className="ph-money-icon" />
            <span className="ph-money-count">0</span>
          </a>
          <a className="ph-money-item ph-money-moons" href="/shop">
            <img src="/img/icons/moon.svg" alt="Moons" className="ph-money-icon" />
            <span className="ph-money-count">0</span>
          </a>
        </div>
        <div className="ph-notifications">
          <img src="/img/icons/notification.svg" alt="Notifications" className="ph-notif-icon" />
        </div>
      </div>
    </header>
  );
}
