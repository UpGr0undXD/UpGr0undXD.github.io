// ============= 配置和工具函数 =============

// 是否使用Python后端（设置为true时调用后端API）
const USE_PYTHON_BACKEND = false;
const BACKEND_URL = 'http://localhost:5000/api';

// 显示结果
function showResult(elementId, result, isError = false) {
    const resultBox = document.getElementById(elementId);
    resultBox.innerHTML = result;
    resultBox.classList.add('show');
    if (isError) {
        resultBox.classList.remove('success');
        resultBox.classList.add('error');
    } else {
        resultBox.classList.remove('error');
        resultBox.classList.add('success');
    }
}

// 清空结果
function clearResult(elementId) {
    const resultBox = document.getElementById(elementId);
    resultBox.innerHTML = '';
    resultBox.classList.remove('show', 'success', 'error');
}

// 格式化数字（去除过多小数位）
function formatNumber(num, decimals = 4) {
    if (Number.isInteger(num)) return num.toString();
    return parseFloat(num.toFixed(decimals)).toString();
}

// ============= 一元一次方程求解 =============
// ax + b = c  =>  x = (c - b) / a

function solveLinear() {
    clearResult('linear-result');
    
    let a = parseFloat(document.getElementById('linear-a').value);
    let b = parseFloat(document.getElementById('linear-b').value);
    let c = parseFloat(document.getElementById('linear-c').value);
    
    // 检查是否提供了系数，如果没有则尝试解析输入字符串
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        const input = document.getElementById('linear-input').value.trim();
        if (input) {
            const parsed = parseLinearEquation(input);
            if (parsed) {
                a = parsed.a;
                b = parsed.b;
                c = parsed.c;
            } else {
                showResult('linear-result', 
                    '<h3>❌ 错误</h3><p>方程格式不正确。请使用格式：ax + b = c</p>', 
                    true);
                return;
            }
        } else {
            showResult('linear-result', 
                '<h3>❌ 错误</h3><p>请输入系数或方程表达式</p>', 
                true);
            return;
        }
    }
    
    if (USE_PYTHON_BACKEND) {
        // 调用Python后端
        fetch(`${BACKEND_URL}/linear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ a, b, c })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showResult('linear-result', `<h3>❌ ${data.error}</h3>`, true);
            } else {
                displayLinearResult(data.solution, a, b, c);
            }
        })
        .catch(err => showResult('linear-result', 
            `<h3>❌ 后端错误</h3><p>${err.message}</p>`, true));
    } else {
        // 本地JavaScript计算
        if (a === 0) {
            if (b === c) {
                showResult('linear-result', 
                    '<h3>✅ 无穷多解</h3><p>方程有无穷多个解（0x = 0）</p>');
            } else {
                showResult('linear-result', 
                    '<h3>❌ 无解</h3><p>方程没有解（0x = ' + (c - b) + '）</p>', true);
            }
        } else {
            const x = (c - b) / a;
            displayLinearResult(x, a, b, c);
        }
    }
}

function parseLinearEquation(input) {
    // 简单的方程解析器 (例如: "2x + 3 = 7")
    const match = input.match(/([+-]?\d*\.?\d*)\s*x\s*([+-]\s*\d+\.?\d*)\s*=\s*([+-]?\d+\.?\d*)/i);
    if (!match) return null;
    
    let a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
    let b = parseFloat(match[2].replace(/\s/g, ''));
    let c = parseFloat(match[3]);
    
    return { a, b, c };
}

function displayLinearResult(x, a, b, c) {
    const steps = `
        <h3>✅ 解答</h3>
        <div class="solution">x = ${formatNumber(x)}</div>
        <div class="steps">
            <strong>求解步骤：</strong>
            <ul>
                <li>原方程：${a}x + ${b} = ${c}</li>
                <li>移项：${a}x = ${c} - ${b}</li>
                <li>化简：${a}x = ${c - b}</li>
                <li>求解：x = ${c - b} / ${a}</li>
                <li>结果：x = ${formatNumber(x)}</li>
            </ul>
        </div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(102, 126, 234, 0.2); font-size: 12px; color: #999;">
            <strong>验证：</strong> ${a} × ${formatNumber(x)} + ${b} = ${formatNumber(a * x + b)}
        </div>
    `;
    showResult('linear-result', steps);
}

// ============= 一元二次方程求解 =============
// ax² + bx + c = 0

function solveQuadratic() {
    clearResult('quadratic-result');
    
    let a = parseFloat(document.getElementById('quad-a').value) || 1;
    let b = parseFloat(document.getElementById('quad-b').value) || 0;
    let c = parseFloat(document.getElementById('quad-c').value) || 0;
    
    if (USE_PYTHON_BACKEND) {
        // 调用Python后端
        fetch(`${BACKEND_URL}/quadratic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ a, b, c })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showResult('quadratic-result', `<h3>❌ ${data.error}</h3>`, true);
            } else {
                displayQuadraticResult(data.solutions, a, b, c, data.discriminant);
            }
        })
        .catch(err => showResult('quadratic-result', 
            `<h3>❌ 后端错误</h3><p>${err.message}</p>`, true));
    } else {
        // 本地JavaScript计算
        if (a === 0) {
            showResult('quadratic-result', 
                '<h3>❌ 错误</h3><p>二次项系数a不能为0，这不是二次方程</p>', true);
            return;
        }
        
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < 0) {
            showResult('quadratic-result', 
                `<h3>📊 无实数解</h3><p>判别式 Δ = ${formatNumber(discriminant)} < 0</p>
                <p>该方程有两个复数解（超出本工具范围）</p>`);
        } else if (discriminant === 0) {
            const x = -b / (2 * a);
            displayQuadraticResult([x, x], a, b, c, discriminant);
        } else {
            const sqrtDelta = Math.sqrt(discriminant);
            const x1 = (-b + sqrtDelta) / (2 * a);
            const x2 = (-b - sqrtDelta) / (2 * a);
            displayQuadraticResult([x1, x2], a, b, c, discriminant);
        }
    }
}

