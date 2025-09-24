document.addEventListener('DOMContentLoaded', () => {

    // --- VARIÁVEIS DE ESTADO DO JOGO ---
    let currentUser = null;
    let score = 0;
    let currentScenarioIndex = 0;

    // (A estrutura de dados 'scenarios' com os 5 cenários continua a mesma)
    const scenarios = [
        { id: 1, title: "GPS Spoofing", attack: { video: "assets/videos/01-attack-gps_spoofing.mp4", explanation: "Neste ataque, um sinal de GPS falso engana o sistema de navegação do veículo." }, mitigation: { video: "assets/videos/01-mitigation-gps_spoofing.mp4", explanation: "A mitigação usa a 'fusão de sensores' para detectar discrepâncias e corrigir a rota." }, question: { text: "O ataque de GPS Spoofing afeta apenas o mapa, sem consequências reais para a direção.", answer: false }, userAnswer: null, answered: false },
        { id: 2, title: "Sensor Spoofing (LiDAR)", attack: { video: "assets/videos/02-attack-sensor_spoofing.mp4", explanation: "Dados falsos são injetados nos sensores, fazendo o sistema 'ver' obstáculos que não existem." }, mitigation: { video: "assets/videos/02-mitigation-sensor_spoofing.png", explanation: "A defesa se baseia na redundância, comparando dados de múltiplos sensores." }, question: { text: "A principal defesa contra o Sensor Spoofing é a verificação cruzada de dados.", answer: true }, userAnswer: null, answered: false },
        { id: 3, title: "Injeção na Rede Interna (CAN)", attack: { video: "assets/videos/03-attack-can_injection.mp4", explanation: "O invasor injeta mensagens falsas na rede interna (CAN bus), podendo controlar freios e aceleração." }, mitigation: { video: "assets/videos/03-mitigation-can_injection.mp4", explanation: "Um gateway de segurança ou um IDS monitora e bloqueia mensagens anômalas na rede." }, question: { text: "Para um ataque de injeção na rede CAN, o invasor precisa de acesso físico ao veículo.", answer: false }, userAnswer: null, answered: false },
        { id: 4, title: "Comprometimento de Firmware (OTA)", attack: { video: "assets/videos/04-attack-ota_compromise.mp4", explanation: "Uma atualização de firmware (Over-The-Air) maliciosa é instalada no veículo sem verificação." }, mitigation: { video: "assets/videos/04-mitigation-ota_compromise.mp4", explanation: "A mitigação essencial é a verificação de assinatura criptográfica para validar a autenticidade da atualização." }, question: { text: "A verificação de assinatura digital é o principal mecanismo de segurança para atualizações OTA.", answer: true }, userAnswer: null, answered: false },
        { id: 5, title: "Ataque Adversarial de ML", attack: { video: "assets/videos/05-attack-adversarial_ml.mp4", explanation: "Pequenas alterações em placas de trânsito enganam o modelo de Machine Learning do carro." }, mitigation: { video: "assets/videos/05-mitigation-adversarial_ml.mp4", explanation: "A defesa utiliza 'ensemble learning' (múltiplos modelos) e filtros para chegar a um consenso seguro." }, question: { text: "Ataques adversariais de ML dependem de modificações grosseiras nas placas para funcionar.", answer: false }, userAnswer: null, answered: false }
    ];

    // --- ELEMENTOS DO DOM (INCLUINDO O NOVO ALERTA) ---
    const registrationScreen = document.getElementById('registration-screen');
    const scenarioScreen = document.getElementById('scenario-screen');
    const endScreen = document.getElementById('end-screen');
    const startBtn = document.getElementById('start-btn');
    const nicknameInput = document.getElementById('nickname');
    const scoreDisplay = document.getElementById('score');
    const scenarioTitle = document.getElementById('scenario-title');
    const scenarioVideo = document.getElementById('scenario-video');
    const scenarioImage = document.getElementById('scenario-image');
    const attackExplanation = document.getElementById('attack-explanation');
    const mitigationContent = document.getElementById('mitigation-content');
    const mitigationExplanation = document.getElementById('mitigation-explanation');
    const showMitigationBtn = document.getElementById('show-mitigation-btn');
    const questionArea = document.getElementById('question-area');
    const questionText = document.getElementById('question-text');
    const trueBtn = document.getElementById('true-btn');
    const falseBtn = document.getElementById('false-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const scenarioCounter = document.getElementById('scenario-counter');
    const customAlertOverlay = document.getElementById('custom-alert-overlay');
    const customAlertBox = document.getElementById('custom-alert-box');
    const customAlertTitle = document.getElementById('custom-alert-title');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertCloseBtn = document.getElementById('custom-alert-close-btn');

    // --- FUNÇÕES DO JOGO ---

    function showCustomAlert(title, isCorrect) {
        customAlertTitle.textContent = title;
        customAlertMessage.textContent = isCorrect ? "Você ganhou 100 pontos!" : "Não desanime, continue aprendendo!";

        customAlertBox.classList.remove('alert-success', 'alert-error');
        customAlertBox.classList.add(isCorrect ? 'alert-success' : 'alert-error');

        customAlertOverlay.classList.remove('hidden');
    }

    function hideCustomAlert() {
        customAlertOverlay.classList.add('hidden');
        // Após fechar o alerta, avança para o próximo cenário ou finaliza
        if (currentScenarioIndex < scenarios.length - 1) {
            navigateTo(currentScenarioIndex + 1);
        } else {
            const allAnswered = scenarios.every(s => s.answered);
            if (allAnswered) endGame();
        }
    }

    function checkAnswer(userAnswer) {
        const scenario = scenarios[currentScenarioIndex];
        if (scenario.answered) return;

        scenario.answered = true;
        scenario.userAnswer = userAnswer;

        const isCorrect = userAnswer === scenario.question.answer;
        if (isCorrect) {
            score += 100;
            showCustomAlert("Resposta Correta!", true);
        } else {
            showCustomAlert("Resposta Incorreta.", false);
        }
        updateScore();
        updateNavButtons();
    }

    // ... (as outras funções como navigateTo, updateNavButtons, displayScenario, etc., continuam as mesmas)

    async function startGame() {
        const nickname = nicknameInput.value;
        if (nickname.trim() === '') { alert('Por favor, insira um nome.'); return; }
        currentUser = nickname;
        try {
            await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname: currentUser }) });
        } catch (error) { console.error("FALHA AO REGISTRAR NO BACKEND:", error); alert("Erro de conexão com o servidor."); return; }
        score = 0;
        scenarios.forEach(s => { s.answered = false; s.userAnswer = null; });
        registrationScreen.classList.add('hidden');
        scenarioScreen.classList.remove('hidden');
        navigateTo(0);
        updateScore();
    }

    function updateScore() { scoreDisplay.textContent = score; }

    function navigateTo(index) {
        currentScenarioIndex = index;
        displayScenario(currentScenarioIndex);
    }

    function updateNavButtons() {
        prevBtn.disabled = currentScenarioIndex === 0;
        nextBtn.disabled = currentScenarioIndex === scenarios.length - 1 || !scenarios[currentScenarioIndex].answered;
        scenarioCounter.textContent = `${currentScenarioIndex + 1} / ${scenarios.length}`;
    }

    function displayScenario(index) {
        const scenario = scenarios[index];
        scenarioTitle.textContent = scenario.title;
        showAttackView(scenario);
        if (scenario.answered) {
            showMitigationView(scenario, true);
        }
        updateNavButtons();
    }

    function showAttackView(scenario) {
        scenarioImage.classList.add('hidden');
        scenarioVideo.classList.remove('hidden');
        mitigationContent.classList.add('hidden');
        questionArea.classList.add('hidden');
        showMitigationBtn.classList.remove('hidden');
        scenarioVideo.src = scenario.attack.video;
        attackExplanation.textContent = scenario.attack.explanation;
    }

    function showMitigationView(scenario, isReview = false) {
        if (scenario.mitigation.video.endsWith('.png')) {
            scenarioVideo.classList.add('hidden');
            scenarioImage.src = scenario.mitigation.video;
            scenarioImage.classList.remove('hidden');
        } else {
            scenarioImage.classList.add('hidden');
            scenarioVideo.classList.remove('hidden');
            scenarioVideo.src = scenario.mitigation.video;
        }
        mitigationContent.classList.remove('hidden');
        mitigationExplanation.textContent = scenario.mitigation.explanation;
        questionText.textContent = scenario.question.text;
        questionArea.classList.remove('hidden');
        showMitigationBtn.classList.add('hidden');
        trueBtn.disabled = isReview;
        falseBtn.disabled = isReview;
    }

    async function endGame() {
        try {
            await fetch('/api/save-score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname: currentUser, score: score }) });
        } catch (error) { console.error("FALHA AO SALVAR PONTUAÇÃO:", error); }
        scenarioScreen.classList.add('hidden');
        endScreen.classList.remove('hidden');
        let badgeName = "Bronze", badgeImage = "assets/images/bronze.jpg";
        if (score >= scenarios.length * 100) { badgeName = "Ouro"; badgeImage = "assets/images/ouro.jpg"; }
        else if (score >= (scenarios.length * 100) / 2) { badgeName = "Prata"; badgeImage = "assets/images/prata.jpg"; }
        document.getElementById('final-score').textContent = score;
        document.getElementById('badge-name').textContent = `Badge de ${badgeName}`;
        document.getElementById('badge-image').src = badgeImage;
    }

    // --- EVENT LISTENERS ---
    startBtn.addEventListener('click', startGame);
    showMitigationBtn.addEventListener('click', () => showMitigationView(scenarios[currentScenarioIndex]));
    trueBtn.addEventListener('click', () => checkAnswer(true));
    falseBtn.addEventListener('click', () => checkAnswer(false));
    prevBtn.addEventListener('click', () => navigateTo(currentScenarioIndex - 1));
    nextBtn.addEventListener('click', () => navigateTo(currentScenarioIndex + 1));
    customAlertCloseBtn.addEventListener('click', hideCustomAlert);
});