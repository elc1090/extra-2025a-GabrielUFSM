
# Projeto extra: Formulários de avaliação e ata de TCC

<img src="Captura de tela 2025-06-29 134803.png" alt="desktop preview" width="720"/>
<img src="Captura de tela 2025-06-29 134830.png" alt="desktop preview" width="720"/>


Acesso: https://elc1090.github.io/extra-2025a-GabrielUFSM/


### Desenvolvedor
Gabriel Bisognin Moro | Ciência da Computação

### Produto
O objetivo desta aplicação é facilitar o preenchimento de documentos acadêmicos da UFSM que são originalmente distribuídos como formulários em PDF. A aplicação oferece uma interface web onde o usuário pode inserir os dados necessários para cada documento. Após o preenchimento, a ferramenta gera um novo arquivo PDF, visualmente idêntico ao original, mas com os dados do usuário já inseridos nos campos corretos, pronto para ser salvo ou impresso. O objetivo foi gerar o documento final o mais fiel possível ao original.

<img src="Captura de tela 2025-06-29 135036.png" alt="desktop preview" width="720"/>

### Desenvolvimento
O desenvolvimento iniciou com a criação de um projeto React utilizando Vite. A abordagem envolve recriar o documento do zero usando a biblioteca pdf-lib, este método envolve o trabalho de desenhar cada elemento do formulário — cabeçalhos, parágrafos de texto estático, linhas, imagens e os dados dinâmicos do usuário — em uma página em branco.   
Durante o processo, também foi implementada a captura de assinaturas digitais com react-signature-canvas e a incorporação de fontes customizadas e do logo da UFSM no PDF gerado.  

### Tecnologias
- HTML5 & CSS3: Estrutura e estilização da interface web.
- JavaScript (ES6+): Linguagem principal da aplicação.
- React: Biblioteca para a construção da interface de usuário e gerenciamento de estado dos formulários.
- Vite: Ferramenta de build e servidor de desenvolvimento de alta performance.
- pdf-lib: Biblioteca central do projeto, utilizada para criar, modificar e desenhar os documentos PDF de forma programática.
- fontkit: Usado em conjunto com a pdf-lib para registrar e embutir fontes customizadas (como a Times New Roman) nos PDFs.
- react-signature-canvas: Componente React para capturar assinaturas do usuário em um elemento <canvas>.
- Git & GitHub: Para controle de versão e hospedagem do código-fonte.
- GitHub Pages: Plataforma de hospedagem para a versão de produção da aplicação.
- Node.js & npm: Ambiente de execução e gerenciador de pacotes para as dependências do projeto.

### Ambiente de desenvolvimento
- Cursor: Assistente de programação por IA e ferramenta de criação de código estilo VSCode
- Chrome Developer Tools: Essencial para depurar a interface do React e inspecionar o CSS.

### Referências e créditos
- Documentação da pdf-lib: Fonte para aprender a criar páginas, desenhar texto, linhas, incorporar imagens e registrar fontes. (https://pdf-lib.js.org/)
- Documentação da react-signature-canvas: Guia para implementação da funcionalidade de assinatura. (https://www.npmjs.com/package/react-signature-canvas)
- Cursor (IA Pair Programmer).
- 
---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2025a) em 2025a
