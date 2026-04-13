let expression = "";
let currentInput = "";
let history = JSON.parse(localStorage.getItem('calc-history')) || [];

// Inicialização
window.onload = () => {
    updateHistoryUI();
};

function updateDisplay() {
    document.getElementById('expression').innerText = expression;
    document.getElementById('result').innerText = currentInput || "0";
}

function addChar(char) {
    if (currentInput === "0" && char !== ".") currentInput = "";
    currentInput += char;
    updateDisplay();
}

function addOp(op) {
    if (currentInput === "" && expression === "") return;
    
    // Se houver um resultado anterior no display, usa ele como base
    if (currentInput !== "") {
        expression += currentInput + " " + op + " ";
        currentInput = "";
    } else {
        // Substituir o último operador
        expression = expression.trim().slice(0, -1) + op + " ";
    }
    updateDisplay();
}

function addFunc(func) {
    expression += func;
    updateDisplay();
}

function clearDisplay() {
    expression = "";
    currentInput = "";
    updateDisplay();
}

function backspace() {
    if (currentInput !== "") {
        currentInput = currentInput.slice(0, -1);
    } else if (expression !== "") {
        expression = expression.trim().slice(0, -1);
    }
    updateDisplay();
}

function calculate() {
    let fullExpression = expression + currentInput;
    if (fullExpression === "") return;

    try {
        // Sanitizar e preparar para eval (ou usar algo mais seguro se necessário)
        // Substituindo símbolos visuais por operadores JS
        let evalExpr = fullExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');

        // Adicionar parênteses faltantes se necessário
        let openBrackets = (evalExpr.match(/\(/g) || []).length;
        let closeBrackets = (evalExpr.match(/\)/g) || []).length;
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
            evalExpr += ")";
        }

        const result = eval(evalExpr);
        const formattedResult = Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, "");
        
        saveHistory(`${fullExpression} = ${formattedResult}`);
        
        expression = "";
        currentInput = formattedResult.toString();
        updateDisplay();
    } catch (e) {
        document.getElementById('result').innerText = "Erro";
        setTimeout(clearDisplay, 1500);
    }
}

// Alternância de Modos
function setMode(mode) {
    const grid = document.getElementById('calc-grid');
    const solver = document.getElementById('solver-panel');
    const btns = document.querySelectorAll('.mode-btn');

    btns.forEach(b => b.classList.remove('active'));

    if (mode === 'calc') {
        grid.style.display = 'grid';
        solver.style.display = 'none';
        btns[0].classList.add('active');
    } else if (mode === 'eq1') {
        grid.style.display = 'none';
        solver.style.display = 'flex';
        btns[1].classList.add('active');
        renderSolver1();
    } else if (mode === 'eq2') {
        grid.style.display = 'none';
        solver.style.display = 'flex';
        btns[2].classList.add('active');
        renderSolver2();
    }
}

function renderSolver1() {
    document.getElementById('solver-panel').innerHTML = `
        <h3>Equação do 1º Grau</h3>
        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">ax + b = 0</p>
        <div class="input-group"><label>a</label><input type="number" id="a1" placeholder="Valor de a"></div>
        <div class="input-group"><label>b</label><input type="number" id="b1" placeholder="Valor de b"></div>
        <button class="solve-btn" onclick="executeSolver1()">Resolver</button>
    `;
}

function renderSolver2() {
    document.getElementById('solver-panel').innerHTML = `
        <h3>Equação do 2º Grau</h3>
        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">ax² + bx + c = 0</p>
        <div class="input-group"><label>a</label><input type="number" id="a2" placeholder="Valor de a"></div>
        <div class="input-group"><label>b</label><input type="number" id="b2" placeholder="Valor de b"></div>
        <div class="input-group"><label>c</label><input type="number" id="c2" placeholder="Valor de c"></div>
        <button class="solve-btn" onclick="executeSolver2()">Calcular Raízes</button>
    `;
}

function executeSolver1() {
    const a = parseFloat(document.getElementById('a1').value);
    const b = parseFloat(document.getElementById('b1').value);

    if (isNaN(a) || isNaN(b)) return alert("Preencha todos os campos");
    
    if (a === 0) {
        alert("O valor de 'a' não pode ser zero");
    } else {
        const x = -b / a;
        const res = `x = ${x.toFixed(2)}`;
        saveHistory(`${a}x + ${b} = 0 → ${res}`);
        document.getElementById('result').innerText = res;
    }
}

function executeSolver2() {
    const a = parseFloat(document.getElementById('a2').value);
    const b = parseFloat(document.getElementById('b2').value);
    const c = parseFloat(document.getElementById('c2').value);

    if (isNaN(a) || isNaN(b) || isNaN(c)) return alert("Preencha todos os campos");

    if (a === 0) return alert("'a' não pode ser zero");

    const delta = (b * b) - (4 * a * c);
    let res;
    if (delta < 0) {
        res = "Sem raízes reais";
    } else {
        const x1 = (-b + Math.sqrt(delta)) / (2 * a);
        const x2 = (-b - Math.sqrt(delta)) / (2 * a);
        res = `x1: ${x1.toFixed(2)} | x2: ${x2.toFixed(2)}`;
    }
    saveHistory(`${a}x² + ${b}x + ${c} = 0 → ${res}`);
    document.getElementById('result').innerText = res;
}

// Histórico
function toggleHistory() {
    const sb = document.getElementById('history-sidebar');
    sb.style.display = sb.style.display === 'block' ? 'none' : 'block';
}

function saveHistory(entry) {
    history.unshift(entry);
    if (history.length > 20) history.pop();
    localStorage.setItem('calc-history', JSON.stringify(history));
    updateHistoryUI();
}

function updateHistoryUI() {
    const list = document.getElementById('history-list');
    list.innerHTML = history.length ? "" : "<p style='color: var(--text-secondary); font-size: 14px; text-align: center; margin-top: 20px;'>Sem histórico</p>";
    history.forEach(item => {
        const div = document.createElement('div');
        div.style.padding = "12px";
        div.style.borderBottom = "1px solid var(--glass-border)";
        div.style.fontSize = "14px";
        div.innerText = item;
        list.appendChild(div);
    });
}

function clearHistory() {
    history = [];
    localStorage.removeItem('calc-history');
    updateHistoryUI();
}