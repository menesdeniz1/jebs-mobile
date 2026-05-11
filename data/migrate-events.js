/**
 * Migration script: Convert markdown-formatted strings in events.json
 * to structured JSON objects.
 *
 * Run: node data/migrate-events.js
 *
 * Fields converted:
 * - legal_references: string -> [{code, article, title, summary, penalty}]
 * - prosecutor_info: string -> {when, how, what_to_report, expected_orders}
 * - party_roles: string -> {suspect:[], victim:[], witness:[]}
 * - witness_procedure: string -> string[]
 */
const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, 'events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

function parseLegalReferences(text) {
  if (!text || typeof text !== 'string') return text;
  const refs = [];
  // Split on double newline (paragraph breaks between articles)
  const paragraphs = text.split(/\n\n/).map(p => p.trim()).filter(Boolean);

  for (const para of paragraphs) {
    const clean = para.replace(/\*\*/g, '').trim();
    // Pattern: "CODE Madde NN: Title — Penalty" or "NNNN sayılı Kanun: Title"
    const dashParts = clean.split('—').map(s => s.trim());
    const colonParts = dashParts[0].split(':').map(s => s.trim());

    const articlePart = colonParts[0]; // e.g. "TCK Madde 86" or "3713 sayılı Kanun"
    const titlePart = colonParts[1] || ''; // e.g. "Kasten yaralama"
    const penaltyPart = dashParts[1] || ''; // e.g. "1 yıldan 3 yıla kadar hapis"

    // Determine the code
    let code = '';
    if (articlePart.startsWith('TCK')) code = 'TCK';
    else if (articlePart.startsWith('CMK')) code = 'CMK';
    else if (articlePart.startsWith('PVSK')) code = 'PVSK';
    else if (articlePart.startsWith('Anayasa')) code = 'Anayasa';
    else if (articlePart.match(/^\d{4}\s*sayılı/)) code = 'Kanun';
    else code = 'Diğer';

    const ref = {
      code,
      article: articlePart,
      title: titlePart,
      summary: titlePart,
    };
    if (penaltyPart) {
      ref.penalty = penaltyPart;
    }
    refs.push(ref);
  }
  return refs;
}

function parseProsecutorInfo(text) {
  if (!text || typeof text !== 'string') return text;
  const clean = text.replace(/\*\*/g, '');
  const result = {
    when: '',
    how: '',
    what_to_report: [],
    expected_orders: [],
  };

  // Extract "Ne zaman aranır:" section
  const whenMatch = clean.match(/Ne zaman aranır:\s*([^\n]+)/);
  if (whenMatch) result.when = whenMatch[1].trim();

  // Extract "Nasıl aranır:" section
  const howMatch = clean.match(/Nasıl aranır:\s*([^\n]+)/);
  if (howMatch) result.how = howMatch[1].trim();

  // Extract "Ne söylenir:" followed by bullet items
  const whatMatch = clean.match(/Ne söylenir:\s*\n([\s\S]*?)(?=\n\n|Savcının|Önemli:|Koordinasyon:|$)/);
  if (whatMatch) {
    result.what_to_report = whatMatch[1]
      .split('\n')
      .map(l => l.replace(/^-\s*/, '').trim())
      .filter(Boolean);
  }

  // Extract "Savcının vereceği talimat beklenir:" or "Önemli:" or "Koordinasyon:"
  const ordersMatch = clean.match(/Savcının vereceği talimat beklenir:\s*([^\n]+)/);
  if (ordersMatch) {
    result.expected_orders = [ordersMatch[1].trim()];
  }

  // Grab "Önemli:" lines as additional info in expected_orders
  const importantMatch = clean.match(/Önemli:\s*([^\n]+(?:\n(?!Ne |Nasıl |Koordinasyon:)[^\n]+)*)/);
  if (importantMatch) {
    result.expected_orders.push(importantMatch[1].trim());
  }

  // Grab "Koordinasyon:" lines
  const coordMatch = clean.match(/Koordinasyon:\s*([^\n]+)/);
  if (coordMatch) {
    result.expected_orders.push(coordMatch[1].trim());
  }

  return result;
}

function parsePartyRoles(text) {
  if (!text || typeof text !== 'string') return text;
  const clean = text.replace(/\*\*/g, '');
  const result = {
    suspect: [],
    victim: [],
    witness: [],
  };

  // Split into sections by known headers
  const sections = clean.split(/\n(?=[^\n-])/).filter(Boolean);

  for (const section of sections) {
    const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const header = lines[0].toLowerCase();
    const items = lines.slice(1)
      .filter(l => l.startsWith('-'))
      .map(l => l.replace(/^-\s*/, '').trim());

    // Also handle case where header itself contains items after ':'
    if (header.includes('şüpheli') || header.includes('şiddet uygulayanın')) {
      result.suspect.push(...items);
    } else if (header.includes('mağdur') || header.includes('sürücü')) {
      result.victim.push(...items);
    } else if (header.includes('tanık') || header.includes('ihbarcı') || header.includes('aranan kişi')) {
      result.witness.push(...items);
    } else if (header.includes('dikkat')) {
      // "Dikkat:" notes - append to suspect as warnings
      const note = lines.join(' ').replace(/^[^:]+:\s*/, '').trim();
      if (note) result.suspect.push(`⚠ ${note}`);
    } else {
      // Unknown header — treat items as victim rights
      result.victim.push(...items);
    }
  }

  return result;
}

function parseWitnessProcedure(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

// Process all events
for (const event of events) {
  if (typeof event.legal_references === 'string') {
    event.legal_references = parseLegalReferences(event.legal_references);
  }
  if (typeof event.prosecutor_info === 'string') {
    event.prosecutor_info = parseProsecutorInfo(event.prosecutor_info);
  }
  if (typeof event.party_roles === 'string') {
    event.party_roles = parsePartyRoles(event.party_roles);
  }
  if (typeof event.witness_procedure === 'string') {
    event.witness_procedure = parseWitnessProcedure(event.witness_procedure);
  }
}

// Write output
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 4) + '\n', 'utf-8');
console.log(`✅ Migrated ${events.length} events to structured format.`);

// Verify each event
for (const e of events) {
  if (typeof e.legal_references === 'string') console.warn(`  ⚠ ${e.id}: legal_references still string`);
  if (typeof e.prosecutor_info === 'string') console.warn(`  ⚠ ${e.id}: prosecutor_info still string`);
  if (typeof e.party_roles === 'string') console.warn(`  ⚠ ${e.id}: party_roles still string`);
  if (typeof e.witness_procedure === 'string') console.warn(`  ⚠ ${e.id}: witness_procedure still string`);
}
console.log('✅ Verification complete.');
