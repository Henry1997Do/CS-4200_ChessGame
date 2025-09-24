/***********************
 * Board / Heuristic  *
 ***********************/
class BoardState {
    // queens[row] = col (0..7). For partial states, only some rows have queens.
    constructor(queens = [], gCost = 0, parent = null) {
        this.size = 8;
        this.queens = [...queens];
        this.gCost = gCost;  // Cost from start (number of moves)
        this.parent = parent; // For path reconstruction
        this.hCost = this.calculateHeuristic(); // h(n)
        this.fCost = this.gCost + this.hCost;   // f(n) = g(n) + h(n)
    }
  
    // Heuristic: number of attacking pairs (column, diagonal)
    calculateHeuristic() {
        let attackingPairs = 0;
        const placedQueens = this.queens.map((col, row) => ({ row, col }))
                                       .filter(item => item.col !== undefined);
        
        for (let i = 0; i < placedQueens.length; i++) {
            for (let j = i + 1; j < placedQueens.length; j++) {
                const a = placedQueens[i], b = placedQueens[j];
                
                // Check column conflict
                const sameCol = a.col === b.col;
                // Check diagonal conflict
                const sameDiag =
                    Math.abs(a.row - b.row) === Math.abs(a.col - b.col);
                
                if (sameCol || sameDiag) attackingPairs++;
            }
        }
        return attackingPairs;
    }
  
    // Generate next possible states by placing a queen in the next row
    expand() {
        const nextRow = this.queens.length;
        if (nextRow >= this.size) return [];
        
        const children = [];
        for (let col = 0; col < this.size; col++) {
            let conflict = false;
            for (let r = 0; r < nextRow; r++) {
                const c = this.queens[r];
                if (c === col || Math.abs(r - nextRow) === Math.abs(c - col)) {
                    conflict = true;
                    break;
                }
            }
            if (!conflict) {
                const newQueens = [...this.queens];
                newQueens[nextRow] = col;
                children.push(new BoardState(newQueens, this.gCost + 1, this));
            }
        }
        return children;
    }
  
    // For rendering: get positions of queens
    getQueenPositions() {
        return this.queens.map((c, r) => (c !== undefined ? { row: r, col: c } : null)).filter(Boolean);
    }
}

/************************
 * A* step-by-step core *
 ************************/
class AStarStepper {
    constructor(size = 8) {
        this.size = size;
        this.reset();
    }
    
    reset() {
        this.openSet = [new BoardState([], 0, null)]; // start with empty board
        this.closedSet = [];
        this.solved = false;
        this.failed = false;
        this.stepCount = 0;
    }
    
    getState() {
        // Return the best (lowest f) in openSet
        this.openSet.sort((a, b) => a.fCost - b.fCost || a.hCost - b.hCost);
        return this.openSet[0] || null;
    }
    
    step() {
        if (this.solved || this.failed) {
            return { kind: this.solved ? 'solution' : 'failed', message: '' };
        }
        
        if (this.openSet.length === 0) {
            this.failed = true;
            return { kind: 'failed', message: 'No solution found.' };
        }
        
        // Pick node with smallest f
        this.openSet.sort((a, b) => a.fCost - b.fCost || a.hCost - b.hCost);
        const current = this.openSet.shift();
        this.closedSet.push(current);
        this.stepCount++;
        
        // Check goal: 8 queens placed and h=0
        if (current.queens.length === this.size && current.hCost === 0) {
            this.solved = true;
            return { kind: 'solution', message: `Step ${this.stepCount}: Solution found!` };
        }
        
        // Expand children
        const children = current.expand();
        if (children.length === 0 && current.queens.length < this.size) {
            // dead end
            if (this.openSet.length === 0) {
                this.failed = true;
                return { kind: 'failed', message: `Step ${this.stepCount}: No solution found.` };
            } else {
                return { kind: 'exploring', message: `Step ${this.stepCount}: Dead end; exploring alternatives.` };
            }
        }
        
        // Push children
        for (const ch of children) {
            // skip duplicates already in closed
            const dupClosed = this.closedSet.find(s =>
                JSON.stringify(s.queens) === JSON.stringify(ch.queens));
            if (!dupClosed) {
                this.openSet.push(ch);
            }
        }
        
        const qCount = current.queens.filter(q => q !== undefined).length + 1;
        return { kind: 'exploring', message: `Step ${this.stepCount}: Explored ${qCount - 1}-queen state. f(n)=${current.fCost} [g=${current.gCost}, h=${current.hCost}]. Next: place in row ${qCount}` };
    }
}