function displayQuadraticResult(solutions, a, b, c, discriminant) {
    let html = `
        <h3>✅ 解答</h3>
    `;
    
    if (discriminant < 0) {
        html += `<p>判别式 Δ = ${formatNumber(discriminant)} < 0，无实数解</p>`;
    } else if (solutions[0] === solutions[1]) {
        html += `
            <div class="solution">x = ${formatNumber(solutions[0])}</div>
            <p style="color: #999;">（重根）</p>
        `;
    } else {
        html += `
            <div class="solution">
                x₁ = ${formatNumber(solutions[0])}<br>
                x₂ = ${formatNumber(solutions[1])}
            </div>
        `;
    }
    
    html += `
        <div class="steps">
            <strong>求解步骤：</strong>
            <ul>
                <li>原方程：${a}x² + ${b}x + ${c} = 0</li>
                <li>判别式 Δ = b² - 4ac = ${b}² - 4(${a})(${c}) = ${formatNumber(discriminant)}</li>
    `;
    
    if (discriminant >= 0) {
        html += `
                <li>√Δ = √${formatNumber(discriminant)} = ${formatNumber(Math.sqrt(discriminant))}</li>
                <li>求根公式：x = (-b ± √Δ) / 2a</li>
                <li>x₁ = (${-b} + ${formatNumber(Math.sqrt(discriminant))}) / ${2*a} = ${formatNumber(solutions[0])}</li>
                <li>x₂ = (${-b} - ${formatNumber(Math.sqrt(discriminant))}) / ${2*a} = ${formatNumber(solutions[1])}</li>
        `;
    }
    
    html += `
            </ul>
        </div>
    `;
    
    showResult('quadratic-result', html);
}

// ============= 二元一次方程组求解 =============
// a₁x + b₁y = c₁
// a₂x + b₂y = c₂

