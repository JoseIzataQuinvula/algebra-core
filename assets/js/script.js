// Carregar dados assim que a página abrir
window.onload = function() {
    const ultimaTela = localStorage.getItem('telaAtiva') || 'operacoes';
    trocar(ultimaTela);

    // Recuperar históricos salvos
    ['histBasico', 'hist1', 'hist2'].forEach(id => {
        const salvo = localStorage.getItem(id);
        if (salvo) document.getElementById(id).innerHTML = salvo;
    });
};

function trocar(id) {
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    localStorage.setItem('telaAtiva', id); // Salva a aba atual
}

function limpar(id) {
    document.getElementById(id).innerHTML = "";
    localStorage.removeItem(id); // Apaga do histórico permanente
}

function adicionarCard(containerId, msg, ehErro = false) {
    const container = document.getElementById(containerId);
    const card = document.createElement('div');
    card.className = ehErro ? 'card erro' : 'card';
    card.innerText = msg;
    container.prepend(card);
    
    // Salva o estado atual do HTML do histórico
    localStorage.setItem(containerId, container.innerHTML);
}

// 1. Operações
function calcBasico() {
    const v1 = document.getElementById('n1').value;
    const v2 = document.getElementById('n2').value;
    const op = document.getElementById('op').value;

    if (v1 === "" || v2 === "") {
        adicionarCard('histBasico', "Erro: Preencha todos os campos.", true);
        return;
    }

    const n1 = parseFloat(v1);
    const n2 = parseFloat(v2);
    let r;

    if (op === '/' && n2 === 0) {
        adicionarCard('histBasico', `${n1} / 0 = Erro: Divisão por zero`, true);
        return;
    }

    if (op === '+') r = n1 + n2;
    if (op === '-') r = n1 - n2;
    if (op === '*') r = n1 * n2;
    if (op === '/') r = n1 / n2;

    adicionarCard('histBasico', `${n1} ${op} ${n2} = ${r}`);
}

// 2. 1º Grau
function resolver1() {
    const va = document.getElementById('a1').value;
    const vb = document.getElementById('b1').value;
    if (va === "" || vb === "") {
        adicionarCard('hist1', "Erro: Insira valores de a e b.", true);
        return;
    }
    const a = parseFloat(va);
    const b = parseFloat(vb);

    if (a === 0) {
        adicionarCard('hist1', `0x + ${b} = 0 | Erro: 'a' não pode ser 0`, true);
    } else {
        adicionarCard('hist1', `${a}x + ${b} = 0 | x = ${(-b / a).toFixed(2)}`);
    }
}

// 3. 2º Grau
function resolver2() {
    const va = document.getElementById('a2').value;
    const vb = document.getElementById('b2').value;
    const vc = document.getElementById('c2').value;

    if (va === "" || vb === "" || vc === "") {
        adicionarCard('hist2', "Erro: Preencha a, b e c.", true);
        return;
    }

    const a = parseFloat(va);
    const b = parseFloat(vb);
    const c = parseFloat(vc);

    if (a === 0) {
        adicionarCard('hist2', "Erro: 'a' não pode ser zero em equações de 2º grau.", true);
        return;
    }

    const delta = (b * b) - (4 * a * c);
    if (delta < 0) {
        adicionarCard('hist2', `Δ Negativo (${delta}) | Sem raízes reais.`, true);
    } else {
        const x1 = (-b + Math.sqrt(delta)) / (2 * a);
        const x2 = (-b - Math.sqrt(delta)) / (2 * a);
        adicionarCard('hist2', `${a}x² + ${b}x + ${c} = 0 | x1: ${x1.toFixed(2)} | x2: ${x2.toFixed(2)}`);
    }
}