/** Small illustrated furniture objects; no platform-dependent emoji artwork. */
export function HomeDecoration({item}:{item:string}) {
  return <svg viewBox="0 0 120 100" aria-hidden="true" className="home-decoration-art">
    <ellipse cx="60" cy="91" rx="47" ry="6" fill="#11223644"/>
    {item === 'Animal Photo Wall' || item === 'Art Gallery' ? <><rect x="18" y="13" width="84" height="72" rx="5" fill="#dbb478" stroke="#835b42" strokeWidth="4"/><rect x="26" y="21" width="68" height="56" fill="#bdd9d2"/><circle cx="75" cy="35" r="9" fill="#fff0ae"/><path d="M26 70L48 42L64 61L76 47L94 70V77H26Z" fill="#508b80"/></> :
    item === 'Charging Dock' ? <><ellipse cx="60" cy="78" rx="43" ry="13" fill="#44678a" stroke="#99dcda" strokeWidth="5"/><path d="M66 15L42 52H60L51 72L79 39H60Z" fill="#ffe19c" stroke="#bf9959" strokeWidth="2"/></> :
    item === 'Trophy Shelf' ? <><path d="M35 17H85V42Q84 62 60 64Q36 62 35 42Z" fill="#eec978" stroke="#ad7a40" strokeWidth="3"/><path d="M35 24H21Q16 49 42 48M85 24H99Q104 49 78 48" fill="none" stroke="#eac67c" strokeWidth="6"/><path d="M60 61V79M43 81H77" stroke="#e9c27c" strokeWidth="9"/><path d="M60 26L64 37L76 37L66 44L70 56L60 49L50 56L54 44L44 37H56Z" fill="#fff1b4"/></> :
    item === 'Star Window' ? <><path d="M27 87V43A33 33 0 0166 0V87Z" fill="#223762" stroke="#d0b689" strokeWidth="7"/><path d="M60 23L64 37L78 40L64 44L60 59L56 44L42 40L56 37Z" fill="#ffe8a9"/><circle cx="78" cy="68" r="3" fill="#b8eded"/></> :
    item === 'Monster Plush' ? <><path d="M29 34L26 9L48 28M91 34L94 9L72 28" fill="#c2a0dd"/><rect x="25" y="27" width="70" height="59" rx="27" fill="#967dbb" stroke="#665988" strokeWidth="3"/><ellipse cx="46" cy="51" rx="10" ry="13" fill="#eff7ee"/><ellipse cx="74" cy="51" rx="10" ry="13" fill="#eff7ee"/><circle cx="49" cy="52" r="5" fill="#263149"/><circle cx="71" cy="52" r="5" fill="#263149"/><path d="M47 72Q60 83 73 72" fill="none" stroke="#443756" strokeWidth="3"/></> :
    item === 'Dino Fossil Case' ? <><rect x="13" y="18" width="94" height="67" rx="9" fill="#2e5465" stroke="#cbb084" strokeWidth="5"/><path d="M33 62L83 39M34 60L28 53M35 64L30 71M81 39L86 31M84 40L92 45" stroke="#e9dfc2" strokeWidth="10" strokeLinecap="round"/></> :
    <><path d="M29 12H91V82L60 96L29 82Z" fill="#567899" stroke="#d6b985" strokeWidth="4"/><circle cx="60" cy="48" r="21" fill="#b8d1d0" stroke="#e8d3a4" strokeWidth="8"/><circle cx="60" cy="48" r="9" fill="#395971"/></>}
  </svg>;
}
