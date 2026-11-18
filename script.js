(() => {
    // Ejercicios disponibles por tema.
    const topicExercises = {
        naturales: {
            title: 'Números Naturales',
            question: '¿Qué número sigue en la secuencia? 5, 10, 15, 20, __',
            answers: ['25']
        },
        operaciones: {
            title: 'Operaciones Básicas',
            question: 'Resuelve respetando el orden de las operaciones: 36 ÷ 4 + 7.',
            answers: ['16']
        },
        potenciacion: {
            title: 'Potenciación',
            question: '¿Cuánto es 4³?',
            answers: ['64']
        },
        divisibilidad: {
            title: 'Divisibilidad',
            question: '¿246 es divisible entre 3? Escribe sí o no.',
            answers: ['si', 'sí']
        },
        primos: {
            title: 'Números Primos',
            question: '¿Cuál de estos números es primo: 21, 23 o 27?',
            answers: ['23']
        },
        'mcm-mcd': {
            title: 'MCM y MCD',
            question: '¿Cuál es el mínimo común múltiplo de 6 y 8?',
            answers: ['24']
        },
        fracciones: {
            title: 'Fracciones',
            question: 'Suma 1/4 + 2/4. Escribe la respuesta como fracción.',
            answers: ['3/4']
        },
        decimales: {
            title: 'Decimales',
            question: '¿Cuánto es 4,75 + 2,5? Puedes usar coma o punto decimal.',
            answers: ['7.25', '7,25']
        },
        razones: {
            title: 'Razones y Proporciones',
            question: 'La razón entre dos cantidades es 2:5. Si la primera es 6, ¿cuánto es la segunda?',
            answers: ['15']
        },
        porcentajes: {
            title: 'Porcentajes',
            question: '¿Cuánto es el 15% de 200?',
            answers: ['30']
        },
        'regla-de-tres': {
            title: 'Regla de Tres',
            question: 'Si 4 cuadernos cuestan 20 soles, ¿cuánto cuestan 7 cuadernos al mismo precio unitario?',
            answers: ['35']
        }
    };
    // Ventana emergente y validacion de respuestas.
    const topicDialog = document.getElementById('topicExerciseDialog');
    const topicDialogTitle = document.getElementById('topicDialogTitle');
    const topicQuestion = document.getElementById('topicQuestion');
    const topicExerciseForm = document.getElementById('topicExerciseForm');
    const topicAnswer = document.getElementById('topicAnswer');
    const topicFeedback = document.getElementById('topicFeedback');
    let activeTopicExercise = null;

    function openTopicExercise(card) {
        const exercise = topicExercises[card.dataset.exercise];
        if (!exercise) return;

        activeTopicExercise = exercise;
        topicDialogTitle.textContent = exercise.title;
        topicQuestion.textContent = exercise.question;
        topicAnswer.value = '';
        topicFeedback.textContent = '';
        topicFeedback.className = 'topic-feedback';
        topicDialog.showModal();
        topicAnswer.focus();
    }

    document.querySelectorAll('.tema-card[data-exercise]').forEach((card) => {
        card.addEventListener('click', () => openTopicExercise(card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openTopicExercise(card);
            }
        });
    });

    document.getElementById('closeTopicDialog').addEventListener('click', () => {
        topicDialog.close();
    });

    topicDialog.addEventListener('click', (event) => {
        if (event.target === topicDialog) topicDialog.close();
    });

    topicAnswer.addEventListener('input', () => {
        topicFeedback.textContent = '';
        topicFeedback.className = 'topic-feedback';
    });

    topicExerciseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!activeTopicExercise) return;

        const normalizeAnswer = (answer) => answer
        // Acepta tildes y coma o punto como separador decimal.
            .trim()
            .toLocaleLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(',', '.')
            .replace(/\s+/g, '');
        const answer = normalizeAnswer(topicAnswer.value);
        const isCorrect = activeTopicExercise.answers.some(
            (acceptedAnswer) => normalizeAnswer(acceptedAnswer) === answer
        );

        topicFeedback.textContent = isCorrect
            ? '¡Correcto! Muy bien resuelto.'
            : 'Aún no. Revisa el ejercicio e inténtalo otra vez.';
        topicFeedback.className = `topic-feedback ${isCorrect ? 'is-correct' : 'is-incorrect'}`;
    });

    // Navegacion entre vistas del menu.
    const pageSections = Array.from(document.querySelectorAll('[data-page]'));
    const navigationLinks = Array.from(document.querySelectorAll('.site-header nav a'));
    let activePage = 'inicio';

    function showPage(pageId) {
        const pageExists = pageSections.some((section) => section.dataset.page === pageId);
        if (!pageExists) return;

        activePage = pageId;
        pageSections.forEach((section) => {
            section.hidden = section.dataset.page !== pageId;
        });

        navigationLinks.forEach((navigationLink) => {
            const target = document.getElementById(navigationLink.hash.slice(1));
            if (target && target.dataset.page === pageId) {
                navigationLink.setAttribute('aria-current', 'location');
            } else {
                navigationLink.removeAttribute('aria-current');
            }
        });

        document.dispatchEvent(new CustomEvent('pagechange', { detail: { pageId } }));
    }

    function showPageFromHash() {
        const target = document.getElementById(window.location.hash.slice(1));
        showPage(target && target.dataset.page ? target.dataset.page : 'inicio');
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', () => {
            const target = document.getElementById(link.hash.slice(1));
            if (target && target.dataset.page) {
                showPage(target.dataset.page);
            }
        });
    });

    window.addEventListener('hashchange', showPageFromHash);
    showPageFromHash();

    // Cuestionario y seguimiento de puntaje.
    const questions = Array.from(document.querySelectorAll('.question'));
    const scoreElement = document.getElementById('score');
    const progressBar = document.getElementById('progressBar');
    const progressTrack = document.querySelector('.progress-container');
    const progressText = document.getElementById('progressText');
    const feedbackElement = document.getElementById('feedbackMessage');
    const resultElement = document.getElementById('mensaje');
    let score = 0;
    let answeredQuestions = 0;

    function updateProgress() {
        const percentage = questions.length ? Math.round((answeredQuestions / questions.length) * 100) : 0;
        progressBar.style.width = `${percentage}%`;
        progressTrack.setAttribute('aria-valuenow', String(percentage));
        progressText.textContent = `${percentage}% completado`;
    }

    function answerQuestion(button) {
        const question = button.closest('.question');
        if (!question || question.dataset.answered === 'true') return;

        question.dataset.answered = 'true';
        answeredQuestions += 1;
        const isCorrect = button.dataset.correct === 'true';
        if (isCorrect) score += 1;

        question.querySelectorAll('.answer-button').forEach((option) => {
            option.disabled = true;
            if (option.dataset.correct === 'true') option.classList.add('is-correct');
        });
        if (!isCorrect) button.classList.add('is-incorrect');

        scoreElement.textContent = String(score);
        feedbackElement.textContent = isCorrect
            ? '¡Correcto! Excelente trabajo.'
            : 'No es esa. La respuesta correcta está marcada en verde.';
        feedbackElement.className = `feedback ${isCorrect ? 'is-correct' : 'is-incorrect'}`;
        updateProgress();

        if (answeredQuestions === questions.length) {
            if (score === questions.length) {
                resultElement.textContent = '¡Felicitaciones! Obtuviste la puntuación perfecta.';
            } else if (score >= Math.ceil(questions.length * 2 / 3)) {
                resultElement.textContent = '¡Muy buen trabajo! Sigue practicando para llegar al máximo.';
            } else {
                resultElement.textContent = '¡Buen esfuerzo! Repasa los temas y vuelve a intentarlo.';
            }
        }
    }

    function restartQuiz() {
        score = 0;
        answeredQuestions = 0;
        scoreElement.textContent = '0';
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback';
        resultElement.textContent = '';

        questions.forEach((question) => {
            delete question.dataset.answered;
            question.querySelectorAll('.answer-button').forEach((option) => {
                option.disabled = false;
                option.classList.remove('is-correct', 'is-incorrect');
            });
        });
        updateProgress();
    }

    questions.forEach((question) => {
        question.querySelectorAll('.answer-button').forEach((button) => {
            button.addEventListener('click', () => answerQuestion(button));
        });
    });
    document.getElementById('restartQuiz').addEventListener('click', restartQuiz);

    // Juego y control del temporizador.
    const operationElement = document.getElementById('operation');
    const answerInput = document.getElementById('respuesta');
    const gameForm = document.getElementById('gameForm');
    const submitAnswer = document.getElementById('submitAnswer');
    const timeElement = document.getElementById('time');
    const pointsElement = document.getElementById('points');
    const gameFeedback = document.getElementById('gameFeedback');
    let points = 0;
    let timeLeft = 30;
    let firstNumber = 0;
    let secondNumber = 0;
    let correctAnswer = 0;
    let timerId = null;
    let gameFinished = false;

    function generateOperation() {
        firstNumber = Math.floor(Math.random() * 20) + 1;
        secondNumber = Math.floor(Math.random() * 20) + 1;
        const operator = ['+', '−', '×'][Math.floor(Math.random() * 3)];

        if (operator === '−' && secondNumber > firstNumber) {
            [firstNumber, secondNumber] = [secondNumber, firstNumber];
        }

        if (operator === '+') correctAnswer = firstNumber + secondNumber;
        if (operator === '−') correctAnswer = firstNumber - secondNumber;
        if (operator === '×') correctAnswer = firstNumber * secondNumber;
        operationElement.textContent = `${firstNumber} ${operator} ${secondNumber}`;
    }

    function finishGame() {
        if (gameFinished) return;
        gameFinished = true;
        clearInterval(timerId);
        timerId = null;
        answerInput.disabled = true;
        submitAnswer.disabled = true;
        gameFeedback.textContent = `¡Se acabó el tiempo! Conseguiste ${points} ${points === 1 ? 'punto' : 'puntos'}.`;
        gameFeedback.className = 'game-feedback is-finished';
    }

    function startTimer() {
        clearInterval(timerId);
        timerId = setInterval(() => {
            timeLeft = Math.max(0, timeLeft - 1);
            timeElement.textContent = String(timeLeft);
            if (timeLeft === 0) finishGame();
        }, 1000);
    }

    function checkGameAnswer(event) {
        event.preventDefault();
        if (gameFinished) return;

        const rawAnswer = answerInput.value.trim();
        if (rawAnswer === '') {
            gameFeedback.textContent = 'Escribe una respuesta antes de continuar.';
            gameFeedback.className = 'game-feedback is-error';
            answerInput.focus();
            return;
        }

        if (Number(rawAnswer) === correctAnswer) {
            points += 1;
            pointsElement.textContent = String(points);
            gameFeedback.textContent = '¡Correcto! Aquí va la siguiente.';
            gameFeedback.className = 'game-feedback is-correct';
            generateOperation();
        } else {
            gameFeedback.textContent = 'Aún no. Inténtalo otra vez; el tiempo sigue corriendo.';
            gameFeedback.className = 'game-feedback is-incorrect';
        }

        answerInput.value = '';
        answerInput.focus();
    }

    function restartGame() {
        clearInterval(timerId);
        timerId = null;
        points = 0;
        timeLeft = 30;
        gameFinished = false;
        pointsElement.textContent = '0';
        timeElement.textContent = '30';
        answerInput.value = '';
        answerInput.disabled = false;
        submitAnswer.disabled = false;
        gameFeedback.textContent = 'Escribe tu respuesta o presiona Enter.';
        gameFeedback.className = 'game-feedback';
        generateOperation();
        if (activePage === 'juego') startTimer();
        answerInput.focus();
    }

    gameForm.addEventListener('submit', checkGameAnswer);
    document.getElementById('restartGame').addEventListener('click', restartGame);
    document.addEventListener('pagechange', (event) => {
        activePage = event.detail.pageId;
        if (activePage === 'juego') {
            if (!gameFinished) startTimer();
        } else {
            clearInterval(timerId);
            timerId = null;
        }
    });
    generateOperation();
    if (activePage === 'juego') startTimer();
})();

