// public/js/home.js

document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DOS DROPDOWNS (Perfil e Notificações) ---
    // (Esta parte continua igual)

    const notificationButton = document.getElementById('notification-button');
    const notificationDropdown = document.getElementById('notification-dropdown');

    if (notificationButton) {
        notificationButton.addEventListener('click', function(event) {
            event.stopPropagation();
            notificationDropdown.classList.toggle('show');
            if (profileDropdown) profileDropdown.classList.remove('show');
        });
    }

    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileButton) {
        profileButton.addEventListener('click', function(event) {
            event.stopPropagation();
            profileDropdown.classList.toggle('show');
            if (notificationDropdown) notificationDropdown.classList.remove('show');
        });
    }

    window.addEventListener('click', function(event) {
        if (notificationDropdown && !notificationDropdown.contains(event.target) && !notificationButton.contains(event.target)) {
            notificationDropdown.classList.remove('show');
        }
        if (profileDropdown && !profileDropdown.contains(event.target) && !profileButton.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    
    // --- GRÁFICOS (AGORA COM GOOGLE CHARTS) ---

    // 1. Carrega o Google Charts
    // Pede os pacotes 'corechart' (para Linha, Barra, Pizza)
    google.charts.load('current', {'packages':['corechart']});

    // 2. Define uma função para chamar QUANDO os gráficos estiverem prontos
    google.charts.setOnLoadCallback(drawAllCharts);

    // 3. Função principal que desenha tudo
    function drawAllCharts() {
        drawMonthlyPerformance();
        drawWeeklyFrequency();
        drawGradesDistribution();
    }

    // --- GRÁFICO 1: Performance Mensal (Linha) ---
    function drawMonthlyPerformance() {
        const data = google.visualization.arrayToDataTable([
            ['Mês', 'Média Geral', { role: 'style' }],
            ['Jan', 7.2, 'point { size: 6; shape-type: circle; fill-color: #3f51b5; }'],
            ['Fev', 7.6, 'point { size: 6; shape-type: circle; fill-color: #3f51b5; }'],
            ['Mar', 7.8, 'point { size: 6; shape-type: circle; fill-color: #3f51b5; }'],
            ['Abr', 7.6, 'point { size: 6; shape-type: circle; fill-color: #3f51b5; }'],
            ['Mai', 8.1, 'point { size: 6; shape-type: circle; fill-color: #3f51b5; }'],
            ['Jun', 8.3, 'point { size: 6; shape-type: circle; fill-color: #3f51b5; }']
        ]);

        const options = {
            legend: { position: 'none' },
            colors: ['#3f51b5'], // Azul primário
            vAxis: { 
                title: 'Média', 
                minValue: 6, 
                maxValue: 10,
                gridlines: { color: '#eee' }
            },
            hAxis: { 
                title: 'Mês',
                gridlines: { color: 'transparent' }
            },
            chartArea: { left: 40, top: 20, width: '90%', height: '80%' },
            pointSize: 6
        };

        const chart = new google.visualization.LineChart(document.getElementById('monthlyPerformanceChart'));
        chart.draw(data, options);
    }

    // --- GRÁFICO 2: Frequência Semanal (Barras Empilhadas) ---
    function drawWeeklyFrequency() {
        const data = google.visualization.arrayToDataTable([
            ['Dia', 'Presentes', 'Faltas'],
            ['Seg', 340, 12],
            ['Ter', 335, 15],
            ['Qua', 350, 8],
            ['Qui', 345, 10],
            ['Sex', 355, 5]
        ]);

        const options = {
            legend: { position: 'top' },
            isStacked: true,
            colors: ['#4CAF50', '#f44336'], // Verde para presentes, Vermelho para faltas
            vAxis: { 
                gridlines: { color: '#eee' }
            },
            hAxis: {
                gridlines: { color: 'transparent' }
            },
            chartArea: { left: 40, top: 40, width: '90%', height: '70%' },
            bar: { groupWidth: '60%' }
        };

        const chart = new google.visualization.BarChart(document.getElementById('weeklyFrequencyChart'));
        chart.draw(data, options);
    }

    // --- GRÁFICO 3: Distribuição de Notas (Rosca/Doughnut) ---
    function drawGradesDistribution() {
        const data = google.visualization.arrayToDataTable([
            ['Desempenho', 'Porcentagem'],
            ['Ótimo (9-10)', 20],
            ['Bom (7-8.9)', 45],
            ['Regular (5-6.9)', 25],
            ['Abaixo (0-4.9)', 10]
        ]);

        const options = {
            pieHole: 0.7, // Controla o "buraco" no meio
            legend: { position: 'bottom' },
            colors: ['#4CAF50', '#2196F3', '#ffeb3b', '#f44336'],
            pieSliceText: 'none', // Remove o texto de dentro das fatias
            chartArea: { left: 10, top: 20, width: '95%', height: '75%' }
        };

        const chart = new google.visualization.PieChart(document.getElementById('gradesDistributionChart'));
        chart.draw(data, options);
    }

    // Para o caso de redimensionar a janela (Google Charts precisa disso)
    window.onresize = drawAllCharts;
});