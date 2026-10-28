import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Converte una stringa base64 o dataURL in Uint8Array
 */
function base64ToUint8Array(base64Str) {
  let cleanBase64 = base64Str;
  if (cleanBase64.includes('base64,')) {
    cleanBase64 = cleanBase64.split('base64,')[1];
  }
  // Rimuove eventuali whitespace/newline
  cleanBase64 = cleanBase64.replace(/\s/g, '');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Funzione helper per spezzare il testo su più righe in base alla larghezza massima
 */
function wrapText(text, maxWidth, font, fontSize) {
  if (!text) return [];
  const words = String(text).split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Genera il fascicolo PDF completo della visita:
 * Foglio 1 (o più): Referto clinico ufficiale dettagliato
 * Fogli successivi: Unione/Merge delle pagine dei PDF degli esami di laboratorio allegati
 */
export async function generateMergedVisitPdf({ visit, clinic, pet, owner, vet }) {
  const mergedPdf = await PDFDocument.create();

  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await mergedPdf.embedFont(StandardFonts.HelveticaOblique);

  // Colori
  const primaryColor = rgb(13 / 255, 148 / 255, 136 / 255); // #0d9488 teal
  const darkSlate = rgb(15 / 255, 23 / 255, 42 / 255); // #0f172a
  const mutedText = rgb(100 / 255, 116 / 255, 139 / 255); // #64748b
  const lightBg = rgb(248 / 255, 250 / 255, 252 / 255); // #f8fafc
  const borderColor = rgb(203 / 255, 213 / 255, 225 / 255); // #cbd5e1
  const dangerColor = rgb(185 / 255, 28 / 255, 28 / 255); // #b91c1c

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  let currentPage = mergedPdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const checkPageBreak = (neededHeight) => {
    if (y - neededHeight < margin + 30) {
      // Aggiungi footer pagina corrente
      currentPage.drawText(`Pagina ${mergedPdf.getPageCount()} • VetClinic Gestionale Veterinario`, {
        x: margin,
        y: margin - 15,
        size: 8,
        font: fontRegular,
        color: mutedText
      });

      currentPage = mergedPdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      return true;
    }
    return false;
  };

  // --- HEADER CLINICA ---
  const clinicNome = clinic?.nome || 'Clinica Veterinaria San Francesco';
  const clinicIndirizzo = `${clinic?.indirizzo || ''} - ${clinic?.cap || ''} ${clinic?.citta || ''}`.trim();
  const clinicTel = clinic?.telefono ? `Tel: ${clinic.telefono}` : '';
  const clinicEmail = clinic?.email ? `Email: ${clinic.email}` : '';
  const clinicPiva = clinic?.partitaIva ? `P.IVA: ${clinic.partitaIva}` : '';

  currentPage.drawText(clinicNome.toUpperCase(), {
    x: margin,
    y: y - 14,
    size: 14,
    font: fontBold,
    color: primaryColor
  });

  const clinicSubText = [clinicIndirizzo, [clinicTel, clinicEmail, clinicPiva].filter(Boolean).join(' • ')]
    .filter(Boolean)
    .join('\n');

  let subY = y - 28;
  const clinicLines = clinicSubText.split('\n');
  for (const line of clinicLines) {
    currentPage.drawText(line, {
      x: margin,
      y: subY,
      size: 8.5,
      font: fontRegular,
      color: mutedText
    });
    subY -= 11;
  }

  y = subY - 8;

  // Linea divisoria header
  currentPage.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1.5,
    color: primaryColor
  });

  y -= 18;

  // --- BANNER TITOLO PROTOCOLLO ---
  const protocolNumber = `VC-${new Date(visit.data || Date.now()).getFullYear()}-${String(visit._id || '').slice(-6).toUpperCase()}`;
  const bannerHeight = 22;

  currentPage.drawRectangle({
    x: margin,
    y: y - bannerHeight,
    width: contentWidth,
    height: bannerHeight,
    color: darkSlate,
    borderRadius: 4
  });

  currentPage.drawText('REFERTO CLINICO VETERINARIO UFFICIALE', {
    x: margin + 10,
    y: y - 15,
    size: 9.5,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  currentPage.drawText(`N. ${protocolNumber} • ${new Date(visit.data || Date.now()).toLocaleDateString('it-IT')}`, {
    x: pageWidth - margin - 220,
    y: y - 15,
    size: 9,
    font: fontBold,
    color: rgb(0.9, 0.9, 0.9)
  });

  y -= bannerHeight + 14;

  // --- DATI PAZIENTE E PROPRIETARIO (BOX A 2 COLONNE) ---
  const boxHeight = 74;
  const colWidth = (contentWidth - 10) / 2;

  // Box 1: Paziente
  currentPage.drawRectangle({
    x: margin,
    y: y - boxHeight,
    width: colWidth,
    height: boxHeight,
    color: lightBg,
    borderColor,
    borderWidth: 1
  });

  currentPage.drawText('PAZIENTE', {
    x: margin + 8,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: primaryColor
  });

  const petNome = pet?.nome || 'N/D';
  const petSpecie = `${pet?.specie || ''} ${pet?.razza ? `• ${pet.razza}` : ''}`.trim();
  const petSesso = pet?.sesso || 'N/D';
  const petChip = pet?.microchip ? `Microchip: ${pet.microchip}` : 'Microchip: Non registrato';
  const isDeceduto = pet?.stato === 'Deceduto';

  currentPage.drawText(petNome, {
    x: margin + 8,
    y: y - 28,
    size: 11,
    font: fontBold,
    color: isDeceduto ? dangerColor : darkSlate
  });

  if (isDeceduto) {
    currentPage.drawText('[DECEDUTO]', {
      x: margin + 8 + fontBold.widthOfTextAtSize(petNome, 11) + 6,
      y: y - 28,
      size: 8,
      font: fontBold,
      color: dangerColor
    });
  }

  currentPage.drawText(`${petSpecie} (${petSesso})`, {
    x: margin + 8,
    y: y - 41,
    size: 8,
    font: fontRegular,
    color: darkSlate
  });

  currentPage.drawText(petChip, {
    x: margin + 8,
    y: y - 54,
    size: 7.8,
    font: fontRegular,
    color: mutedText
  });

  // Box 2: Proprietario
  const box2X = margin + colWidth + 10;
  currentPage.drawRectangle({
    x: box2X,
    y: y - boxHeight,
    width: colWidth,
    height: boxHeight,
    color: lightBg,
    borderColor,
    borderWidth: 1
  });

  currentPage.drawText('PROPRIETARIO REFERENTE', {
    x: box2X + 8,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: primaryColor
  });

  const ownerNome = owner ? `${owner.cognome || ''} ${owner.nome || ''}`.trim() : 'N/D';
  const ownerCf = owner?.codiceFiscale ? `C.F.: ${owner.codiceFiscale}` : 'C.F.: N/D';
  const ownerTel = owner?.telefono ? `Tel: ${owner.telefono}` : '';

  currentPage.drawText(ownerNome, {
    x: box2X + 8,
    y: y - 28,
    size: 10,
    font: fontBold,
    color: darkSlate
  });

  currentPage.drawText(ownerCf, {
    x: box2X + 8,
    y: y - 41,
    size: 8,
    font: fontBold,
    color: darkSlate
  });

  currentPage.drawText(ownerTel, {
    x: box2X + 8,
    y: y - 54,
    size: 8,
    font: fontRegular,
    color: mutedText
  });

  y -= boxHeight + 12;

  // --- PARAMETRI VITALI ---
  const vitalsHeight = 32;
  const vitalsBoxWidth = (contentWidth - 18) / 4;
  const vitals = [
    { label: 'PESO', val: visit.parametriVitali?.pesoRilevato ? `${visit.parametriVitali.pesoRilevato} kg` : (pet?.pesoAttuale ? `${pet.pesoAttuale} kg` : 'N/D') },
    { label: 'TEMPERATURA', val: visit.parametriVitali?.temperatura ? `${visit.parametriVitali.temperatura} °C` : 'N/D' },
    { label: 'FREQ. CARDIACA', val: visit.parametriVitali?.frequenzaCardiaca ? `${visit.parametriVitali.frequenzaCardiaca} bpm` : 'N/D' },
    { label: 'FREQ. RESP.', val: visit.parametriVitali?.frequenzaRespiratoria ? `${visit.parametriVitali.frequenzaRespiratoria} atti/m` : 'N/D' }
  ];

  vitals.forEach((vt, idx) => {
    const vx = margin + idx * (vitalsBoxWidth + 6);
    currentPage.drawRectangle({
      x: vx,
      y: y - vitalsHeight,
      width: vitalsBoxWidth,
      height: vitalsHeight,
      color: rgb(1, 1, 1),
      borderColor,
      borderWidth: 1
    });

    currentPage.drawText(vt.label, {
      x: vx + 6,
      y: y - 11,
      size: 6.8,
      font: fontBold,
      color: mutedText
    });

    currentPage.drawText(vt.val, {
      x: vx + 6,
      y: y - 24,
      size: 9.5,
      font: fontBold,
      color: darkSlate
    });
  });

  y -= vitalsHeight + 14;

  // Helper per sezioni testuali
  const drawSection = (title, text) => {
    if (!text || !text.trim()) return;
    const lines = wrapText(text, contentWidth - 16, fontRegular, 8.5);
    const secHeight = 18 + lines.length * 12 + 6;
    checkPageBreak(secHeight);

    currentPage.drawText(title.toUpperCase(), {
      x: margin,
      y: y - 10,
      size: 8,
      font: fontBold,
      color: primaryColor
    });

    currentPage.drawRectangle({
      x: margin,
      y: y - secHeight,
      width: contentWidth,
      height: secHeight - 14,
      color: rgb(1, 1, 1),
      borderColor,
      borderWidth: 1
    });

    let lineY = y - 24;
    for (const line of lines) {
      currentPage.drawText(line, {
        x: margin + 8,
        y: lineY,
        size: 8.5,
        font: fontRegular,
        color: darkSlate
      });
      lineY -= 12;
    }

    y -= secHeight + 8;
  };

  drawSection('Motivo della Visita & Anamnesi', [visit.motivo, visit.anamnesi].filter(Boolean).join('\nAnamnesi: '));
  drawSection('Esame Obiettivo Generale (E.O.G.)', visit.esameObiettivo);
  drawSection('Diagnosi Clinica', visit.diagnosi);

  // --- SEZIONE ESAMI / TEST SPECIALISTICI ---
  const esami = Array.isArray(visit.esami) ? visit.esami : [];
  if (esami.length > 0) {
    checkPageBreak(40 + esami.length * 28);

    currentPage.drawText('ESAMI, TEST E PRESTAZIONI SPECIALISTICHE', {
      x: margin,
      y: y - 10,
      size: 8.5,
      font: fontBold,
      color: primaryColor
    });

    y -= 16;

    for (const esame of esami) {
      const isEsterno = esame.tipologia === 'Esterno';
      const esameTitle = `${esame.nome || 'Esame specialistico'} [${esame.tipologia || 'Interno'}${isEsterno && esame.laboratorio ? ` • Lab: ${esame.laboratorio}` : ''}]`;
      const statoText = `Stato: ${esame.stato || 'Pronto'}${esame.dataReferto ? ` (${new Date(esame.dataReferto).toLocaleDateString('it-IT')})` : ''}`;

      const cardH = 34 + (esame.esito ? 14 : 0) + (esame.fileAllegato ? 12 : 0);
      checkPageBreak(cardH + 6);

      currentPage.drawRectangle({
        x: margin,
        y: y - cardH,
        width: contentWidth,
        height: cardH,
        color: lightBg,
        borderColor,
        borderWidth: 1
      });

      currentPage.drawText(esameTitle, {
        x: margin + 8,
        y: y - 14,
        size: 9,
        font: fontBold,
        color: darkSlate
      });

      currentPage.drawText(statoText, {
        x: pageWidth - margin - 150,
        y: y - 14,
        size: 8,
        font: fontBold,
        color: esame.stato === 'In lavorazione' ? rgb(180 / 255, 83 / 255, 9 / 255) : primaryColor
      });

      let currentEy = y - 26;
      if (esame.esito) {
        currentPage.drawText(`Esito: ${esame.esito}`, {
          x: margin + 8,
          y: currentEy,
          size: 8,
          font: fontRegular,
          color: darkSlate
        });
        currentEy -= 12;
      }

      if (esame.fileAllegato) {
        currentPage.drawText(`📎 Documento PDF allegato al fascicolo: ${esame.nomeFile || 'referto_laboratorio.pdf'}`, {
          x: margin + 8,
          y: currentEy,
          size: 7.8,
          font: fontOblique,
          color: primaryColor
        });
      }

      y -= cardH + 6;
    }
    y -= 6;
  }

  // --- TERAPIE PRESCRITTE ---
  const terapie = Array.isArray(visit.terapiePrescritte) ? visit.terapiePrescritte : [];
  if (terapie.length > 0) {
    checkPageBreak(40 + terapie.length * 24);

    currentPage.drawText('PRESCRIZIONI FARMACOLOGICHE & TERAPIE', {
      x: margin,
      y: y - 10,
      size: 8.5,
      font: fontBold,
      color: primaryColor
    });

    y -= 16;

    for (const t of terapie) {
      const rowH = 24;
      checkPageBreak(rowH + 4);

      currentPage.drawRectangle({
        x: margin,
        y: y - rowH,
        width: contentWidth,
        height: rowH,
        color: rgb(1, 1, 1),
        borderColor,
        borderWidth: 1
      });

      currentPage.drawText(`• ${t.nomeFarmaco || 'Farmaco'}${t.dosaggio ? ` (${t.dosaggio})` : ''}`, {
        x: margin + 8,
        y: y - 15,
        size: 8.5,
        font: fontBold,
        color: darkSlate
      });

      const posology = `${t.posologia || ''} • Via: ${t.viaSomministrazione || 'Orale'}${t.durataGiorni ? ` (${t.durataGiorni} gg)` : ''}`;
      currentPage.drawText(posology, {
        x: margin + 200,
        y: y - 15,
        size: 8,
        font: fontRegular,
        color: mutedText
      });

      y -= rowH + 4;
    }
    y -= 6;
  }

  // --- BLOCCO FIRMA VETERINARIO ---
  checkPageBreak(50);
  y -= 10;

  currentPage.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: borderColor
  });

  y -= 16;

  const vetNome = vet ? `Dr. ${vet.nome || ''} ${vet.cognome || ''}`.trim() : 'Medico Veterinario Curante';
  const vetAlbo = vet?.codiceAlbo ? `Iscritto all'Ordine dei Medici Veterinari: ${vet.codiceAlbo}` : '';

  currentPage.drawText(`Data refertazione: ${new Date(visit.data || Date.now()).toLocaleDateString('it-IT')}`, {
    x: margin,
    y: y - 5,
    size: 8.5,
    font: fontRegular,
    color: mutedText
  });

  currentPage.drawText('Timbro e Firma del Medico Veterinario', {
    x: pageWidth - margin - 200,
    y: y - 5,
    size: 8.5,
    font: fontBold,
    color: darkSlate
  });

  currentPage.drawText(vetNome, {
    x: pageWidth - margin - 200,
    y: y - 18,
    size: 8.5,
    font: fontRegular,
    color: darkSlate
  });

  if (vetAlbo) {
    currentPage.drawText(vetAlbo, {
      x: pageWidth - margin - 200,
      y: y - 29,
      size: 7.5,
      font: fontRegular,
      color: mutedText
    });
  }

  // Footer su tutte le pagine del referto clinico
  const totalReportPages = mergedPdf.getPageCount();
  for (let i = 0; i < totalReportPages; i++) {
    const p = mergedPdf.getPage(i);
    p.drawText(`Fascicolo Visita Clinica • Protocollo ${protocolNumber} • Pagina ${i + 1} di ${totalReportPages}`, {
      x: margin,
      y: margin - 15,
      size: 7.5,
      font: fontRegular,
      color: mutedText
    });
  }

  // --- UNIONE DEGLI ALLEGATI PDF DEGLI ESAMI DI LABORATORIO ---
  for (const esame of esami) {
    if (esame.fileAllegato) {
      try {
        const pdfBytes = base64ToUint8Array(esame.fileAllegato);
        const donorPdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const donorPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
        donorPages.forEach((donorPage) => {
          mergedPdf.addPage(donorPage);
        });
      } catch (err) {
        console.error(`Errore nel caricamento del PDF allegato per l'esame ${esame.nome}:`, err);
      }
    }
  }

  return await mergedPdf.save();
}
