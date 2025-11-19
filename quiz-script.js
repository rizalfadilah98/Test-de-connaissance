// Quiz Interactif - JavaScript avec jQuery

// 1. Définition du tableau de questions avec leurs propriétés
const questions = [
    {
        question: "Comment dit-on 'Hello' en français ?",
        answer: ["bonjour", "coucou", "salut", "bonsoir"],
        difficulty: "facile",
        topic: "salutation"
    },
    {
        question: "Comment dit-on 'Thank you' en espagnol ?",
        answer: "gracias",
        difficulty: "moyen",
        topic: "remerciement"
    },
    {
        question: "Quelle est la capitale de la France ?",
        answer: "paris",
        difficulty: "facile",
        topic: "géographie"
    },
    {
        question: "Comment dit-on 'Good morning' en italien ?",
        answer: "buongiorno",
        difficulty: "moyen",
        topic: "salutation"
    },
    {
        question: "Quelle est la capitale de l'Espagne ?",
        answer: "madrid",
        difficulty: "facile",
        topic: "géographie"
    },
    {
        question: "Comment dit-on 'Please' en allemand ?",
        answer: "bitte",
        difficulty: "difficile",
        topic: "politesse"
    },
    {
        question: "Quelle est la capitale du Japon ?",
        answer: "tokyo",
        difficulty: "moyen",
        topic: "géographie"
    },
    {
        question: "Comment dit-on 'Goodbye' en italien ?",
        answer: "arrivederci",
        difficulty: "difficile",
        topic: "salutation"
    }
];

// Variable pour stocker les résultats
let userAnswers = {};

$( document ).ready(function() {
    // Initialiser le quiz
    initializeQuiz();
    
    // Gestionnaires d'événements
    $('#submit-quiz').on('click', submitQuiz);
    $('#reset-quiz').on('click', resetQuiz);
});

// Fonction pour initialiser le quiz
function initializeQuiz() {
    const quizContainer = $('#quiz-container');
    quizContainer.empty();
    
    // Générer les questions dynamiquement
    questions.forEach((q, index) => {
        const questionHtml = createQuestionHtml(q, index);
        quizContainer.append(questionHtml);
    });
}

// Fonction pour créer le HTML d'une question
function createQuestionHtml(questionObj, index) {
    const difficultyClass = questionObj.difficulty;
    return `
        <div class="question-block" 
             data-answer="${questionObj.answer}" 
             data-difficulty="${questionObj.difficulty}" 
             data-topic="${questionObj.topic}">
            
            <div class="question-text">
                Question ${index + 1}: ${questionObj.question}
            </div>
            
            <div class="question-meta">
                <span class="difficulty ${difficultyClass}">
                    Difficulté: ${questionObj.difficulty}
                </span>
                <span class="topic">
                    Thématique: ${questionObj.topic}
                </span>
            </div>
            
            <input type="text" 
                   class="answer-input" 
                   data-question-index="${index}"
                   placeholder="Votre réponse..."
                   autocomplete="off">
        </div>
    `;
}

// Fonction pour normaliser les réponses (casse et diacritiques)
function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques
        .replace(/[^\w\s]/gi, ''); // Supprimer la ponctuation
}

// Fonction pour soumettre le quiz
function submitQuiz() {
    userAnswers = {};
    let allAnswered = true;
    
    // Collecter toutes les réponses
    $('.answer-input').each(function() {
        const $input = $(this);
        const questionIndex = $input.data('question-index');
        const userAnswer = $input.val().trim();
        
        if (userAnswer === '') {
            allAnswered = false;
            $input.focus();
            return false; // Sortir de la boucle each
        }
        
        userAnswers[questionIndex] = {
            userAnswer: userAnswer,
            normalizedAnswer: normalizeAnswer(userAnswer),
            questionData: questions[questionIndex]
        };
    });
    
    if (!allAnswered) {
        alert('⚠️ Veuillez répondre à toutes les questions avant de soumettre.');
        return;
    }
    
    // Calculer et afficher les résultats
    calculateAndDisplayResults();
}

