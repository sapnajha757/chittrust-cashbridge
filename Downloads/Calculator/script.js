class Calculator {
    constructor(displayElement, historyElement) {
        this.displayElement = displayElement;
        this.historyElement = historyElement;
        this.clear();
    }

    clear() {
        this.expression = '';
        this.shouldReset = false;
        this.updateDisplay();
    }

    delete() {
        if (this.shouldReset) {
            this.clear();
            return;
        }
        this.expression = this.expression.toString().slice(0, -1);
        this.updateDisplay();
    }

    appendSymbol(symbol) {
        if (this.shouldReset) {
            // If starting a new number after result, clear unless symbol is an operator
            if (['+', '-', '*', '/', '%'].includes(symbol)) {
                this.shouldReset = false;
            } else {
                this.expression = '';
                this.shouldReset = false;
            }
        }

        const lastChar = this.expression.slice(-1);
        const isOperator = ['+', '-', '*', '/', '%'].includes(symbol);
        const lastIsOperator = ['+', '-', '*', '/', '%'].includes(lastChar);

        // Prevent double operators except '-' for negative numbers
        if (isOperator && lastIsOperator) {
            if (symbol === '-' && lastChar !== '-') {
                this.expression += symbol;
            } else {
                this.expression = this.expression.slice(0, -1) + symbol;
            }
        } else {
            this.expression += symbol;
        }

        this.updateDisplay();
    }

    compute() {
        if (!this.expression) return;

        let formattedExpr = this.expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');

        try {
            // Sanitize and evaluate expression safely
            // Replace percentages like 50% with (50/100)
            formattedExpr = formattedExpr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

            // Validate expression characters
            if (/[^0-9\+\-\*\/\%\(\)\.]/.test(formattedExpr)) {
                throw new Error("Invalid expression");
            }

            const result = Function(`"use strict"; return (${formattedExpr})`)();

            if (!isFinite(result)) {
                alert("Cannot divide by zero!");
                this.clear();
                return;
            }

            const roundedResult = (Math.round(result * 1e12) / 1e12).toString();
            this.historyElement.innerText = `${this.expression} =`;
            this.expression = roundedResult;
            this.shouldReset = true;
            this.updateDisplay();
        } catch (err) {
            this.historyElement.innerText = 'Error';
            setTimeout(() => {
                if (this.historyElement.innerText === 'Error') {
                    this.historyElement.innerText = '';
                }
            }, 1500);
        }
    }

    updateDisplay() {
        this.displayElement.value = this.expression || '0';
    }
}

const display = document.getElementById('display');
const history = document.getElementById('history');
const calculator = new Calculator(display, history);

const buttonsContainer = document.querySelector('.buttons');

buttonsContainer.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const action = target.dataset.action;
    const value = target.dataset.value;

    if (!action && value) {
        calculator.appendSymbol(value);
    } else if (action === 'operator') {
        calculator.appendSymbol(value);
    } else if (action === 'clear') {
        calculator.clear();
    } else if (action === 'delete') {
        calculator.delete();
    } else if (action === 'calculate') {
        calculator.compute();
    }
});

// Full keyboard support with visual press feedback
document.addEventListener('keydown', (e) => {
    let keySelector = null;

    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        calculator.appendSymbol(e.key);
        keySelector = `button[data-value="${e.key}"]`;
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%') {
        calculator.appendSymbol(e.key);
        keySelector = `button[data-value="${e.key}"]`;
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
        keySelector = `button[data-action="calculate"]`;
    } else if (e.key === 'Backspace') {
        calculator.delete();
        keySelector = `button[data-action="delete"]`;
    } else if (e.key === 'Escape') {
        calculator.clear();
        keySelector = `button[data-action="clear"]`;
    }

    if (keySelector) {
        const btn = document.querySelector(keySelector);
        if (btn) {
            btn.classList.add('pressed');
            setTimeout(() => btn.classList.remove('pressed'), 120);
        }
    }
});