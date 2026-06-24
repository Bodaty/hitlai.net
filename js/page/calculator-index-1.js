        function formatCurrency(num) {
            return '$' + Math.round(num).toLocaleString();
        }

        function calculate() {
            // RPA costs
            var rpaBots = parseFloat(document.getElementById('rpa-bots').value) || 0;
            var rpaCostPerBot = parseFloat(document.getElementById('rpa-cost-per-bot').value) || 0;
            var rpaPlatform = parseFloat(document.getElementById('rpa-platform').value) || 0;
            var rpaFtes = parseFloat(document.getElementById('rpa-ftes').value) || 0;

            // AI Governance costs
            var govAnnual = parseFloat(document.getElementById('gov-annual').value) || 0;
            var govImpl = parseFloat(document.getElementById('gov-implementation').value) || 0;

            // Copilot costs
            var copilotSeats = parseFloat(document.getElementById('copilot-seats').value) || 0;
            var copilotCost = parseFloat(document.getElementById('copilot-cost').value) || 0;
            var copilotTraining = parseFloat(document.getElementById('copilot-training').value) || 0;

            // Automation platform costs
            var autoAnnual = parseFloat(document.getElementById('auto-annual').value) || 0;
            var autoOverage = parseFloat(document.getElementById('auto-overage').value) || 0;

            // Integration costs
            var integrationFtes = parseFloat(document.getElementById('integration-ftes').value) || 0;
            var integrationSalary = parseFloat(document.getElementById('integration-salary').value) || 0;
            var integrationTools = parseFloat(document.getElementById('integration-tools').value) || 0;

            // Training costs
            var trainingEmployees = parseFloat(document.getElementById('training-employees').value) || 0;
            var trainingCost = parseFloat(document.getElementById('training-cost').value) || 0;

            // HitLai config
            var hitlaiMonthly = parseFloat(document.getElementById('hitlai-tier').value) || 0;
            var hitlaiFtes = parseFloat(document.getElementById('hitlai-ftes').value) || 0;
            var hitlaiTrainingCost = parseFloat(document.getElementById('hitlai-training').value) || 0;

            // Calculate Frankenstein Stack
            var rpaTotal = (rpaBots * rpaCostPerBot) + rpaPlatform + (rpaFtes * integrationSalary);
            var govTotal = govAnnual + (govImpl / 3);
            var copilotTotal = (copilotSeats * copilotCost * 12) + ((copilotSeats * copilotTraining) / 3);
            var autoTotal = autoAnnual + autoOverage;
            var integrationTotal = (integrationFtes * integrationSalary) + integrationTools;
            var trainingTotal = trainingEmployees * trainingCost;

            var frankensteinTotal = rpaTotal + govTotal + copilotTotal + autoTotal + integrationTotal + trainingTotal;

            // Calculate HitLai
            var hitlaiLicense = hitlaiMonthly * 12;
            var hitlaiIntegration = hitlaiFtes * integrationSalary;
            var hitlaiTraining = trainingEmployees * hitlaiTrainingCost;
            var hitlaiTotal = hitlaiLicense + hitlaiIntegration + hitlaiTraining;

            var annualSavings = frankensteinTotal - hitlaiTotal;
            var threeYearSavings = annualSavings * 3;
            var savingsPercent = frankensteinTotal > 0 ? Math.round((annualSavings / frankensteinTotal) * 100) : 0;

            // Update results
            document.getElementById('total-frankenstein').textContent = formatCurrency(frankensteinTotal);
            document.getElementById('total-hitlai').textContent = formatCurrency(hitlaiTotal);
            document.getElementById('annual-savings').textContent = formatCurrency(annualSavings);
            document.getElementById('three-year-savings').textContent = '3-year savings: ' + formatCurrency(threeYearSavings) + ' (' + savingsPercent + '% reduction)';

            // Build breakdown
            var breakdownHTML = '';
            var rows = [
                ['RPA (licenses + platform + maintenance FTEs)', rpaTotal, 0],
                ['AI Governance (platform + implementation)', govTotal, 0],
                ['AI Assistant (Copilot/Gemini licenses + deployment)', copilotTotal, 0],
                ['Automation Platform (license + overage)', autoTotal, 0],
                ['Integration & Maintenance (FTEs + tools)', integrationTotal, hitlaiIntegration],
                ['Multi-Vendor Training', trainingTotal, hitlaiTraining],
                ['HitLai Platform License', 0, hitlaiLicense]
            ];

            for (var i = 0; i < rows.length; i++) {
                breakdownHTML += '<tr><td>' + rows[i][0] + '</td>';
                breakdownHTML += '<td class="amount">' + (rows[i][1] > 0 ? formatCurrency(rows[i][1]) : '—') + '</td>';
                breakdownHTML += '<td class="hitlai-amount">' + (rows[i][2] > 0 ? formatCurrency(rows[i][2]) : (rows[i][0] === 'HitLai Platform License' ? formatCurrency(hitlaiLicense) : 'Included')) + '</td>';
                breakdownHTML += '</tr>';
            }

            breakdownHTML += '<tr><td>TOTAL</td>';
            breakdownHTML += '<td class="amount">' + formatCurrency(frankensteinTotal) + '</td>';
            breakdownHTML += '<td class="hitlai-amount">' + formatCurrency(hitlaiTotal) + '</td>';
            breakdownHTML += '</tr>';

            document.getElementById('breakdown-body').innerHTML = breakdownHTML;
            document.getElementById('results').style.display = 'block';
            document.getElementById('cta-section').style.display = 'block';
        }

        function calculateAndScroll() {
            calculate();
            document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // CSP-clean: replaces the inline onclick="calculateAndScroll()" handler.
        var calcBtn = document.getElementById('calc-submit');
        if (calcBtn) {
            calcBtn.addEventListener('click', calculateAndScroll);
        }
