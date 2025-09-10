/***********************
 * Board / Heuristic  *
 ***********************/
class BoardState {
    // queens[row] = col (0..7). For partial states, rows 0..k-1 exist.
    constructor(queens = []) {
      this.size = 8;
      this.queens = [...queens];
    }
  
    // Heuristic: number of attacking pairs (column, diagonal)
    calculateHeuristic() {
      let attackingPairs = 0;
      const q = this.queens.map((col, row) => ({ row, col })).filter(item => item.col !== undefined);
      for (let i = 0; i < q.length; i++) {
        for (let j = i + 1; j < q.length; j++) {
          const a = q[i], b = q[j];
          // Queens are in different rows by definition of the data structure
          const sameCol  = a.col === b.col;
          const sameDiag = Math.abs(a.row - b.row) === Math.abs(a.col - b.col);
          if (sameCol || sameDiag) attackingPairs++;
        }
      }
      return attackingPairs;
    }
  
    // Safe test against already-placed queens
    static isSafeGiven(queens, row, col) {
      for (let r = 0; r < row; r++) {
        const c = queens[r];
        if (c === col) return false; // same column
        if (Math.abs(r - row) === Math.abs(c - col)) return false; // diagonal
      }
      return true; // rows unique by construction
    }
  
    isGoal() {
      return this.queens.length === this.size && this.calculateHeuristic() === 0;
    }
}
  
/*****************************************
 * Step-by-step Backtracking Enumerator  *
 *****************************************/
class BacktrackingStepper {
    constructor(size = 8) {
        this.size = size;
        this.reset();
    }

    reset() {
        this.queens = [];               // placed cols per row
        this.row = 0;                   // next row to fill (0..size)
        this.nextCol = new Array(this.size).fill(0); // next col to try in each row
        this.colsUsed = new Set();
        this.diag1 = new Set();         // (r - c)
        this.diag2 = new Set();         // (r + c)
        this.done = false;
        this.solutionFound = false;
    }

    canPlace(row, col) {
        return (
            !this.colsUsed.has(col) &&
            !this.diag1.has(row - col) &&
            !this.diag2.has(row + col)
        );
    }

    place(row, col) {
        this.queens[row] = col;
        this.colsUsed.add(col);
        this.diag1.add(row - col);
        this.diag2.add(row + col);
    }

    remove(row) {
        const col = this.queens[row];
        this.colsUsed.delete(col);
        this.diag1.delete(row - col);
        this.diag2.delete(row + col);
        this.queens.length = row; // Truncate array to this row
    }

    // One atomic step (place/backtrack/solution/done)
    step() {
        if (this.done || this.solutionFound) {
            return { kind: this.solutionFound ? 'solution' : 'done' };
        }

        if (this.row === this.size) {
            this.solutionFound = true;
            this.done = true;
            return { kind: 'solution' };
        }

        let c = this.nextCol[this.row];
        while (c < this.size && !this.canPlace(this.row, c)) {
            c++;
        }
        this.nextCol[this.row] = c + 1;

        if (c < this.size) { // Found a safe spot
            this.place(this.row, c);
            const placedRow = this.row;
            this.row++;
            if (this.row < this.size) this.nextCol[this.row] = 0;
            return { kind: 'place', row: placedRow, col: c };
        }

        // No safe spot, need to backtrack
        if (this.row === 0) {
            this.done = true;
            return { kind: 'done' };
        }
        
        this.nextCol[this.row] = 0; // Reset next attempt for current row
        this.row--;
        this.remove(this.row);
        return { kind: 'backtrack', row: this.row };
    }

    getState() { return new BoardState([...this.queens]); }
}
  
/****************
 * UI       *
 ****************/
class GameUI {
    constructor() {
        this.boardSize = 8;
        this.board = document.getElementById('board');
        this.nextBtn = document.getElementById('nextBtn');
        this.resetBtn = document.getElementById('resetBtn');
        // Heuristic display is optional (it may not be present in the HTML)
        this.heuristicValue = document.getElementById('heuristicValue') || null;
        this.status = document.getElementById('status');
        this.stateVectorEl = document.getElementById('stateVector');
        if (!this.stateVectorEl) {
            console.warn('State vector element #stateVector not found in DOM');
        }

        this.currentState = new BoardState();
        this.lastPlayedRow = null; // track last row where a queen was placed
        this.backtracker = new BacktrackingStepper(this.boardSize);

        this.initBoard();
        this.bindEvents();
        this.render();
    }

