# System Architecture - Chess ML Application

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHESS ML APPLICATION                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         USER INTERFACE (Cell 8)         │
        │  • Interactive Chess Board (ipywidgets) │
        │  • Move Input & Validation              │
        │  • Game State Display                   │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │       GAME ENGINE (Minimax + α-β)       │
        │  • Search Algorithm (depth 2-5)         │
        │  • Move Ordering & Pruning              │
        │  • Best Move Selection                  │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      EVALUATION DISPATCHER              │
        │  • Checks ML_MODEL_AVAILABLE flag       │
        │  • Routes to ML or Traditional          │
        └─────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │   ML EVALUATION       │   │ TRADITIONAL EVAL      │
    │  • Load Model (Cell 7)│   │ • Piece Values        │
    │  • FEN → Features     │   │ • Piece-Square Tables │
    │  • Neural Network     │   │ • Material Count      │
    │  • Return Score       │   │ • Return Score        │
    └───────────────────────┘   └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  TRAINED MODEL        │
    │  (Cells 1-6)          │
    │  • Data Loading       │
    │  • Feature Extraction │
    │  • Model Training     │
    │  • Model Saving       │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  DATASET              │
    │  chessData.csv        │
    │  • 13M positions      │
    │  • FEN + Evaluations  │
    └───────────────────────┘
```

---

## 🔄 Data Flow

### Training Phase (Cells 1-6)

```
chessData.csv (500k positions)
        │
        ▼
┌───────────────────┐
│  Load Dataset     │  Cell 1
│  (pandas)         │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  FEN → Features   │  Cell 2-3
│  (774 dimensions) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Normalize &      │  Cell 3
│  Train/Test Split │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Build Neural Net │  Cell 4
│  (4 hidden layers)│
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Train Model      │  Cell 5
│  (20 epochs)      │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Evaluate & Save  │  Cell 6
│  • model.h5       │
│  • scaler.pkl     │
└───────────────────┘
```

### Inference Phase (Cell 8-9)

```
User Makes Move
        │
        ▼
┌───────────────────┐
│  Update Board     │
│  State            │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  AI Turn?         │
│  (Minimax Search) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Generate Legal   │
│  Moves            │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  For Each Move:   │
│  Evaluate Position│
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Board → FEN      │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  FEN → Features   │
│  (774 dims)       │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Normalize        │
│  (StandardScaler) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Neural Network   │
│  Prediction       │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Return Score     │
│  (centipawns)     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Select Best Move │
│  (highest score)  │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Execute Move     │
│  Update Display   │
└───────────────────┘
```

---

## 🧠 Neural Network Architecture

```
INPUT LAYER (774 neurons)
    │
    │  [Board State: 768]
    │  [Side to Move: 1]
    │  [Castling Rights: 4]
    │  [En Passant: 1]
    │
    ▼
┌─────────────────────┐
│  DENSE LAYER 1      │
│  512 neurons        │
│  ReLU activation    │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  DROPOUT (0.3)      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  DENSE LAYER 2      │
│  256 neurons        │
│  ReLU activation    │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  DROPOUT (0.3)      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  DENSE LAYER 3      │
│  128 neurons        │
│  ReLU activation    │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  DROPOUT (0.2)      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  DENSE LAYER 4      │
│  64 neurons         │
│  ReLU activation    │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  OUTPUT LAYER       │
│  1 neuron           │
│  Linear activation  │
└─────────────────────┘
    │
    ▼
EVALUATION SCORE (centipawns)
```

**Total Parameters**: 595,713
- Layer 1: 774 × 512 + 512 = 396,800
- Layer 2: 512 × 256 + 256 = 131,328
- Layer 3: 256 × 128 + 128 = 32,896
- Layer 4: 128 × 64 + 64 = 8,256
- Output: 64 × 1 + 1 = 65

---

## 🎯 Feature Engineering

### Board Representation (768 features)

```
For each of 64 squares:
    12 binary features (one-hot encoding)
    
    [0] White Pawn
    [1] White Knight
    [2] White Bishop
    [3] White Rook
    [4] White Queen
    [5] White King
    [6] Black Pawn
    [7] Black Knight
    [8] Black Bishop
    [9] Black Rook
    [10] Black Queen
    [11] Black King

Example: White Knight on e4
    Square 28 (e4): [0,1,0,0,0,0,0,0,0,0,0,0]
    All other squares: [0,0,0,0,0,0,0,0,0,0,0,0]
```

### Additional Features (6 features)

```
[768] Side to Move:           0 = White, 1 = Black
[769] White Kingside Castle:  0 = No, 1 = Yes
[770] White Queenside Castle: 0 = No, 1 = Yes
[771] Black Kingside Castle:  0 = No, 1 = Yes
[772] Black Queenside Castle: 0 = No, 1 = Yes
[773] En Passant Available:   0 = No, 1 = Yes
```

---

## 🔀 Evaluation Function Flow

```
evaluate_board(board)
        │
        ▼
    Is game over?
        │
    ┌───┴───┐
    │       │
   Yes      No
    │       │
    ▼       ▼
