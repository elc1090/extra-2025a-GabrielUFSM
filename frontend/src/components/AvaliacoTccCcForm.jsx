  if (signatureOption === 'type') {
    const fontUrl = '/fonts/s/dancingscript/v24/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Rep8hNP6pnxP.ttf';
    const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
    const cursiveFont = await pdfDoc.embedFont(fontBytes);

    page.drawText(signatureText, {
      font: cursiveFont,
      x: 100,
      y: 700,
      size: 50,
      color: rgb(0, 0, 0)
    });
  } 