'use strict';

const WorldHuntProfile = (() => {
  let player;
  try {
    const world = JSON.parse(localStorage.getItem('nicos-world-local-save-v4'));
    player = world?.profiles?.find(p => p.id === world.activeProfileId);
  } catch { /* Guest play also works with browser storage disabled. */ }
  if (player?.language === 'es-MX') {
    document.getElementById('arcade-return').textContent = '‹ Volver a la sala de juegos de Nico';
  }
  function key(name) {
    const guest = 'nicos-world.' + name;
    if (!player) return guest;
    const personal = guest + '.' + player.id;
    try {
      const saved = localStorage.getItem(guest);
      if (saved !== null && localStorage.getItem(personal) === null) {
        localStorage.setItem(personal, saved);
        localStorage.removeItem(guest);
      }
    } catch { /* The game handles unavailable storage on its own. */ }
    return personal;
  }
  return { key };
})();
