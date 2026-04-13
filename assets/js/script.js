let expression = "";
let currentInput = "";
let history = JSON.parse(localStorage.getItem('calc-history')) || [];

// Inicialização
window.onload = () => {
    updateHistoryUI();
};

let currentMode = 'calc';
let solverStep = 0; // 0: A, 1: B, 2: C
let solverData = { a: "", b: "", c: "" };

function updateDisplay() {
    const exprEl = document.getElementById('expression');
    const resEl = document.getElementById('result');
    const actionBtn = document.getElementById('btn-action');

    if (currentMode === 'calc') {
        exprEl.innerText = expression;
        resEl.innerText = currentInput || "0";
        if (actionBtn) actionBtn.innerText = "=";
    } else {
        const varLabel = solverStep === 0 ? "A" : (solverStep === 1 ? "B" : "C");
        exprEl.innerText = `VARIAVEL [${varLabel}]`; // Exibição mais industrial
        resEl.innerText = (solverData[varLabel.toLowerCase()] || "") + "_";

        if (actionBtn) {
            const isLastStep = (currentMode === 'eq1' && solverStep === 1) || 
                              (currentMode === 'eq2' && solverStep === 2);
            actionBtn.innerText = isLastStep ? "=" : "AVANÇAR";
        }
    }
}

function addChar(char) {
    if (currentMode !== 'calc') {
        const key = solverStep === 0 ? 'a' : (solverStep === 1 ? 'b' : 'c');
        if (char === "." && solverData[key].includes(".")) return;
        solverData[key] += char;
        updateDisplay();
        return;
    }
    
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
    if (currentMode !== 'calc') {
        const key = solverStep === 0 ? 'a' : (solverStep === 1 ? 'b' : 'c');
        solverData[key] = solverData[key].slice(0, -1);
        updateDisplay();
        return;
    }
    if (currentInput !== "") {
        currentInput = currentInput.slice(0, -1);
    } else if (expression !== "") {
        expression = expression.trim().slice(0, -1);
    }
    updateDisplay();
}

function calculate() {
    if (currentMode !== 'calc') {
        // Lógica de progressão do Solver
        if (currentMode === 'eq1') {
            if (solverStep === 0) {
                if (solverData.a === "" || parseFloat(solverData.a) === 0) return alert("A não pode ser zero");
                solverStep = 1;
            } else {
                executeSolver1();
                solverStep = 0; // Reinicia o ciclo na mesma equação
                solverData = { a: "", b: "", c: "" };
            }
        } else if (currentMode === 'eq2') {
            if (solverStep === 0) {
                if (solverData.a === "" || parseFloat(solverData.a) === 0) return alert("A não pode ser zero");
                solverStep = 1;
            } else if (solverStep === 1) {
                solverStep = 2;
            } else {
                executeSolver2();
                solverStep = 0; // Reinicia o ciclo na mesma equação
                solverData = { a: "", b: "", c: "" };
            }
        }
        updateDisplay();
        return;
    }
    
    let fullExpression = expression + currentInput;
    if (fullExpression === "" || fullExpression.trim() === "") return;

    try {
        // Sanitizar e preparar para eval (sem auto-correção)
        let evalExpr = fullExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');

        const result = eval(evalExpr);
        
        // Verificar se o resultado é válido (não NaN ou Infinity)
        if (isNaN(result) || !isFinite(result)) {
            throw new Error("Invalid Result");
        }

        const formattedResult = Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, "");
        
        saveHistory(`${fullExpression} = ${formattedResult}`);
        
        expression = "";
        currentInput = formattedResult.toString();
        updateDisplay();
    } catch (e) {
        // Mostra ERROR e para por aqui, como as máquinas antigas
        document.getElementById('result').innerText = "ERROR";
    }
}

