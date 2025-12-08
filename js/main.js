        const startButton = document.getElementById('start-button');
        const playerNameInput = document.getElementById('player-name');
        const rankingList = document.getElementById('ranking-list');

        //Iniciar o Jogo
        startButton.addEventListener('click', function() {
            const playerName = playerNameInput.value || 'Planejador(a) Anônimo(a)';
            sessionStorage.setItem('currentPlayerName', playerName);
            window.location.href = 'game.html';
        });

        //Carregar o Ranking
        function loadRanking() {
            let rankings = JSON.parse(localStorage.getItem('ecosystemRankings')) || [];

            if (rankings.length === 0) {
                rankingList.innerHTML = '<li class="no-score">Nenhuma pontuação registrada ainda.</li>';
                return;
            }

            rankingList.innerHTML = '';
            
            // pega os mais recentes primeiro
            const lastFive = rankings.reverse().slice(0, 5);
            
            lastFive.forEach(entry => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${entry.name}</strong> <span>${entry.score}</span>`;
                rankingList.appendChild(li);
            });
        }

        loadRanking();