/****************
 * UI           *
 ****************/
class GameUI {
    constructor() {
        this.boardSize = 8;
        this.board = document.getElementById('board');
        this.nextBtn = document.getElementById('nextBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.status = document.getElementById('status');
        this.stateVectorEl = document.getElementById('stateVector');
        
        // NEW: Auto-play & Speed buttons
        this.autoBtn = document.getElementById('autoBtn');
        this.speedBtn = document.getElementById('speedBtn');

        // Autoplay state
        this.autoplayTimer = null;
        this.isAutoPlaying = false;

        // Speed options: 2x, 4x, 8x (default 2x)
        this.speedOptions = [2, 4, 8];
        this.speedIndex = 0; // corresponds to 2x
        
        if (!this.stateVectorEl) {
            console.warn('State vector element #stateVector not found in DOM');
        }

        this.aStar = new AStarStepper(this.boardSize);
        this.currentState = this.aStar.getState();
        this.lastExploredRow = null; // track last explored row for highlighting
        
        // NEW: initialize speed button label
        if (this.speedBtn) this.updateSpeedButton();

        this.drawBoard();
        this.render();
        this.bindEvents();
        this.updateStatus('A* Search initialized. Click "Next Step" to begin exploring states.');
    }

    // ===== NEW: Autoplay helpers =====
    updateSpeedButton() {
        if (this.speedBtn) {
            this.speedBtn.textContent = `Speed: ${this.speedOptions[this.speedIndex]}x`;
        }
    }

    getDelayMs() {
        const base = 1000; // 1 second baseline
        const mult = this.speedOptions[this.speedIndex]; // e.g., 2 => 500ms
        return Math.max(50, Math.floor(base / mult));
    }

    startAuto() {
        if (this.isAutoPlaying) return;
        this.isAutoPlaying = true;
        if (this.autoBtn) this.autoBtn.textContent = 'Stop';
        if (this.autoplayTimer) clearInterval(this.autoplayTimer);
        this.autoplayTimer = setInterval(() => {
            // If next is disabled (solved/failed), stop
            if (this.nextBtn.disabled) {
                this.stopAuto();
                return;
            }
            this.nextBtn.click(); // reuse existing logic
        }, this.getDelayMs());
    }

    stopAuto() {
        this.isAutoPlaying = false;
        if (this.autoplayTimer) clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
        if (this.autoBtn) this.autoBtn.textContent = 'Auto';
    }

    toggleAuto() {
        if (this.isAutoPlaying) this.stopAuto();
        else this.startAuto();
    }

    bindEvents() {
        this.nextBtn.addEventListener('click', () => {
            const result = this.aStar.step();
            this.currentState = this.aStar.getState();

            if (result.kind === 'solution') {
                this.updateStatus(result.message);
                this.lastExploredRow = null;
                this.nextBtn.disabled = true;
                this.stopAuto(); // NEW: stop auto when solved
            } else if (result.kind === 'failed') {
                this.updateStatus(result.message);
                this.lastExploredRow = null;
                this.nextBtn.disabled = true;
                this.stopAuto(); // NEW: stop auto on failure
            } else if (result.kind === 'exploring') {
                // Highlight the row that contains the most recently placed queen
                const placedQueens = this.currentState.queens.filter(q => q !== undefined).length;
                this.lastExploredRow = placedQueens > 0 ? placedQueens - 1 : null;
                this.updateStatus(result.message);
            }
            
            this.render();
        });

        this.resetBtn.addEventListener('click', () => {
            this.stopAuto(); // NEW: stop auto on reset
            this.aStar.reset();
            this.currentState = this.aStar.getState();
            this.lastExploredRow = null;
            this.nextBtn.disabled = false;

            this.updateStatus('A* Search initialized. Click "Next Step" to begin exploring states.');
            this.render();
        });

        // NEW: Auto button toggles autoplay
        if (this.autoBtn) {
            this.autoBtn.addEventListener('click', () => this.toggleAuto());
        }

        // NEW: Speed button cycles 2x -> 4x -> 8x
        if (this.speedBtn) {
            this.speedBtn.addEventListener('click', () => {
                this.speedIndex = (this.speedIndex + 1) % this.speedOptions.length;
                this.updateSpeedButton();
                if (this.isAutoPlaying) {
                    this.stopAuto();
                    this.startAuto();
                }
            });
        }
    }

    updateStatus(msg) {
        if (this.status) this.status.textContent = msg;
    }

    drawBoard() {
        if (!this.board) return;
        this.board.innerHTML = '';
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const sq = document.createElement('div');
                sq.className = 'square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
                sq.dataset.row = r;
                sq.dataset.col = c;
                this.board.appendChild(sq);
            }
        }
    }

    render() {
        if (!this.board) return;
        // clear existing queens + highlights
        [...this.board.querySelectorAll('.queen')].forEach(q => q.remove());
        [...this.board.querySelectorAll('.highlight')].forEach(h => h.classList.remove('highlight'));
        
        // render queens
        const positions = this.currentState.getQueenPositions();
        for (const {row, col} of positions) {
            const idx = row * this.boardSize + col;
            const cell = this.board.children[idx];
            const q = document.createElement('div');
            q.className = 'queen';
            q.textContent = '♕';
            cell.appendChild(q);
        }

        // highlight current row (if any)
        if (this.lastExploredRow !== null) {
            for (let c = 0; c < this.boardSize; c++) {
                const idx = this.lastExploredRow * this.boardSize + c;
                this.board.children[idx].classList.add('highlight');
            }
        }

        this.updateStateVector();
    }

    updateStateVector() {
        if (!this.stateVectorEl) return;
        
        const vec = this.currentState.queens;
        const gCost = this.currentState.gCost;
        const hCost = this.currentState.hCost;
        const fCost = this.currentState.fCost;
        
        // Show A* evaluation function values
        this.stateVectorEl.innerHTML = `
            <div class="astar-info">
                <div class="eval-function">
                    <strong>A* Evaluation Function:</strong><br>
                    f(n) = g(n) + h(n) = ${gCost} + ${hCost} = <span class="f-cost">${fCost}</span>
                </div>
                <div class="cost-breakdown">
                    <span class="g-cost">g(n) = ${gCost}</span> (moves made)<br>
                    <span class="h-cost">h(n) = ${hCost}</span> (attacking pairs)
                </div>
            </div>
        `;
        
        // Show state vector
        for (let i = 0; i < this.boardSize; i++) {
            const li = document.createElement('li');
            const idx = document.createElement('span');
            idx.className = 'idx';
            idx.textContent = `queens[${i}]:`;
            const val = document.createElement('span');
            val.className = 'val';
            val.textContent = vec[i] !== undefined ? ` ${String.fromCharCode(65 + vec[i])}` : ' -';
            
            // Highlight the most recently considered row
            if (i === this.lastExploredRow) {
                li.classList.add('recent-move');
            }
            
            li.appendChild(idx);
            li.appendChild(val);
            this.stateVectorEl.appendChild(li);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new GameUI());
