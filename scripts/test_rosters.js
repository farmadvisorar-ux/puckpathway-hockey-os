require('../static/js/overseas_clubs_database.js');
require('../static/js/overseas_players_database.js');
require('../static/js/master_players.js');

const overseasPlayers = global.DRAFTLINEUP_OVERSEAS_PLAYERS || [];
const masterPlayers = global.MASTER_PLAYERS || [];
const allPersonnel = global.MASTER_ALL_REGISTRY || [];

console.log('Overseas players count:', overseasPlayers.length, '(Expected: 110)');
console.log('Master players count:', masterPlayers.length, '(Expected: 4190)');
console.log('All personnel count:', allPersonnel.length, '(Expected: 4331)');

const targetClubs = [
  'Tingsryds AIF', 'Almtuna IS', 'Kalmar HC', 'Nybro Vikings IF', 'Vimmerby HC',
  'RoKi Rovaniemi', 'Kokkolan Hermes', 'JoKP Joensuu', 'Kiekko-Vantaa', 'KeuPa HT',
  'EHC Olten', 'EHC Visp', 'HC La Chaux-de-Fonds', 'HC Sierre', 'EHC Basel',
  'Kassel Huskies', 'Krefeld Pinguine', 'Ravensburg Towerstars', 'EV Landshut', 'Dresdner Eislöwen'
];

targetClubs.forEach((club, idx) => {
  const roster = masterPlayers.filter(p => p.team === club);
  console.log(`\n${idx + 1}. Club [${club}]: ${roster.length} players found in MASTER_PLAYERS`);
  roster.forEach(p => console.log(`   - #${p.num} ${p.name} (${p.pos}, ${p.role_title}, ${p.country})`));
});