function solveSystem() {
    clearResult('system-result');
    
    const a1 = parseFloat(document.getElementById('sys-a1').value);
    const b1 = parseFloat(document.getElementById('sys-b1').value);
    const c1 = parseFloat(document.getElementById('sys-c1').value);
    const a2 = parseFloat(document.getElementById('sys-a2').value);
    const b2 = parseFloat(document.getElementById('sys-b2').value);
    const c2 = parseFloat(document.getElementById('sys-c2').value);
    
    // 检查输入
    if ([a1, b1, c1, a2, b2, c2].some(isNaN)) {
        showResult('system-result', 
            '<h3>❌ 错误</h3><p>请输入所有系数</p>', true);
        return;
    }
    
    if (USE_PYTHON_BACKEND) {
        // 调用Python后端
        fetch(`${BACKEND_URL}/system`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ a1, b1, c1, a2, b2, c2 })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showResult('system-result', `<h3>❌ ${data.error}</h3>`, true);
            } else {
                displaySystemResult(data.x, data.y, a1, b1, c1, a2, b2, c2);
            }
        })
        .catch(err => showResult('system-result', 
            `<h3>❌ 后端错误</h3><p>${err.message}</p>`, true));
    } else {
        // 本地JavaScript计算 (克拉默法则)
        const det = a1 * b2 - a2 * b1;
        
        if (Math.abs(det) < 1e-10) {
            // 行列式为0，无唯一解或无解
            if (Math.abs(a1 * c2 - a2 * c1) < 1e-10 && Math.abs(b1 * c2 - b2 * c1) < 1e-10) {
                showResult('system-result', 
                    '<h3>✅ 无穷多解</h3><p>两个方程实际上是同一个方程</p>');
            } else {
                showResult('system-result', 
                    '<h3>❌ 无解</h3><p>方程组无解（矛盾方程组）</p>', true);
            }
        } else {
            const x = (c1 * b2 - c2 * b1) / det;
            const y = (a1 * c2 - a2 * c1) / det;
            displaySystemResult(x, y, a1, b1, c1, a2, b2, c2, det);
        }
    }
}

function displaySystemResult(x, y, a1, b1, c1, a2, b2, c2, det = null) {
    const html = `
        <h3>✅ 解答</h3>
        <div class="solution">
            x = ${formatNumber(x)}<br>
            y = ${formatNumber(y)}
        </div>
        <div class="steps">
            <strong>求解步骤（克拉默法则）：</strong>
            <ul>
                <li>方程1：${a1}x + ${b1}y = ${c1}</li>
                <li>方程2：${a2}x + ${b2}y = ${c2}</li>
                <li>系数行列式 D = ${a1} × ${b2} - ${a2} × ${b1} = ${formatNumber(det || (a1*b2 - a2*b1))}</li>
                <li>x = (${c1} × ${b2} - ${c2} × ${b1}) / D = ${formatNumber(c1*b2 - c2*b1)} / ${formatNumber(det || (a1*b2 - a2*b1))} = ${formatNumber(x)}</li>
                <li>y = (${a1} × ${c2} - ${a2} × ${c1}) / D = ${formatNumber(a1*c2 - a2*c1)} / ${formatNumber(det || (a1*b2 - a2*b1))} = ${formatNumber(y)}</li>
            </ul>
        </div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(102, 126, 234, 0.2); font-size: 12px; color: #999;">
            <strong>验证：</strong><br>
            方程1: ${a1} × ${formatNumber(x)} + ${b1} × ${formatNumber(y)} = ${formatNumber(a1*x + b1*y)} ✓<br>
            方程2: ${a2} × ${formatNumber(x)} + ${b2} × ${formatNumber(y)} = ${formatNumber(a2*x + b2*y)} ✓
        </div>
    `;
    showResult('system-result', html);
}

// ============= 选项卡切换 =============

document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // 隐藏所有选项卡
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // 移除所有按钮的active类
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // 显示选中的选项卡
            document.getElementById(tabName).classList.add('active');
            this.classList.add('active');
        });
    });
});

// ============= 回车键快速求解 =============

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('linear-a')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solveLinear();
    });
    document.getElementById('linear-b')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solveLinear();
    });
    document.getElementById('linear-c')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solveLinear();
    });
    document.getElementById('linear-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solveLinear();
    });
    
    document.getElementById('quad-a')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solveQuadratic();
    });
    document.getElementById('quad-b')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solveQuadratic();
    });
    document.getElementById('quad-c')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solveQuadratic();
    });
});
