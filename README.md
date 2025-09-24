# AutoCyber Trainer 🛡️🚗

Este é um protótipo de uma plataforma interativa para treinamento em cibersegurança de veículos autônomos. O objetivo é fornecer um ambiente de aprendizado gamificado onde os usuários podem visualizar cenários de ciberataques, entender suas mitigações e testar seus conhecimentos através de um quiz.

## ✨ Funcionalidades

  - **Treinamento Interativo:** 5 cenários de ciberataques comuns em veículos autônomos (GPS Spoofing, Sensor Spoofing, etc.).
  - **Demonstrações em Vídeo:** Cada cenário apresenta um vídeo do ataque e um vídeo (ou imagem) da mitigação correspondente.
  - **Textos Explicativos:** Descrições claras e concisas sobre como cada ataque e defesa funcionam.
  - **Navegação Livre:** O usuário pode avançar e retroceder entre os cenários para revisar o conteúdo a qualquer momento.
  - **Gamificação:** Sistema de pontuação e badges (Ouro, Prata, Bronze) para engajar o usuário.
  - **Backend Persistente:** O servidor em Go com banco de dados SQLite salva o registro do usuário e sua pontuação final.
  - **Interface Moderna:** Um frontend limpo e responsivo com um tema escuro e notificações personalizadas.

## 🛠️ Tecnologias Utilizadas

Este projeto é dividido em duas partes principais:

**Backend:**

  - **Go (Golang):** Linguagem utilizada para criar o servidor web e a API.
  - **SQLite3:** Banco de dados leve para persistência de dados do usuário.
  - **Gorilla/Mux (Implícito no `net/http`):** Roteamento de requisições HTTP para a API.

**Frontend:**

  - **HTML5**
  - **CSS3:** Estilização moderna com Flexbox e um tema escuro.
  - **JavaScript (Vanilla JS):** Lógica de interação, manipulação do DOM e comunicação com o backend via `fetch`.

**Deployment:**

  - **Docker:** O projeto é totalmente containerizado para fácil execução em qualquer ambiente.

## 📂 Estrutura do Projeto

```
AutoCyber-Trainer/
├── backend/
│   ├── main.go
│   └── gamedata.db
├── frontend/
│   ├── index.html
│   └── assets/
│       ├── css/
│       ├── js/
│       ├── images/
│       └── videos/
├── Dockerfile
└── README.md
```

## 🚀 Como Executar o Projeto

Existem duas maneiras de executar o projeto: usando Docker (recomendado) ou localmente.

### Método 1: Usando Docker (Recomendado)

**Pré-requisitos:**

  - Docker instalado e em execução.

No terminal, na pasta raiz do projeto (`AutoCyber-Trainer`), execute os seguintes comandos:

1.  **Construir a imagem Docker:**

    ```bash
    docker build -t autocyber-trainer .
    ```

2.  **Executar o container:**

    ```bash
    docker run -p 8080:8080 -d --name cyber-app autocyber-trainer
    ```

3.  **Acesse a aplicação** abrindo seu navegador em `http://localhost:8080`.

### Método 2: Executando Localmente

**Pré-requisitos:**

  - Go (versão 1.18 ou superior) instalado.

<!-- end list -->

1.  **Inicie o Backend:**
    Abra um terminal na pasta raiz do projeto e execute o servidor Go:

    ```bash
    go run backend/main.go
    ```

    Você verá a mensagem de que o servidor foi iniciado na porta 8080.

2.  **Acesse o Frontend:**
    Abra seu navegador e acesse `http://localhost:8080`. O servidor Go se encarregará de servir a aplicação frontend.

## 🎮 Como Usar

1.  Ao abrir a aplicação, insira um nome para se registrar.
2.  Você será apresentado ao primeiro cenário de ataque. Assista ao vídeo e leia a explicação.
3.  Clique no botão "Ver Mitigação" para assistir ao vídeo da defesa e entender como ela funciona.
4.  Aparecerá uma pergunta de "Verdadeiro ou Falso". Responda com base no que você aprendeu.
5.  Uma notificação personalizada informará se sua resposta foi correta. Após clicar em "OK", você avançará para o próximo cenário.
6.  Use os botões `<` e `>` no topo da página para navegar e revisar os cenários a qualquer momento.
7.  Ao final dos 5 cenários, sua pontuação final e seu badge serão exibidos.

-----

*Este projeto é um protótipo desenvolvido como uma ferramenta educacional para a conscientização em cibersegurança veicular.*