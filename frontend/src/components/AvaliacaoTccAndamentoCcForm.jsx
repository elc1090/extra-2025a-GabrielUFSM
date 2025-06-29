import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import * as fontkit from 'fontkit';
import SignatureModal from './SignatureModal';
import './Form.css';
import fontFile from '../assets/fonts/DancingScript-Regular.otf?url';

function AvaliacaoTccAndamentoCcForm() {
  const [formData, setFormData] = useState({
    studentName: '',
    professorName: '',
    date: '',
    time: '',
    semester: 'PRIMEIRO SEMESTRE',
    scorePresentation: 0,
    scoreContentQuality: 0,
    scoreRelevance: 0,
  });

  const [total, setTotal] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureOption, setSignatureOption] = useState('print');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signature, setSignature] = useState(null);
  const [typedSignature, setTypedSignature] = useState('');
  const [fontStyle, setFontStyle] = useState('cursive');

  useEffect(() => {
    const totalScore = parseFloat(formData.scorePresentation || 0) + 
                       parseFloat(formData.scoreContentQuality || 0) + 
                       parseFloat(formData.scoreRelevance || 0);
    setTotal(totalScore);
  }, [formData]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveSignature = (signer, dataUrl) => {
    setSignature(dataUrl);
    handleCloseModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.addPage(PageSizes.A4);
      const { width, height } = page.getSize();
      
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const fontBytes = await fetch(fontFile).then(res => res.arrayBuffer());
      const cursiveFont = await pdfDoc.embedFont(fontBytes);

      const red = rgb(0.8, 0, 0);
      const black = rgb(0, 0, 0);

      const margin = 50;
      
      const drawText = (text, x, y, options = {}) => {
        const { size = 10, font = helveticaFont, color = black, align = 'left', boxWidth = 0 } = options;
        if (text === undefined || text === null) return;
        const textStr = String(text);
        let finalX = x;
        if (align === 'center') {
            const textWidth = font.widthOfTextAtSize(textStr, size);
            finalX = x + (boxWidth - textWidth) / 2;
        } else if (align === 'right') {
            const textWidth = font.widthOfTextAtSize(textStr, size);
            finalX = x + boxWidth - textWidth;
        }
        page.drawText(textStr, { x: finalX, y, font, size, color });
      };

      let currentY = height - margin;

      // Title
      const title1 = 'CRITÉRIOS DE AVALIAÇÃO DE TRABALHO DE GRADUAÇÃO - SESSÃO PÚBLICA DE';
      const year = formData.date ? new Date(formData.date.replace(/-/g, '/')).getFullYear() : 'ANO';
      const title2 = `ANDAMENTO DO ${formData.semester}/${year}`;

      const title1Width = helveticaBoldFont.widthOfTextAtSize(title1, 11);
      const title2Width = helveticaBoldFont.widthOfTextAtSize(title2, 11);
      drawText(title1, (width - title1Width) / 2, currentY, { size: 11, font: helveticaBoldFont });
      currentY -= 15;
      drawText(title2, (width - title2Width) / 2, currentY, { size: 11, font: helveticaBoldFont });
      currentY -= 50;

      // Info Fields
      drawText('Aluno:', margin, currentY);
      drawText(formData.studentName, margin + 40, currentY);
      currentY -= 20;
      drawText('Professor(a):', margin, currentY);
      drawText(formData.professorName, margin + 70, currentY);
      currentY -= 20;
      const localDate = new Date(formData.date.replace(/-/g, '/'));
      const formattedDate = formData.date ? localDate.toLocaleDateString('pt-BR') : '';
      drawText('Data:', margin, currentY);
      drawText(formattedDate, margin + 35, currentY);
      currentY -= 20;
      drawText('Horário:', margin, currentY);
      drawText(formData.time, margin + 50, currentY);
      currentY -= 30;

      // Tabela de Avaliação
      const tableTop = currentY;
      const col1X = margin;
      const col2X = width - 200;
      const col3X = width - 100;
      const tableRightX = width - margin;
      
      const drawCell = (text, x, y, w, h, options = {}) => {
          drawText(text, x + 5, y - h * 0.6, { boxWidth: w - 10, ...options });
      };
      
      const tableData = [
          [{ text: 'APRESENTAÇÃO', colSpan: 3, height: 25, options: { align: 'center', font: helveticaBoldFont, color: red } }],
          [
              { text: 'Apresentação', options: { size: 9 } },
              { text: 'Nota até 5,0', options: { size: 9, align: 'center' } },
              { text: formData.scorePresentation, options: { align: 'center' } }
          ],
          [{ text: 'CONTEÚDO DO RELATÓRIO ESCRITO', colSpan: 3, height: 25, options: { align: 'center', font: helveticaBoldFont, color: red } }],
          [
              { text: 'Qualidade do Conteúdo', options: { size: 9 } },
              { text: 'Nota até 3,0', options: { size: 9, align: 'center' } },
              { text: formData.scoreContentQuality, options: { align: 'center' } }
          ],
          [
              { text: 'Relevância e Originalidade', options: { size: 9 } },
              { text: 'Nota até 2,0', options: { size: 9, align: 'center' } },
              { text: formData.scoreRelevance, options: { align: 'center' } }
          ],
          [
              { text: `TOTAL (até 10,0)`, colSpan: 2, options: { align: 'right', font: helveticaBoldFont, color: red, size: 9 } },
              { text: total.toFixed(2), options: { align: 'center', font: helveticaBoldFont } }
          ],
      ];

      const colWidths = [col2X - col1X, col3X - col2X, tableRightX - col3X];
      let rowY = tableTop;

      tableData.forEach(row => {
          const rowHeight = (row[0] && row[0].height) || 20;
          page.drawLine({ start: { x: col1X, y: rowY }, end: { x: tableRightX, y: rowY } });

          let colX = col1X;
          let colIndex = 0;
          
          row.forEach(cell => {
              const colSpan = cell.colSpan || 1;
              let currentCellWidth = 0;
              for(let j=0; j<colSpan; j++) {
                  if (colWidths[colIndex + j] !== undefined) {
                    currentCellWidth += colWidths[colIndex + j];
                  }
              }

              const textToDraw = (cell.text !== null && cell.text !== undefined) ? String(cell.text).replace('.',',') : '';
              drawCell(textToDraw, colX, rowY, currentCellWidth, rowHeight, cell.options);
              colX += currentCellWidth;
              colIndex += colSpan;
          });

          rowY -= rowHeight;
      });

      page.drawLine({ start: { x: col1X, y: rowY }, end: { x: tableRightX, y: rowY } });
      page.drawLine({ start: { x: col1X, y: tableTop }, end: { x: col1X, y: rowY } });
      page.drawLine({ start: { x: col2X, y: tableTop }, end: { x: col2X, y: rowY } });
      page.drawLine({ start: { x: col3X, y: tableTop }, end: { x: col3X, y: rowY } });
      page.drawLine({ start: { x: tableRightX, y: tableTop }, end: { x: tableRightX, y: rowY } });
      currentY = rowY;

      // Footer
      currentY -= 50;
      const signatureY = currentY;
      drawText('Assinatura do Professor (a):', margin, signatureY);
      const signatureLineX = margin + 170;
      const signatureLineLength = 250;
      page.drawLine({ start: { x: signatureLineX, y: signatureY-2 }, end: { x: signatureLineX + signatureLineLength, y: signatureY-2 } });

      if (signatureOption === 'draw' && signature) {
        const pngImageBytes = await fetch(signature).then(res => res.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngImageBytes);
        const sigDims = pngImage.scale(0.3);
        page.drawImage(pngImage, {
            x: signatureLineX + (signatureLineLength - sigDims.width) / 2,
            y: (signatureY - 2) - (sigDims.height / 2),
            width: sigDims.width,
            height: sigDims.height,
        });
      } else if (signatureOption === 'type' && typedSignature) {
        const selectedFont = fontStyle === 'cursive' ? cursiveFont : helveticaFont;
        const textSize = fontStyle === 'cursive' ? 24 : 14;
        const textWidth = selectedFont.widthOfTextAtSize(typedSignature, textSize);

        page.drawText(typedSignature, {
            x: signatureLineX + (signatureLineLength - textWidth) / 2,
            y: signatureY - (textSize / 2) + 2,
            font: selectedFont,
            size: textSize,
            color: black,
        });
      }

      const pdfBytes = await pdfDoc.save();
  
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Avaliacao_Andamento_${formData.studentName.split(' ')[0] || 'Aluno'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      alert("Houve um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <SignatureModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSignature}
        fieldToSign={{ id: 'professor', name: formData.professorName || 'Professor(a)' }}
      />
      <h2>Ficha de Avaliação de TCC em Andamento (Ciência da Computação)</h2>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
        <label>Aluno(a): <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} required /></label>
        <label>Professor(a): <input type="text" name="professorName" value={formData.professorName} onChange={handleChange} required /></label>
        <label>Data: <input type="date" name="date" value={formData.date} onChange={handleChange} required /></label>
        <label>Horário: <input type="time" name="time" value={formData.time} onChange={handleChange} required /></label>
      </div>
      
      <label>Semestre da Avaliação:
        <select name="semester" value={formData.semester} onChange={handleChange}>
          <option value="PRIMEIRO SEMESTRE">Primeiro Semestre</option>
          <option value="SEGUNDO SEMESTRE">Segundo Semestre</option>
        </select>
      </label>

      <h3>Critérios de Avaliação (Total: {total.toFixed(2)})</h3>
      <label>Apresentação (até 5,0): <input type="number" name="scorePresentation" value={formData.scorePresentation} onChange={handleChange} step="0.1" min="0" max="5" required /></label>
      <label>Qualidade do Conteúdo (até 3,0): <input type="number" name="scoreContentQuality" value={formData.scoreContentQuality} onChange={handleChange} step="0.1" min="0" max="3" required /></label>
      <label>Relevância e Originalidade (até 2,0): <input type="number" name="scoreRelevance" value={formData.scoreRelevance} onChange={handleChange} step="0.1" min="0" max="2" required /></label>
      
      <h3>Assinatura</h3>
      <div className="radio-group">
        <label>
          <input type="radio" value="print" checked={signatureOption === 'print'} onChange={() => setSignatureOption('print')} />
          Imprimir e assinar manualmente
        </label>
        <label>
          <input type="radio" value="draw" checked={signatureOption === 'draw'} onChange={() => setSignatureOption('draw')} />
          Desenhar assinatura digitalmente
        </label>
        <label>
          <input type="radio" value="type" checked={signatureOption === 'type'} onChange={() => setSignatureOption('type')} />
          Digitar assinatura
        </label>
      </div>

      {signatureOption === 'draw' && (
        <div className="signature-section">
          <div className="signature-action">
            <span>Professor(a): {formData.professorName || '(não preenchido)'}</span>
            <button type="button" onClick={handleOpenModal} disabled={!formData.professorName}>
              {signature ? 'Alterar Assinatura' : 'Desenhar Assinatura'}
            </button>
            {signature && (
              <img src={signature} alt="Signature preview" className="signature-preview" />
            )}
          </div>
        </div>
      )}

      {signatureOption === 'type' && (
          <div className="signature-section">
              <div className="typed-signature-action">
                  <span className="signer-name">Professor(a):</span>
                   <input
                        type="text"
                        className="signature-input"
                        placeholder="Digite o nome para assinar"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        disabled={!formData.professorName}
                    />
                  <div className="font-selector">
                      <label>
                          <input type="radio" name="font-style" value="cursive" checked={fontStyle === 'cursive'} onChange={() => setFontStyle('cursive')} /> Cursiva
                      </label>
                      <label>
                          <input type="radio" name="font-style" value="sans-serif" checked={fontStyle === 'sans-serif'} onChange={() => setFontStyle('sans-serif')} /> Padrão
                      </label>
                  </div>
                  <div className="signature-preview-text-container">
                      <div 
                          className="signature-preview-text"
                          style={{ fontFamily: fontStyle === 'cursive' ? "'Dancing Script', cursive" : "Helvetica, sans-serif" }}
                      >
                          {typedSignature || 'Pré-visualização'}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <button type="submit" disabled={isGenerating}>
        {isGenerating ? 'Gerando...' : 'Gerar PDF'}
      </button>
    </form>
  );
}

export default AvaliacaoTccAndamentoCcForm; 