// Fonction pour calculer et afficher les résultats
function calculateAndDisplayResults() {
    let totalScore = 0;
    let maxScore = questions.length;
    let topicScores = {};
    let detailedResults = [];
    
    // Analyser chaque réponse
    Object.keys(userAnswers).forEach(questionIndex => {
        const answer = userAnswers[questionIndex];
        const question = answer.questionData;
        // Supporter question.answer qui peut être une chaîne OU un tableau de réponses acceptables
        let normalizedCorrectAnswers = [];
        if (Array.isArray(question.answer)) {
            normalizedCorrectAnswers = question.answer.map(a => normalizeAnswer(a));
        } else {
            normalizedCorrectAnswers = [normalizeAnswer(String(question.answer))];
        }

        // Vérification principale : l'utilisateur est correct si sa réponse normalisée
        // figure dans la liste des réponses correctes normalisées
        let isCorrect = normalizedCorrectAnswers.includes(answer.normalizedAnswer);
        
        // Score total
        if (isCorrect) {
            totalScore++;
        }
        
        // Score par thématique
        if (!topicScores[question.topic]) {
            topicScores[question.topic] = { correct: 0, total: 0 };
        }
        topicScores[question.topic].total++;
        if (isCorrect) {
            topicScores[question.topic].correct++;
        }
        
        // Résultats détaillés
        detailedResults.push({
            question: question.question,
            userAnswer: answer.userAnswer,
            correctAnswer: Array.isArray(question.answer) ? question.answer.join(', ') : question.answer,
            isCorrect: isCorrect,
            topic: question.topic,
            difficulty: question.difficulty
        });
    });
    
    // Afficher les résultats
    displayResults(totalScore, maxScore, topicScores, detailedResults);
}

// Fonction pour afficher les résultats
function displayResults(totalScore, maxScore, topicScores, detailedResults) {
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    // Score total
    $('#total-score').html(`
        <div class="score-display">
            <h3>Score Global</h3>
            <p style="font-size: 1.5rem; font-weight: bold; color: #4CAF50;">
                ${totalScore}/${maxScore} (${percentage}%)
            </p>
            <div class="score-bar">
                <div class="score-fill" style="width: ${percentage}%"></div>
            </div>
        </div>
    `);
    
    // Scores par thématique
    let topicHtml = '<div class="score-display"><h3>Scores par Thématique</h3>';
    Object.keys(topicScores).forEach(topic => {
        const score = topicScores[topic];
        const topicPercentage = Math.round((score.correct / score.total) * 100);
        topicHtml += `
            <div style="margin-bottom: 15px;">
                <strong>${topic.charAt(0).toUpperCase() + topic.slice(1)}:</strong> 
                ${score.correct}/${score.total} (${topicPercentage}%)
                <div class="score-bar">
                    <div class="score-fill" style="width: ${topicPercentage}%"></div>
                </div>
            </div>
        `;
    });
    topicHtml += '</div>';
    $('#topic-scores').html(topicHtml);
    
    // Résultats détaillés
    let detailsHtml = '<div class="score-display"><h3>Correction Détaillée</h3>';
    detailedResults.forEach((result, index) => {
        const feedbackClass = result.isCorrect ? 'feedback-correct' : 'feedback-incorrect';
        const icon = result.isCorrect ? '✅' : '❌';
        
        detailsHtml += `
            <div class="answer-feedback ${feedbackClass}" style="margin-bottom: 15px;">
                <strong>${icon} Question ${index + 1}:</strong> ${result.question}<br>
                <strong>Votre réponse:</strong> <span class="${result.isCorrect ? 'correct-answer' : 'incorrect-answer'}">${result.userAnswer}</span><br>
                ${!result.isCorrect ? `<strong>Réponse correcte:</strong> <span class="correct-answer">${result.correctAnswer}</span><br>` : ''}
                <small><em>Thématique: ${result.topic} | Difficulté: ${result.difficulty}</em></small>
            </div>
        `;
    });
    detailsHtml += '</div>';
    $('#detailed-results').html(detailsHtml);
    
    // Afficher la section résultats
    $('#results').show();
    
    // Faire défiler jusqu'aux résultats
    $('html, body').animate({
        scrollTop: $('#results').offset().top
    }, 800);
}

// Fonction pour réinitialiser le quiz
function resetQuiz() {
    userAnswers = {};
    $('.answer-input').val('');
    $('#results').hide();
    
    // Faire défiler vers le haut
    $('html, body').animate({
        scrollTop: 0
    }, 500);
}

// Ajouter des fonctionnalités supplémentaires

// Validation en temps réel (optionnel)
$(document).on('input', '.answer-input', function() {
    const $input = $(this);
    const value = $input.val().trim();
    
    // Ajouter une bordure verte si l'input n'est pas vide
    if (value !== '') {
        $input.css('border-color', '#4CAF50');
    } else {
        $input.css('border-color', '#ddd');
    }
});

// Touche Entrée pour soumettre
$(document).on('keypress', '.answer-input', function(e) {
    if (e.which === 13) { // Touche Entrée
        const allInputs = $('.answer-input');
        const currentIndex = allInputs.index(this);
        
        if (currentIndex < allInputs.length - 1) {
            // Passer au champ suivant
            allInputs.eq(currentIndex + 1).focus();
        } else {
            // Soumettre le quiz si c'est le dernier champ
            submitQuiz();
        }
    }
});