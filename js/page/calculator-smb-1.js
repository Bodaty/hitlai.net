function smbMoney(n) {
    return '$' + Math.round(n).toLocaleString();
}

function smbNum(id) {
    var el = document.getElementById(id);
    var v = parseFloat(el && el.value);
    return isFinite(v) && v > 0 ? v : 0;
}

function smbToday() {
    var subs  = smbNum('smb-subs');
    var hands = smbNum('smb-hands');
    var rate  = smbNum('smb-rate');
    return {
        subs: subs, hands: hands, rate: rate,
        subsYear:  subs * 12,
        handsYear: hands * 52 * rate,
        total:     subs * 12 + hands * 52 * rate,
        waiting:   smbNum('smb-late') * 12 * smbNum('smb-wait')
    };
}

function smbRows(id, rows) {
    document.getElementById(id).innerHTML = rows.map(function (r) {
        return '<tr><td>' + r[0] + '</td><td style="text-align:right">' + r[1] + '</td></tr>';
    }).join('');
}

function smbCalculate() {
    var t = smbToday();
    document.getElementById('smb-today').textContent   = smbMoney(t.total);
    document.getElementById('smb-waiting').textContent = Math.round(t.waiting).toLocaleString() + ' hrs';

    smbRows('smb-breakdown', [
        ['Subscriptions, ' + smbMoney(t.subs) + ' a month', smbMoney(t.subsYear)],
        ['Moving information by hand, ' + t.hands + ' hrs a week at ' + smbMoney(t.rate) + ' an hour',
         smbMoney(t.handsYear)],
        ['<strong>What your stack costs you a year</strong>', '<strong>' + smbMoney(t.total) + '</strong>']
    ]);

    document.getElementById('results').style.display = 'block';
    var c = document.getElementById('compare-results');
    if (c && c.style.display === 'block') { smbCompare(); }
}

function smbCompare() {
    var t = smbToday();
    var plan  = smbNum('smb-plan');
    var keep  = smbNum('smb-keep');
    var after = smbNum('smb-after');

    var planYear  = plan * 12;
    var keepYear  = keep * 12;
    var afterYear = after * 52 * t.rate;
    var platTotal = planYear + keepYear + afterYear;
    var diff      = t.total - platTotal;
    var hoursBack = Math.max(0, t.hands - after) * 52;

    document.getElementById('smb-today-2').textContent  = smbMoney(t.total);
    document.getElementById('smb-platform').textContent = smbMoney(platTotal);

    var label  = document.getElementById('smb-diff-label');
    var amount = document.getElementById('smb-diff');
    var sub    = document.getElementById('smb-diff-sub');

    if (diff > 0) {
        label.textContent  = 'What stops going out the door';
        amount.textContent = smbMoney(diff) + ' a year';
        sub.textContent    = Math.round(hoursBack).toLocaleString() + ' hours a year back, and ' +
                             smbMoney(diff / 12) + ' a month that was buying nothing.';
    } else if (diff === 0) {
        label.textContent  = 'It comes out even';
        amount.textContent = smbMoney(0);
        sub.textContent    = 'The money is a wash. The ' + Math.round(hoursBack).toLocaleString() +
                             ' hours a year are the whole return.';
    } else {
        label.textContent  = 'It would cost you more';
        amount.textContent = smbMoney(Math.abs(diff)) + ' a year more';
        sub.textContent    = 'That is a real answer. Keep these figures and run it again when the ' +
                             'hand-work grows.';
    }

    smbRows('smb-breakdown-2', [
        ['Platform plan',                               smbMoney(planYear)],
        ['Subscriptions you keep',                      smbMoney(keepYear)],
        ['Hand-work left, ' + after + ' hrs a week',    smbMoney(afterYear)],
        ['<strong>On one platform</strong>',            '<strong>' + smbMoney(platTotal) + '</strong>']
    ]);

    document.getElementById('compare-results').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    var calc = document.getElementById('calc-submit');
    if (calc) { calc.addEventListener('click', smbCalculate); }
    var cmp = document.getElementById('calc-compare');
    if (cmp) { cmp.addEventListener('click', smbCompare); }

    document.querySelectorAll('#smb-subs, #smb-hands, #smb-rate, #smb-late, #smb-wait')
        .forEach(function (el) {
            el.addEventListener('change', function () {
                if (document.getElementById('results').style.display === 'block') { smbCalculate(); }
            });
        });
    document.querySelectorAll('#smb-plan, #smb-keep, #smb-after')
        .forEach(function (el) {
            el.addEventListener('change', function () {
                if (document.getElementById('compare-results').style.display === 'block') { smbCompare(); }
            });
        });
});
