import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fontkit from 'fontkit';
import SignatureModal from './SignatureModal';
import './Form.css';
import ufsmLogoPath from '../assets/UFSM_principal_cor.png';
import fontFile from '../assets/fonts/DancingScript-Regular.otf?url';

function AtaForm() {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        place: '',
        studentName: '',
        course: '',
        tccTitle: '',
        examiner1: '',
        examiner2: '',
        examiner3: '',
        finalGrade: '',
        result: 'aprovado',
        deadlineDays: '15',
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [signatureOption, setSignatureOption] = useState('print');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSigner, setCurrentSigner] = useState(null);
    const [signatures, setSignatures] = useState({
        examiner1: null,
        examiner2: null,
        examiner3: null,
        student: null,
    });
    const [typedSignatures, setTypedSignatures] = useState({
        examiner1: '',
        examiner2: '',
        examiner3: '',
        student: '',
    });
    const [fontStyles, setFontStyles] = useState({
        examiner1: 'cursive',
        examiner2: 'cursive',
        examiner3: 'cursive',
        student: 'cursive',
    });

    const handleOpenModal = (signer) => {
        setCurrentSigner(signer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSigner(null);
    };

    const handleSaveSignature = (signer, dataUrl) => {
        setSignatures(prev => ({ ...prev, [signer.id]: dataUrl }));
        handleCloseModal();
    };

    const handleTypedSignatureChange = (signerId, text) => {
        setTypedSignatures(prev => ({ ...prev, [signerId]: text }));
    };

    const handleFontChange = (signerId, font) => {
        setFontStyles(prev => ({ ...prev, [signerId]: font }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!e.currentTarget.checkValidity()) {
            e.currentTarget.reportValidity();
            return;
        }
        setIsGenerating(true);

        try {
            const pdfDoc = await PDFDocument.create();
            pdfDoc.registerFontkit(fontkit);
            const page = pdfDoc.addPage();

            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const fontBytes = await fetch(fontFile).then(res => res.arrayBuffer());
            const cursiveFont = await pdfDoc.embedFont(fontBytes);

            const ufsmLogoBytes = await fetch(ufsmLogoPath).then(res => res.arrayBuffer());
            const ufsmLogoImage = await pdfDoc.embedPng(ufsmLogoBytes);
            const logoDims = ufsmLogoImage.scale(0.05);

            const { width, height } = page.getSize();
            const margin = 40;

            page.drawRectangle({
                x: margin / 2,
                y: margin / 2,
                width: width - margin,
                height: height - margin,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });

            const drawText = (text, options = {}) => {
                if (!text) return;
                const { x, y, size = 11, font = timesRomanFont, color = rgb(0, 0, 0), centerOnX } = options;
                
                let finalX = x;
                if (centerOnX) {
                    const textWidth = font.widthOfTextAtSize(text, size);
                    finalX = centerOnX - textWidth / 2;
                }

                page.drawText(text, { x: finalX, y, font, size, color });
            };

            const drawLine = (x, y, length) => {
                page.drawLine({
                    start: { x, y },
                    end: { x: x + length, y },
                    thickness: 0.5,
                    color: rgb(0, 0, 0),
                });
            };

            const headerY = height - 70;
            page.drawImage(ufsmLogoImage, {
                x: margin + 80,
                y: headerY - logoDims.height + 25,
                width: logoDims.width,
                height: logoDims.height,
            });
            const headerTextX = margin + 80 + logoDims.width + 10;
            drawText('Ministério da Educação', { x: headerTextX, y: headerY, size: 10, font: helveticaFont });
            drawText('Universidade Federal de Santa Maria', { x: headerTextX, y: headerY - 15, size: 10, font: helveticaFont });
            drawText('Centro de Tecnologia', { x: headerTextX, y: headerY - 30, size: 10, font: helveticaFont });
            drawText('ATA DE APRESENTAÇÃO DE TRABALHO DE CONCLUSÃO DE CURSO', { y: height - 170, centerOnX: width / 2, size: 12, font: timesRomanBoldFont });

            const bodyY = height - 250;
            const lineHeight = 22;

            const localDate = new Date(formData.date.replace(/-/g, '/'));
            const day = formData.date ? String(localDate.getDate()) : '';
            const month = formData.date ? localDate.toLocaleString('pt-BR', { month: 'long' }) : '';
            const year = formData.date ? String(localDate.getFullYear()) : '';

            const segments = [
                { text: "Aos " }, { text: day, underline: true }, { text: " dias do mês de " },
                { text: month, underline: true }, { text: " de " }, { text: year, underline: true },
                { text: " às " }, { text: formData.time, underline: true }, { text: ", na sala " },
                { text: formData.place, underline: true }, { text: ", realizou-se o Exame da Defesa do Trabalho de Conclusão de Curso intitulado: \"" },
                { text: formData.tccTitle, underline: true }, { text: "\", de autoria de " },
                { text: formData.studentName, underline: true }, { text: ", acadêmico(a) do Curso de Graduação em " },
                { text: formData.course, underline: true }, { text: " da UFSM. A Banca Examinadora esteve constituída por " },
                { text: formData.examiner1, underline: true }, { text: ", professor(a) orientador(a) do Trabalho de Conclusão de Curso, e por " },
                { text: formData.examiner2, underline: true },
                { text: formData.examiner3 ? " e " : "", underline: false }, { text: formData.examiner3, underline: true },
                { text: ", membros avaliadores. O(a) acadêmico(a) recebeu a nota final " },
                { text: formData.finalGrade, underline: true }, { text: ", sendo " },
                { text: (formData.result === 'aprovado' ? 'Aprovado(a)' : 'Reprovado(a)'), underline: true },
                { text: " pela Banca Examinadora. Foi concedido o prazo de " }, { text: formData.deadlineDays, underline: true },
                { text: " dias para o(a) acadêmico(a) realizar as alterações sugeridas pela Banca Examinadora e entregar o trabalho em sua redação definitiva. E para constar foi lavrada a presente Ata, que será assinada pelos membros da Banca Examinadora e pelo(a) acadêmico(a)." },
            ];

            let currentX = margin;
            let currentY = bodyY;
            const maxWidth = width - margin * 2;

            segments.forEach(segment => {
                if (!segment.text) return;
                const parts = segment.text.split(/(\s+)/g).filter(p => p.length > 0);
                parts.forEach((part) => {
                    const partWidth = timesRomanFont.widthOfTextAtSize(part, 11);
                    if (currentX + partWidth > margin + maxWidth && part.trim() !== '') {
                        currentX = margin;
                        currentY -= lineHeight;
                    }
                    drawText(part, { x: currentX, y: currentY });
                    if (segment.underline) {
                        drawLine(currentX, currentY - 2, partWidth);
                    }
                    currentX += partWidth;
                    if (part.includes('.') && !segment.underline) {
                        currentX = margin;
                        currentY -= lineHeight;
                    }
                });
            });

            const obsY = currentY - (lineHeight * 2);
            drawText('Obs. O instrumento de avaliação da Banca Examinadora deverá ser anexado a esta Ata.', { x: margin, y: obsY, size: 10, font: timesRomanBoldFont });

            const dateLineY = obsY - (lineHeight * 2);
            const finalDateText = `Santa Maria, RS ${day} de ${month} de ${year}.`;
            drawText(finalDateText, { y: dateLineY, centerOnX: width / 2 });

            const sig1X = 110, sig2X = 370;
            const sigLineY1 = dateLineY - 60;
            const sigLineY2 = sigLineY1 - 60;

            drawLine(sig1X, sigLineY1, 150);
            drawLine(sig2X, sigLineY1, 150);
            drawText(formData.examiner1, { y: sigLineY1 - 13, centerOnX: sig1X + 75, size: 10 });
            drawText("Professor(a) Orientador(a)", { y: sigLineY1 - 26, centerOnX: sig1X + 75, size: 9 });
            drawText(formData.examiner2, { y: sigLineY1 - 13, centerOnX: sig2X + 75, size: 10 });
            drawText("Avaliador (a)", { y: sigLineY1 - 26, centerOnX: sig2X + 75, size: 9 });

            drawLine(sig1X, sigLineY2, 150);
            drawLine(sig2X, sigLineY2, 150);
            drawText(formData.examiner3, { y: sigLineY2 - 13, centerOnX: sig1X + 75, size: 10 });
            drawText("Avaliador (a)", { y: sigLineY2 - 26, centerOnX: sig1X + 75, size: 9 });
            drawText(formData.studentName, { y: sigLineY2 - 13, centerOnX: sig2X + 75, size: 10 });
            drawText("Acadêmico(a)", { y: sigLineY2 - 26, centerOnX: sig2X + 75, size: 9 });

            const signatureFieldsMap = [
                { key: 'examiner1', x: sig1X, y: sigLineY1 },
                { key: 'examiner2', x: sig2X, y: sigLineY1 },
                { key: 'examiner3', x: sig1X, y: sigLineY2 },
                { key: 'student', x: sig2X, y: sigLineY2 },
            ];

            if (signatureOption === 'draw') {
                for (const field of signatureFieldsMap) {
                    const signatureDataUrl = signatures[field.key];
                    if (signatureDataUrl) {
                        const pngImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
                        const pngImage = await pdfDoc.embedPng(pngImageBytes);
                        const sigDims = pngImage.scale(0.24);
                        page.drawImage(pngImage, {
                            x: field.x + (150 - sigDims.width) / 2,
                            y: field.y - (sigDims.height / 2),
                            width: sigDims.width,
                            height: sigDims.height,
                        });
                    }
                }
            } else if (signatureOption === 'type') {
                for (const field of signatureFieldsMap) {
                    const signatureText = typedSignatures[field.key];
                    const fontStyle = fontStyles[field.key];
                    if (signatureText) {
                        const selectedFont = fontStyle === 'cursive' ? cursiveFont : timesRomanFont;
                        const textSize = fontStyle === 'cursive' ? 24 : 14;
                        const textWidth = selectedFont.widthOfTextAtSize(signatureText, textSize);
                        
                        page.drawText(signatureText, {
                            x: field.x + (150 - textWidth) / 2,
                            y: field.y - (textSize / 2) + 2,
                            font: selectedFont,
                            size: textSize,
                            color: rgb(0, 0, 0),
                        });
                    }
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Ata_TCC_${formData.studentName.split(' ')[0] || 'Aluno'}.pdf`;
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

    const signatureFields = [
        { id: 'examiner1', name: formData.examiner1 || 'Orientador(a)' },
        { id: 'examiner2', name: formData.examiner2 || 'Avaliador(a) 1' },
        { id: 'examiner3', name: formData.examiner3 || 'Avaliador(a) 2' },
        { id: 'student', name: formData.studentName || 'Acadêmico(a)' },
    ];

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <SignatureModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSignature}
                fieldToSign={currentSigner}
            />
            <h2>Ata de Apresentação de TCC</h2>

            <label>Data: <input type="date" name="date" value={formData.date} onChange={handleChange} required /></label>
            <label>Hora: <input type="time" name="time" value={formData.time} onChange={handleChange} required /></label>
            <label>Local: <input type="text" name="place" value={formData.place} onChange={handleChange} placeholder="Local da apresentação" required /></label>
            <label>Nome do Aluno: <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Nome completo do aluno" required /></label>
            <label>Curso: <input type="text" name="course" value={formData.course} onChange={handleChange} placeholder="Ex: Ciência da Computação" required /></label>
            <label>Título do TCC: <input type="text" name="tccTitle" value={formData.tccTitle} onChange={handleChange} placeholder="Título do trabalho" required /></label>

            <h3>Banca Examinadora</h3>
            <label>Professor(a) Orientador(a): <input type="text" name="examiner1" value={formData.examiner1} onChange={handleChange} placeholder="Nome do(a) orientador(a)" required /></label>
            <label>Avaliador(a) 1: <input type="text" name="examiner2" value={formData.examiner2} onChange={handleChange} placeholder="Nome do 1º avaliador(a)" required /></label>
            <label>Avaliador(a) 2: <input type="text" name="examiner3" value={formData.examiner3} onChange={handleChange} placeholder="Nome do 2º avaliador(a) (se houver)" /></label>

            <h3>Assinaturas</h3>
            <div className="radio-group">
                <label>
                    <input type="radio" value="print" checked={signatureOption === 'print'} onChange={() => setSignatureOption('print')} />
                    Imprimir e assinar manualmente
                </label>
                <label>
                    <input type="radio" value="draw" checked={signatureOption === 'draw'} onChange={() => setSignatureOption('draw')} />
                    Desenhar assinaturas digitalmente
                </label>
                <label>
                    <input type="radio" value="type" checked={signatureOption === 'type'} onChange={() => setSignatureOption('type')} />
                    Digitar assinatura
                </label>
            </div>

            {signatureOption === 'draw' && (
                <div className="signature-section">
                    <p>Clique para assinar nos campos abaixo:</p>
                    {signatureFields.map(signer => {
                        const isExaminerFieldFilled = signer.id.includes('examiner') && formData[signer.id];
                        const isStudentField = signer.id === 'student' && formData.studentName;
                        if ((signer.id === 'examiner3' && !formData.examiner3) || (!isExaminerFieldFilled && !isStudentField)) {
                            return null;
                        }

                        return (
                            <div key={signer.id} className="signature-action">
                                <span>{signer.name}:</span>
                                <button type="button" onClick={() => handleOpenModal(signer)}>
                                    {signatures[signer.id] ? 'Alterar Assinatura' : 'Desenhar Assinatura'}
                                </button>
                                {signatures[signer.id] && (
                                    <img src={signatures[signer.id]} alt="Signature preview" className="signature-preview" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {signatureOption === 'type' && (
                <div className="signature-section">
                    <p>Digite o nome para cada assinante e escolha o estilo da fonte:</p>
                    {signatureFields.map(signer => {
                        const isExaminerFieldFilled = signer.id.includes('examiner') && formData[signer.id];
                        const isStudentField = signer.id === 'student' && formData.studentName;
                        if ((signer.id === 'examiner3' && !formData.examiner3) || (!isExaminerFieldFilled && !isStudentField)) {
                            return null;
                        }

                        return (
                            <div key={signer.id} className="typed-signature-action">
                                <span className="signer-name">{signer.name}:</span>
                                <input
                                    type="text"
                                    className="signature-input"
                                    placeholder="Digite o nome para assinar"
                                    value={typedSignatures[signer.id]}
                                    onChange={(e) => handleTypedSignatureChange(signer.id, e.target.value)}
                                />
                                <div className="font-selector">
                                    <label>
                                        <input type="radio" name={`${signer.id}-font`} value="cursive" checked={fontStyles[signer.id] === 'cursive'} onChange={() => handleFontChange(signer.id, 'cursive')} /> Cursiva
                                    </label>
                                    <label>
                                        <input type="radio" name={`${signer.id}-font`} value="sans-serif" checked={fontStyles[signer.id] === 'sans-serif'} onChange={() => handleFontChange(signer.id, 'sans-serif')} /> Padrão
                                    </label>
                                </div>
                                <div className="signature-preview-text-container">
                                    <div 
                                        className="signature-preview-text"
                                        style={{ fontFamily: fontStyles[signer.id] === 'cursive' ? "'Dancing Script', cursive" : "Helvetica, sans-serif" }}
                                    >
                                        {typedSignatures[signer.id] || 'Pré-visualização'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <h3>Resultado</h3>
            <label>Nota Final: <input type="text" name="finalGrade" value={formData.finalGrade} onChange={handleChange} placeholder="Ex: 9.5" required /></label>
            <label className="extra-margin-bottom">Resultado:
                <select name="result" value={formData.result} onChange={handleChange}>
                    <option value="aprovado">Aprovado</option>
                    <option value="reprovado">Reprovado</option>
                </select>
            </label>
            <label>Prazo para alterações (dias): <input type="number" name="deadlineDays" value={formData.deadlineDays} onChange={handleChange} placeholder="15" required /></label>

            <button type="submit" disabled={isGenerating}>
                {isGenerating ? 'Gerando...' : 'Gerar PDF'}
            </button>
        </form>
    );
}

export default AtaForm; 