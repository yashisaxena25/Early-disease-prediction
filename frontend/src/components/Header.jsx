export default function Header({ userEmail, activePage, onHome, onSignOut }) {
  return <header className="topbar">
    <button type="button" className="brand brand-button" onClick={onHome} aria-label="Oye-Tabiyat home"><span className="brand-mark">✚</span><span>Oye<span className="brand-accent">-Tabiyat</span></span></button>
    <nav aria-label="Main navigation"><button type="button" className={activePage === 'dashboard' ? 'active' : ''} onClick={onHome}>Home</button></nav>
    <div className="account-menu"><span className="account-email" title={userEmail}>{userEmail}</span><button type="button" onClick={onSignOut}>Sign out</button></div>
  </header>;
}
