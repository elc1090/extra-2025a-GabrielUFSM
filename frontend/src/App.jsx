import { useState } from 'react';
import './App.css';
import AtaForm from './components/AtaForm';
import AvaliacaoTccCcForm from './components/AvaliacaoTccCcForm';
import AvaliacaoTccAndamentoCcForm from './components/AvaliacaoTccAndamentoCcForm';
import AvaliacaoTccSiForm from './components/AvaliacaoTccSiForm';

function App() {
  const [selectedForm, setSelectedForm] = useState(null);

  const forms = [
    { id: 'ata', name: 'Ata de Apresentação de TCC', component: <AtaForm /> },
    { id: 'avaliacao_cc', name: 'Ficha de Avaliação de TCC (Ciência da Computação)', component: <AvaliacaoTccCcForm /> },
    { id: 'avaliacao_andamento_cc', name: 'Ficha de Avaliação de TCC em Andamento (Ciência da Computação)', component: <AvaliacaoTccAndamentoCcForm /> },
    { id: 'avaliacao_si', name: 'Ficha de Avaliação de TCC (Sistemas de Informação)', component: <AvaliacaoTccSiForm /> },
  ];

  const renderContent = () => {
    if (selectedForm) {
      const form = forms.find(f => f.id === selectedForm);
      return (
        <div>
          <button onClick={() => setSelectedForm(null)} className="back-button">
            &larr; Voltar
          </button>
          {form.component ? form.component : <p>Formulário em construção.</p>}
        </div>
      );
    }

    return (
      <div>
        <h1>Preenchedor de Formulários de TCC</h1>
        <p>Selecione o formulário que deseja preencher:</p>
        <div className="form-list">
          {forms.map(form => (
            <button key={form.id} onClick={() => setSelectedForm(form.id)}>
              {form.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {renderContent()}
    </div>
  )
}

export default App
