"use client";

interface NavItem {
  label: string;
  icon: string; // You can change this to JSX.Element if using an icon library
  link: string;
}

export function NavigationBar() {
  const navItems: NavItem[] = [
    { label: "Shop", icon: "🛍️", link: "/shop" },
    { label: "Notification", icon: "🔔", link: "/notifications" },
    { label: "New Product", icon: "➕", link: "/new-product" },
    { label: "Fan Club", icon: "🌟", link: "/fan-club" },
    { label: "Settings", icon: "⚙️", link: "/settings" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 0",
        boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
        borderTop: "1px solid #ddd",
      }}
    >
      {navItems.map((item) => (
        <a
          key={item.label}
          href={item.link}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textDecoration: "none",
            color: "#333",
            fontSize: "12px",
          }}
        >
          <span style={{ fontSize: "20px", marginBottom: "5px" }}>
            {item.icon}
          </span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
