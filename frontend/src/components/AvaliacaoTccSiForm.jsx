import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import * as fontkit from 'fontkit';
import SignatureModal from './SignatureModal';
import './Form.css';
import fontFile from '../assets/fonts/DancingScript-Regular.otf?url';

function AvaliacaoTccSiForm() {
  const [formData, setFormData] = useState({
    studentName: '',
    professorName: '',
    date: '',
    time: '',
    scorePresentationContent: 0,
    scoreDidacticResources: 0,
    scoreTimeUsage: 0,
    scoreStructure: 0,
    scoreRelevance: 0,
    scoreKnowledge: 0,
    scoreBibliography: 0,
    needsChanges: 'sim',
    finalSubmissionDate: '',
  });

  const [subTotalPresentation, setSubTotalPresentation] = useState(0);
  const [subTotalReport, setSubTotalReport] = useState(0);
  const [total, setTotal] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureOption, setSignatureOption] = useState('print');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signature, setSignature] = useState(null);
  const [typedSignature, setTypedSignature] = useState('');
  const [fontStyle, setFontStyle] = useState('cursive');

  useEffect(() => {
    const presentationTotal = parseFloat(formData.scorePresentationContent || 0) + 
                              parseFloat(formData.scoreDidacticResources || 0) +
                              parseFloat(formData.scoreTimeUsage || 0);
    const reportTotal = parseFloat(formData.scoreStructure || 0) + 
                        parseFloat(formData.scoreRelevance || 0) + 
                        parseFloat(formData.scoreKnowledge || 0) + 
                        parseFloat(formData.scoreBibliography || 0);
    setSubTotalPresentation(presentationTotal);
    setSubTotalReport(reportTotal);
    setTotal(presentationTotal + reportTotal);
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

      const title = 'CRITÉRIOS DE AVALIAÇÃO DO TRABALHO DE GRADUAÇÃO';
      const titleWidth = helveticaBoldFont.widthOfTextAtSize(title, 12);
      drawText(title, (width - titleWidth) / 2, currentY, { size: 12, font: helveticaBoldFont });
      currentY -= 40;

      drawText('Aluno:', margin, currentY);
      drawText(formData.studentName, margin + 40, currentY);
      drawText('Professor(a):', width / 2, currentY);
      drawText(formData.professorName, width / 2 + 70, currentY);
      currentY -= 20;
      const localDate = new Date(formData.date.replace(/-/g, '/'));
      const formattedDate = formData.date ? localDate.toLocaleDateString('pt-BR') : '';
      drawText('Data:', margin, currentY);
      drawText(formattedDate, margin + 35, currentY);
      drawText('Horário:', width / 2, currentY);
      drawText(formData.time, width / 2 + 50, currentY);
      currentY -= 30;

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
              { text: 'Conteúdo da Apresentação', options: { size: 9 } },
              { text: 'Nota até 1,0', options: { size: 9, align: 'center' } },
              { text: formData.scorePresentationContent, options: { align: 'center' } }
          ],
          [
              { text: 'Domínio dos Recursos Didáticos', options: { size: 9 } },
              { text: 'Nota até 1,0', options: { size: 9, align: 'center' } },
              { text: formData.scoreDidacticResources, options: { align: 'center' } }
          ],
          [
              { text: 'Utilização do Tempo e Poder de Síntese', options: { size: 9 } },
              { text: 'Nota até 1,0', options: { size: 9, align: 'center' } },
              { text: formData.scoreTimeUsage, options: { align: 'center' } }
          ],
          [
              { text: `SUB-TOTAL (até 3,0)`, colSpan: 2, options: { align: 'right', font: helveticaBoldFont, color: red, size: 9 } },
              { text: subTotalPresentation.toFixed(2), options: { align: 'center', font: helveticaBoldFont } }
          ],
          [{ text: 'CONTEÚDO DO RELATÓRIO ESCRITO', colSpan: 3, height: 25, options: { align: 'center', font: helveticaBoldFont, color: red } }],
          [
              { text: 'Estrutura do Trabalho', options: { size: 9 } },
              { text: 'Nota até 1,0', options: { size: 9, align: 'center' } },
              { text: formData.scoreStructure, options: { align: 'center' } }
          ],
          [
              { text: 'Relevância, Originalidade e Qualidade do Conteúdo do Texto', options: { size: 9 } },
              { text: 'Nota até 3,0', options: { size: 9, align: 'center' } },
              { text: formData.scoreRelevance, options: { align: 'center' } }
          ],
          [
              { text: 'Grau de Conhecimento Demonstrado no Trabalho Escrito', options: { size: 9 } },
              { text: 'Nota até 2,0', options: { size: 9, align: 'center' } },
              { text: formData.scoreKnowledge, options: { align: 'center' } }
          ],
          [
              { text: 'Adequação da Bibliografia Apresentada', options: { size: 9 } },
              { text: 'Nota até 1,0', options: { size: 9, align: 'center' } },
              { text: formData.scoreBibliography, options: { align: 'center' } }
          ],
          [
              { text: `SUB-TOTAL (até 7,0)`, colSpan: 2, options: { align: 'right', font: helveticaBoldFont, color: red, size: 9 } },
              { text: subTotalReport.toFixed(2), options: { align: 'center', font: helveticaBoldFont } }
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
                  if (colWidths[colIndex + j] !== undefined) { currentCellWidth += colWidths[colIndex + j]; }
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

      currentY -= 30;
      const needsChangesText = formData.needsChanges === 'sim' 
        ? 'O aluno deverá realizar alterações no Relatório Escrito:   (X) Sim      ( ) Não'
        : 'O aluno deverá realizar alterações no Relatório Escrito:   ( ) Sim      (X) Não';
      drawText(needsChangesText, margin, currentY);
      
      currentY -= 30;
      const signatureY = currentY;
      drawText('Assinatura do Professor(a):', margin, signatureY);
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
      
      currentY -= 30;
      drawText('Observações:', margin, currentY, {font: helveticaBoldFont});
      
      currentY -= 20;
      const formattedFinalDate = formData.finalSubmissionDate ? new Date(formData.finalSubmissionDate.replace(/-/g, '/')).toLocaleDateString('pt-BR') : '';
      const obs1Text = `1. Data Final para entregar a cópia definitiva do Trabalho de Graduação: ${formattedFinalDate}`;
      drawText(obs1Text, margin, currentY, {size: 9});
      
      currentY -= 15;
      const obs2part1 = '2. Caso a versão definitiva do Relatório Escrito não seja entregue no prazo, o aluno será considerado ';
      drawText(obs2part1, margin, currentY, {size: 9});
      currentY -= 10;
      drawText('REPROVADO', margin, currentY, {size: 9, font: helveticaBoldFont});
      const obs2Part1Width = helveticaBoldFont.widthOfTextAtSize('REPROVADO', 9);
      drawText(' na disciplina.', margin + obs2Part1Width, currentY, {size: 9});
      currentY -= 12;

      page.drawLine({ start: { x: margin, y: currentY }, end: { x: width - margin, y: currentY } });

      const pdfBytes = await pdfDoc.save();
  
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Avaliacao_TCC_SI_${formData.studentName.split(' ')[0] || 'Aluno'}.pdf`;
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
      <h2>Ficha de Avaliação de TCC (Sistemas de Informação)</h2>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
        <label>Aluno(a): <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} required /></label>
        <label>Professor(a): <input type="text" name="professorName" value={formData.professorName} onChange={handleChange} required /></label>
        <label>Data: <input type="date" name="date" value={formData.date} onChange={handleChange} required /></label>
        <label>Horário: <input type="time" name="time" value={formData.time} onChange={handleChange} required /></label>
      </div>

      <h3>Apresentação (Sub-total: {subTotalPresentation.toFixed(2)})</h3>
      <label>Conteúdo da Apresentação (até 1,0): <input type="number" name="scorePresentationContent" value={formData.scorePresentationContent} onChange={handleChange} step="0.1" min="0" max="1" required /></label>
      <label>Domínio dos Recursos Didáticos (até 1,0): <input type="number" name="scoreDidacticResources" value={formData.scoreDidacticResources} onChange={handleChange} step="0.1" min="0" max="1" required /></label>
      <label>Utilização do Tempo e Poder de Síntese (até 1,0): <input type="number" name="scoreTimeUsage" value={formData.scoreTimeUsage} onChange={handleChange} step="0.1" min="0" max="1" required /></label>
      
      <h3>Conteúdo do Relatório Escrito (Sub-total: {subTotalReport.toFixed(2)})</h3>
      <label>Estrutura do Trabalho (até 1,0): <input type="number" name="scoreStructure" value={formData.scoreStructure} onChange={handleChange} step="0.1" min="0" max="1" required /></label>
      <label>Relevância, Originalidade e Qualidade (até 3,0): <input type="number" name="scoreRelevance" value={formData.scoreRelevance} onChange={handleChange} step="0.1" min="0" max="3" required /></label>
      <label>Grau de Conhecimento Demonstrado (até 2,0): <input type="number" name="scoreKnowledge" value={formData.scoreKnowledge} onChange={handleChange} step="0.1" min="0" max="2" required /></label>
      <label>Adequação da Bibliografia (até 1,0): <input type="number" name="scoreBibliography" value={formData.scoreBibliography} onChange={handleChange} step="0.1" min="0" max="1" required /></label>
      
      <h3 style={{marginTop: '2rem'}}>Total: {total.toFixed(2)}</h3>

      <label>O aluno deverá realizar alterações no Relatório Escrito?
        <div className="radio-group">
          <label><input type="radio" name="needsChanges" value="sim" checked={formData.needsChanges === 'sim'} onChange={handleChange} /> Sim</label>
          <label><input type="radio" name="needsChanges" value="nao" checked={formData.needsChanges === 'nao'} onChange={handleChange} /> Não</label>
        </div>
      </label>

      <label>Data Final para entregar a cópia definitiva: <input type="date" name="finalSubmissionDate" value={formData.finalSubmissionDate} onChange={handleChange} /></label>

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

export default AvaliacaoTccSiForm; 