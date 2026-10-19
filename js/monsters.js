// Every monster's art lives in its own file in js/monsters/ (one per evolution family).
// This list loads them right after sprites.js; a new monster's file goes here too.
const MONSTER_FILES = [
  'smugshi', 'cinderox', 'tidalisk', 'sparkit', 'thornback', 'slumbear', 'frostling', 'drakorn', 'boulderon', 'mindra', 'shadefang', 'lumawool', 'brawlix', 'galewing', 'venomire', 'scarablade', 'wispurr', 'gearhulk', 'mondaze', 'pixibelle', 'voltergeist', 'coilizard', 'bellpaca', 'smouldox', 'garrishell',
];
for (const f of MONSTER_FILES) document.write(`<script src="js/monsters/${f}.js"><\/script>`);