// Alternância de Modos
function setMode(mode) {
    const btns = document.querySelectorAll('.mode-btn');
    btns.forEach(b => b.classList.remove('active'));

    currentMode = mode;
    solverStep = 0;
    solverData = { a: "", b: "", c: "" };
    expression = "";
    currentInput = "";

    if (mode === 'calc') {
        btns[0].classList.add('active');
    } else if (mode === 'eq1') {
        btns[1].classList.add('active');
    } else if (mode === 'eq2') {
        btns[2].classList.add('active');
    }
    updateDisplay();
}

function renderSolver1() {
    document.getElementById('solver-panel').innerHTML = `
        <h3 style="font-size: 14px; margin-bottom: 10px;">Equação do 1º Grau: ax + b = 0</h3>
        <div class="input-group">
            <label>a</label>
            <input type="text" id="a1" onfocus="activeInputId='a1'" placeholder="Toque aqui e use o teclado">
        </div>
        <div class="input-group">
            <label>b</label>
            <input type="text" id="b1" onfocus="activeInputId='b1'" placeholder="Toque aqui e use o teclado">
        </div>
    `;
    activeInputId = 'a1'; // Foco padrão
}

function renderSolver2() {
    document.getElementById('solver-panel').innerHTML = `
        <h3 style="font-size: 14px; margin-bottom: 10px;">Equação do 2º Grau: ax² + bx + c = 0</h3>
        <div class="input-group">
            <label>a</label>
            <input type="text" id="a2" onfocus="activeInputId='a2'" placeholder="Coeficiente a">
        </div>
        <div class="input-group">
            <label>b</label>
            <input type="text" id="b2" onfocus="activeInputId='b2'" placeholder="Coeficiente b">
        </div>
        <div class="input-group">
            <label>c</label>
            <input type="text" id="c2" onfocus="activeInputId='c2'" placeholder="Coeficiente c">
        </div>
    `;
    activeInputId = 'a2'; // Foco padrão
}

function executeSolver1() {
    const a = parseFloat(solverData.a);
    const b = parseFloat(solverData.b);

    const x = -b / a;
    const res = `x = ${x.toFixed(2)}`;
    saveHistory(`${a}x + ${b} = 0 → ${res}`);
    document.getElementById('result').innerText = res;
}

function executeSolver2() {
    const a = parseFloat(solverData.a);
    const b = parseFloat(solverData.b);
    const c = parseFloat(solverData.c);

    const delta = (b * b) - (4 * a * c);
    let res;
    if (delta < 0) {
        res = "Sem raízes reais";
    } else {
        const x1 = (-b + Math.sqrt(delta)) / (2 * a);
        const x2 = (-b - Math.sqrt(delta)) / (2 * a);
        res = `x1:${x1.toFixed(2)} | x2:${x2.toFixed(2)}`;
    }
    saveHistory(`${a}x² + ${b}x + ${c} = 0 → ${res}`);
    document.getElementById('result').innerText = res;
}

// Histórico
function toggleHistory() {
    // Agora o histórico está embutido, mas podemos manter a função se quisermos esconder/mostrar
    const sb = document.querySelector('.history-container-embedded');
    sb.style.display = sb.style.display === 'none' ? 'flex' : 'none';
}

function saveHistory(entry) {
    history.unshift(entry);
    if (history.length > 20) history.pop();
    localStorage.setItem('calc-history', JSON.stringify(history));
    updateHistoryUI();
}

function updateHistoryUI() {
    const list = document.getElementById('history-list-embedded');
    if (!list) return;
    
    list.innerHTML = history.length ? "" : "<p style='color: var(--text-secondary); font-size: 13px; text-align: center; margin-top: 20px;'>Sem atividade recente</p>";
    
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = "history-item";
        div.style.padding = "10px";
        div.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
        div.style.fontSize = "13px";
        div.style.fontFamily = "monospace";
        div.style.color = "var(--text-secondary)";
        div.innerText = item;
        list.appendChild(div);
    });
}

function clearHistory() {
    if (confirm("Deseja limpar o histórico?")) {
        history = [];
        localStorage.removeItem('calc-history');
        updateHistoryUI();
    }
}