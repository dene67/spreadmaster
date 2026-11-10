import {icon,e,badge} from '../ui.js';
const tools=[
 ['speed','Speed Tiers','Compare Speed across the roster, find investment thresholds and tune your saved sets.'],
 ['calc','Damage Calculator','Check moves, damage rolls and battle conditions for two Pokémon.'],
 ['rosterDamage','Meta Rolls','Test a Pokémon or its full moveset against the roster. Find KOs, safe benchmarks and dangerous matchups.'],
 ['teams','Teams & Box','Build teams, organize your Pokémon, manage folders and import or share sets.'],
 ['dex','Current Roster','Explore legal Pokémon, their stats, abilities and available moves for your regulation.'],
 ['settings','General Settings','Choose a regulation database and manage your workspace backups.']
];
export function homeFeature(ctx){return {render(){return `<section class="home-page"><header class="home-hero"><div class="eyebrow">SPREADMASTER · VERSION 0.5</div><h1>Every point.<br><span>Every matchup.</span></h1><p>Your Pokémon workspace. Choose a tool to get started.</p><div class="home-regulation">${badge(ctx.meta.regulation,'orange')}<span>${ctx.species.length} Pokémon forms</span></div><p class="home-format">Mega Evolution · Level 50 · Doubles · No duplicate Pokémon species or held items</p></header><div class="home-tools">${tools.map(([page,title,description])=>`<button type="button" class="home-tool" data-page="${page}"><span class="home-tool-icon">${icon(page)}</span><h2>${title}</h2><p>${description}</p><span class="home-tool-open">Open ${e(title)} <span aria-hidden="true">→</span></span></button>`).join('')}</div><p class="home-footnote">Your teams and settings stay on this device. Use workspace backups to take them with you.</p></section>`;},bind(){}};}
