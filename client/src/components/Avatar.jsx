export default function Avatar({ user, size }) {
  const initials = (user?.displayName || user?.username || "?")
    .slice(0, 1)
    .toUpperCase();
  const cls = "avatar" + (size === "lg" ? " lg" : "");
  return (
    <span className={cls}>
      {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials}
    </span>
  );
}
