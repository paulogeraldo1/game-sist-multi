# 🌍 ODS 13: Resiliência Climática

![Status](https://img.shields.io/badge/Status-Concluído-brightgreen)
![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-blueviolet)
![Tech](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue)

> **Um simulador de estratégia focado na gestão de crises e políticas climáticas.**



---

## 📖 Sobre o Projeto

Este projeto gamifica os desafios complexos do **ODS 13 (Ação Climática)** da ONU. Diferente de jogos tradicionais de "plantio", este simulador coloca o jogador no papel de um gestor público que precisa equilibrar orçamento (Consciência), infraestrutura (Adaptação) e ação direta (Mitigação) enquanto sobrevive a desastres naturais inevitáveis.

O objetivo é educar sobre a interdependência entre **ação imediata** e **planejamento de longo prazo**.

---

## 💻 Tecnologias e Arquitetura de Deploy

O projeto foi desenvolvido utilizando HTML5, CSS3 e JavaScript, sem dependência de frameworks ou bibliotecas externas.

### Por que essa escolha?
A decisão por essa arquitetura foi estratégica para viabilizar o **Deploy Automático (CI/CD)**:

1.  **Integração com GitHub Pages:** Sendo um site estático, o repositório se integra nativamente ao GitHub Pages.
2.  **Deploy Contínuo:** Qualquer *commit* ou *push* feito na branch principal dispara automaticamente o processo de build e atualização do site ao vivo, sem necessidade de configuração de servidores complexos (AWS/Azure) ou containers (Docker).
3.  **Performance e Acessibilidade:** O jogo roda diretamente no navegador do usuário, garantindo carregamento instantâneo e compatibilidade com qualquer dispositivo, facilitando a disseminação educacional.

---

## 🌟 Pontos Fortes do Projeto

Além da arquitetura limpa, o projeto se destaca por:

* **🧠 Lógica de Jogo:** Implementa um sistema de "loops de feedback". Investir em educação (13.3) gera recursos para infraestrutura (13.1), que protege a economia para permitir a mitigação (redução de carbono).
* **🎨 Feedback Visual e Sonoro:**
    * **Poluição Dinâmica:** Utiliza filtros CSS (`backdrop-filter`, `blur`) para degradar visualmente o jogo conforme a poluição aumenta, criando urgência.
    * **Infraestrutura Visível:** O código cria fisicamente muros e tubulações quando os upgrades são comprados.
* **💾 Persistência de Dados (Local Storage):** Utiliza a API de armazenamento do navegador para manter um Ranking de Líderes persistente, permitindo competição local sem necessidade de banco de dados.
* **📱 Design Responsivo:** Interface adaptável via CSS Flexbox, garantindo usabilidade em diferentes resoluções.

---

## 🎯 Alinhamento com o ODS 13

Cada mecânica do jogo traduz uma meta técnica da ONU em uma ação jogável:

| Meta ODS | Conceito Real | Tradução na Mecânica do Jogo |
| :--- | :--- | :--- |
| **13.1** | **Resiliência e Adaptação** | O jogo gera eventos aleatórios de **Seca e Enchente**. O jogador deve comprar **Irrigação** e **Muros** para "imunizar" seu sistema contra essas perdas. |
| **13.2** | **Políticas Nacionais** | O núcleo do jogo é um **Menu de Planejamento**, onde o jogador gasta "Consciência" para integrar medidas políticas antes de agir. |
| **13.3** | **Educação e Conscientização** | O recurso estratégico do jogo (**Consciência 💡**) só é gerado através do investimento em **Flores** (simbolizando educação ambiental). |
| **13.a** | **Financiamento Climático** | Implementação de eventos de **"Fundo Verde"**, que injetam recursos extras (Água) para acelerar a implementação de projetos. |
| **13.b** | **Capacitação** | O upgrade de **Capacitação** reduz o custo das árvores e aumenta a eficiência da água, simulando o impacto de uma força de trabalho qualificada. |

---

## 📂 Estrutura do Repositório

O código segue os princípios de *Separation of Concerns* (Separação de Preocupações):

```bash
/ODS13-GAME
│
├── index.html           # Entry point (Landing Page, Regras e Ranking)
├── game.html            # Aplicação principal (Simulação)
├── README.md            # Documentação do projeto
│
├── css/                 # Camada de Apresentação
│   ├── main.css         # Estilos da Landing Page
│   └── game.css         # Estilos específicos da simulação e animações
│
└── js/                  # Camada de Lógica
    ├── main.js          # Lógica da Landing Page (Ranking/Input)
    └── game.js          # Game Loop, Lógica de Estado, Eventos e DOM
````

-----
## 🚀 Como Jogar e Rodar

### 🕹️ Jogue Agora (Online)
Você pode acessar a versão mais recente do jogo diretamente pelo navegador, sem precisar instalar nada:
👉 **[Clique aqui para jogar](https://paulogeraldo1.github.io/game-sist-multi/)**

---

### 💻 Rodar Localmente (Desenvolvimento)

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/paulogeraldo1/game-sist-multi.git
2.  **Acesse o diretório:**
    ```bash
    cd game-sist-multi
    ```

3.  **Execute o projeto:**
    * Abra o arquivo `index.html` no seu navegador.
    * 💡 **Dica:** Para evitar erros de cache, recomenda-se usar a extensão **Live Server** no VS Code.