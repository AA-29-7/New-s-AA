#!/usr/bin/env node
// Hook SessionStart — LECTURE SEULE UNIQUEMENT.
// N'exécute jamais de commande git qui écrit, supprime, fusionne, rebase,
// checkout ou pousse. Seules 4 sous-commandes sont utilisées, toutes en
// lecture seule : git fetch, git rev-parse, git rev-list, git status.
// Ne bloque jamais le démarrage de la session (toujours exit 0).

import { execFileSync } from 'node:child_process';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

const lines = [];

try {
  // Lecture seule : met à jour les refs distantes locales, ne touche ni
  // aux fichiers de travail ni aux branches locales.
  git(['fetch']);

  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  lines.push(`Branche courante : ${branch}`);

  if (branch === 'main') {
    lines.push('');
    lines.push('⚠️  ATTENTION : tu es sur la branche main ! ⚠️');
    lines.push('Jamais de commit ni de push direct sur main.');
    lines.push('');
  }

  try {
    const behind = git(['rev-list', '--count', 'HEAD..origin/main']);
    lines.push(`Retard sur origin/main : ${behind} commit(s).`);
  } catch {
    lines.push("Retard sur origin/main : impossible à déterminer (origin/main introuvable ?).");
  }

  const status = git(['status', '--porcelain']);
  if (status.length > 0) {
    const count = status.split('\n').filter(Boolean).length;
    lines.push(`Modifications non enregistrées : oui (${count} fichier(s)).`);
  } else {
    lines.push('Modifications non enregistrées : aucune.');
  }
} catch (err) {
  lines.push(`Hook session-start : erreur git (${err.message.split('\n')[0]}), état non disponible.`);
}

lines.push('');
lines.push('Rappel CLAUDE.md : (1) jamais de commit/push direct sur main ;');
lines.push('(2) un module = un dossier dans src/modules/, ne touche à aucun autre ;');
lines.push('(3) Journal strictement privé, jamais de secret commité.');

console.log(lines.join('\n'));
process.exit(0);
