import Icon from "./Icon.jsx";

// הודעה בולטת בתוך הדף. tone: danger | warning | info | success
export default function Alert({ tone = "info", title, children, action }) {
  const icon = tone === "success" ? "check" : tone === "info" ? "info" : "alert";
  return (
    <div className={`alert alert-${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <Icon name={icon} size={20} />
      <div className="alert-body">
        {title && <strong>{title}</strong>}
        {children && <div>{children}</div>}
      </div>
      {action}
    </div>
  );
}