Return   ML Available?
±10000      │
        ┌───┴───┐
        │       │
       Yes      No
        │       │
        ▼       ▼
    ML Eval  Traditional
        │       Eval
        │       │
        └───┬───┘
            │
            ▼
    Return Score
    (centipawns)
```

---

## 🎮 Game Loop

```
┌─────────────────────────────────────┐
│  Initialize Game                    │
│  • Create Board                     │
│  • Set AI Color & Depth             │
│  • Load ML Model (if available)     │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Wait for User Input                │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  User Clicks Square                 │
└─────────────────────────────────────┘
            │
            ▼
    Is piece selected?
            │
        ┌───┴───┐
        │       │
       No      Yes
        │       │
        ▼       ▼
    Select   Move to
    Piece    Square
        │       │
        └───┬───┘
            │
            ▼
┌─────────────────────────────────────┐
│  Validate & Execute Move            │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Update Board Display               │
└─────────────────────────────────────┘
            │
            ▼
    Is game over?
            │
        ┌───┴───┐
        │       │
       Yes      No
        │       │
        ▼       ▼
    Show    AI Turn?
    Result      │
            ┌───┴───┐
            │       │
           Yes      No
            │       │
            ▼       │
    ┌───────────┐   │
    │  Minimax  │   │
    │  Search   │   │
    └───────────┘   │
            │       │
            ▼       │
    ┌───────────┐   │
    │  Execute  │   │
    │  AI Move  │   │
    └───────────┘   │
            │       │
            └───┬───┘
                │
                ▼
        Loop back to
        Wait for Input
```

---

## 📦 Module Dependencies

```
┌─────────────────────────────────────┐
│  Python Standard Library            │
│  • math, dataclasses, typing, os    │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Data Processing                    │
│  • pandas (data loading)            │
│  • numpy (array operations)         │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Machine Learning                   │
│  • tensorflow/keras (model)         │
│  • scikit-learn (preprocessing)     │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Chess & UI                         │
│  • chess (game logic)               │
│  • ipywidgets (interface)           │
│  • IPython.display (rendering)      │
└─────────────────────────────────────┘
```

---

## 🔧 Key Components

### 1. Feature Extractor
- **Function**: `fen_to_features(fen_string)`
- **Input**: FEN string
- **Output**: 774-dimensional numpy array
- **Purpose**: Convert chess position to ML-ready format

### 2. ML Evaluator
- **Function**: `evaluate_board_ml(board)`
- **Input**: chess.Board object
- **Output**: Integer (centipawns)
- **Purpose**: Use neural network for position evaluation

### 3. Traditional Evaluator
- **Function**: `evaluate_board_raw(board)`
- **Input**: chess.Board object
- **Output**: Integer (centipawns)
- **Purpose**: Fallback evaluation using piece-square tables

### 4. Unified Evaluator
- **Function**: `evaluate_board(board)`
- **Input**: chess.Board object
- **Output**: Integer (centipawns)
- **Purpose**: Route to ML or traditional evaluation

### 5. Search Algorithm
- **Function**: `minimax(board, depth, alpha, beta, ai_color)`
- **Input**: Board state, search parameters
- **Output**: (score, best_move)
- **Purpose**: Find optimal move using minimax with α-β pruning

### 6. Move Selector
- **Function**: `best_move(board, depth, ai_color)`
- **Input**: Board state, search depth, AI color
- **Output**: chess.Move object
- **Purpose**: Return the best move for AI

### 7. UI Manager
- **Class**: `ChessApp`
- **Purpose**: Handle user interaction and display
- **Methods**: 
  - `_render_board()`: Update visual display
  - `_play_human_move()`: Process user moves
  - `on_start()`: Initialize new game
  - `on_undo()`: Take back moves

---

## 💾 File Structure

```
Assignment 2/
│
├── archive/
│   └── chessData.csv              (13M positions)
│
├── Chess_Minimax.ipynb            (main application)
│   ├── Cell 0: Package installation
│   ├── Cell 1: Data loading
│   ├── Cell 2: Feature extraction
│   ├── Cell 3: Data preprocessing
│   ├── Cell 4: Model architecture
│   ├── Cell 5: Model training
│   ├── Cell 6: Model evaluation
│   ├── Cell 7: Model loading
│   ├── Cell 8: Chess application
│   └── Cells 10-11: Testing
│
├── chess_eval_model.h5            (trained model, ~50MB)
├── chess_eval_scaler.pkl          (feature scaler, ~10KB)
│
└── Documentation/
    ├── README.md
    ├── QUICK_START.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── EXECUTION_INSTRUCTIONS.md
    └── ARCHITECTURE.md            (this file)
```

---

## 🎯 Design Principles

1. **Modularity**: Separate concerns (UI, engine, evaluation, ML)
2. **Fallback System**: Graceful degradation if ML unavailable
3. **Clean Interfaces**: Simple function signatures
4. **Error Handling**: Try-except blocks for robustness
5. **User Feedback**: Clear status messages and indicators
6. **Performance**: Efficient feature extraction and caching
7. **Extensibility**: Easy to add new evaluation methods

---

This architecture provides a robust, maintainable, and extensible chess application with machine learning integration.