    initBoard() {
        this.board.innerHTML = '';
        const tl = document.createElement('div');
        tl.className = 'row-label';
        this.board.appendChild(tl);

        for (let c = 0; c < this.boardSize; c++) {
            const label = document.createElement('div');
            label.className = 'column-label';
            label.textContent = String.fromCharCode(65 + c);
            this.board.appendChild(label);
        }

        for (let r = 0; r < this.boardSize; r++) {
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = r + 1;
            this.board.appendChild(rowLabel);

            for (let c = 0; c < this.boardSize; c++) {
                const sq = document.createElement('div');
                sq.className = `square ${ (r + c) % 2 === 0 ? 'light' : 'dark' }`;
                sq.dataset.row = r;
                sq.dataset.col = c;
                this.board.appendChild(sq);
            }
        }
    }
    
    updateStatus(msg) { this.status.textContent = msg; }
    gridIndex(r, c) { return (r + 1) * (this.boardSize + 1) + (c + 1); }

    bindEvents() {
        this.board.addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (!square) return;

            const row = +square.dataset.row;
            const col = +square.dataset.col;
            const nextRow = this.currentState.queens.length;
            
            if (row !== nextRow) {
                this.updateStatus(`Place the next queen in row ${nextRow + 1}.`);
                return;
            }
            if (!BoardState.isSafeGiven(this.currentState.queens, row, col)) {
                this.updateStatus(`That position attacks an existing queen.`);
                return;
            }
            this.currentState.queens.push(col);
            this.lastPlayedRow = row;
            this.backtracker.place(row, col);
            this.backtracker.row = row + 1;
            this.updateStatus('');
            this.render();
        });

        this.nextBtn.addEventListener('click', () => {
            const res = this.backtracker.step();
            this.currentState = this.backtracker.getState();

            if (res.kind === 'solution') {
                this.updateStatus('Solved! A solution has been found.');
            } else if (res.kind === 'backtrack') {
                this.updateStatus(`No safe column in row ${res.row + 2}, backtracking to row ${res.row + 1}.`);
            } else if (res.kind === 'place') {
                this.lastPlayedRow = res.row;
                this.updateStatus(`Placed queen in row ${res.row + 1}.`);
            } else if (res.kind === 'done') {
                this.updateStatus('Search finished. No more solutions.');
            }
            this.render();
        });

        this.resetBtn.addEventListener('click', () => {
            this.currentState = new BoardState();
            this.backtracker.reset();
            this.lastPlayedRow = null;
            this.updateStatus('');
            this.render();
        });
    }

    render() {
        const squares = this.board.querySelectorAll('.square');
        squares.forEach(sq => {
            sq.innerHTML = '';
            sq.classList.remove('highlight','row-focus');
        });

        const h = this.currentState.calculateHeuristic();
        if (this.heuristicValue) this.heuristicValue.textContent = h;

        this.currentState.queens.forEach((col, row) => {
            if (col === undefined) return;
            const idx = this.gridIndex(row, col);
            const target = this.board.children[idx];
            if (target) {
                target.innerHTML = '<div class="queen">♕</div>';
            }
        });

        // Highlight the most recently played row
        if (this.lastPlayedRow !== null) {
            for (let c = 0; c < this.boardSize; c++) {
                const idx = this.gridIndex(this.lastPlayedRow, c);
                const cell = this.board.children[idx];
                if (cell) cell.classList.add('row-focus');
            }
        }

        if (h > 0) {
            const q = this.currentState.queens.map((col, row) => ({ row, col })).filter(item=>item.col!==undefined);
            for (let i = 0; i < q.length; i++) {
                for (let j = i + 1; j < q.length; j++) {
                    const a = q[i], b = q[j];
                    const attacking = a.col === b.col || Math.abs(a.row - b.row) === Math.abs(a.col - b.col);
                    if (attacking) {
                        const idx1 = this.gridIndex(a.row, a.col);
                        const idx2 = this.gridIndex(b.row, b.col);
                        this.board.children[idx1]?.classList.add('highlight');
                        this.board.children[idx2]?.classList.add('highlight');
                    }
                }
            }
        }

        this.updateStateVector();
    }

    updateStateVector() {
        if (!this.stateVectorEl) return; // element missing; avoid errors
        const n = this.boardSize;
        const vec = this.currentState.queens;
        this.stateVectorEl.innerHTML = '';
        for (let i = 0; i < n; i++) {
            const li = document.createElement('li');
            const idx = document.createElement('span');
            idx.className = 'idx';
            idx.textContent = `queens[${i}]:`;
            const val = document.createElement('span');
            val.className = 'val';
            // Show column letter A-H if set, otherwise '-'
            val.textContent = (vec[i] !== undefined) ? ` ${String.fromCharCode(65 + vec[i])}` : ' -';
            li.appendChild(idx);
            li.appendChild(val);
            this.stateVectorEl.appendChild(li);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new GameUI());

