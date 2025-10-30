# Chess Game with Machine Learning Evaluation

## Overview
This project implements a chess-playing application that uses a machine learning-based evaluation system instead of the traditional Minimax algorithm with piece-square tables. The ML model is trained on a large dataset of chess positions with their corresponding evaluation scores.

## Demo Screenshots
<img width="810" height="507" alt="Screenshot 2025-10-30 at 1 51 14 PM" src="https://github.com/user-attachments/assets/3a317983-84dd-4bbe-9ed3-f4a5597f5a65" />

<img width="807" height="503" alt="Screenshot 2025-10-30 at 1 52 17 PM" src="https://github.com/user-attachments/assets/0dbbc200-5a45-4fd0-93fd-2ae3f11c1096" />

<img width="806" height="504" alt="Screenshot 2025-10-30 at 1 54 02 PM" src="https://github.com/user-attachments/assets/565577c7-58e6-43c2-bf96-58e4f88f34c9" />

<img width="803" height="505" alt="Screenshot 2025-10-30 at 1 55 46 PM" src="https://github.com/user-attachments/assets/16fa9dd5-c572-48df-808f-d4a568a2ce37" />

<img width="795" height="507" alt="Screenshot 2025-10-30 at 1 56 44 PM" src="https://github.com/user-attachments/assets/8af305f7-b4e8-4099-892c-b164a4d36c5e" />


## Features
- **ML-Based Position Evaluation**: Neural network trained on 500,000+ chess positions
- **Interactive Chess Board**: Play against AI or in two-player mode
- **Flexible AI Depth**: Adjustable search depth (2-5 moves ahead)
- **Real-time Evaluation Display**: Shows position evaluation in centipawns
- **Fallback System**: Automatically uses traditional evaluation if ML model is not available

## Dataset
- **Source**: Chess Evaluations Dataset (`chessData.csv`)
- **Format**: FEN positions with numerical evaluation scores
- **Size**: ~13 million positions (500k used for training)
- **Evaluation Range**: Clipped to [-2000, +2000] centipawns

## Model Architecture

### Neural Network Structure
```
Input Layer:    774 features
Hidden Layer 1: 512 neurons (ReLU) + Dropout (0.3)
Hidden Layer 2: 256 neurons (ReLU) + Dropout (0.3)
Hidden Layer 3: 128 neurons (ReLU) + Dropout (0.2)
Hidden Layer 4: 64 neurons (ReLU)
Output Layer:   1 neuron (position evaluation)
```

### Feature Representation (774 features total)
1. **Board State** (768 features): 64 squares × 12 piece types (one-hot encoding)
   - 6 piece types (Pawn, Knight, Bishop, Rook, Queen, King)
   - 2 colors (White, Black)
2. **Side to Move** (1 feature): 0 for White, 1 for Black
3. **Castling Rights** (4 features): White kingside, White queenside, Black kingside, Black queenside
4. **En Passant** (1 feature): Whether en passant is available

### Training Configuration
- **Optimizer**: Adam (learning rate: 0.001)
- **Loss Function**: Mean Squared Error (MSE)
- **Metrics**: Mean Absolute Error (MAE)
- **Batch Size**: 256
- **Epochs**: 20 (with early stopping)
- **Validation Split**: 20%
- **Test Split**: 20%

## How to Use

### Step 1: Install Dependencies
Run the first cell to install required packages:
```python
!pip -q install chess ipywidgets pandas numpy scikit-learn tensorflow
```

### Step 2: Train the Model
Execute cells 2-7 in sequence:
1. **Cell 2**: Load the chess evaluation dataset
2. **Cell 3**: Define FEN to features conversion function
3. **Cell 4**: Preprocess data and create train/test splits
4. **Cell 5**: Build neural network model
5. **Cell 6**: Train the model
6. **Cell 7**: Evaluate model performance and save

This will create two files:
- `chess_eval_model.h5` - The trained neural network
- `chess_eval_scaler.pkl` - Feature scaler for normalization

### Step 3: Load Model and Play
Execute cells 8-9:
1. **Cell 8**: Load the trained model
2. **Cell 9**: Launch the interactive chess application

### Step 4: Test and Compare (Optional)
Execute cells 11-12 to compare ML evaluation with traditional evaluation on specific positions.

## Key Functions

### `fen_to_features(fen_string)`
Converts a FEN position string to a 774-dimensional feature vector suitable for the neural network.

### `evaluate_board_ml(board)`
Uses the trained neural network to evaluate a chess position. Returns evaluation in centipawns from White's perspective.

### `evaluate_board_raw(board)`
Traditional evaluation using piece values and piece-square tables. Used as fallback when ML model is unavailable.

### `evaluate_board(board)`
Unified evaluation function that automatically uses ML evaluation if available, otherwise falls back to traditional evaluation.

## Performance Metrics

The model's performance is measured using:
- **Mean Squared Error (MSE)**: Measures average squared difference between predicted and actual evaluations
- **Mean Absolute Error (MAE)**: Measures average absolute difference in centipawns

Expected performance after training:
- MSE: ~15,000-25,000
- MAE: ~80-120 centipawns

## Game Interface

### Controls
- **Mode**: Choose between "Vs AI" or "Two Players"
- **You**: Select your color (White/Black) when playing vs AI
- **AI Depth**: Set search depth (2-5 moves)
- **Start/Reset**: Begin a new game
- **Undo**: Take back moves
- **Flip**: Flip board orientation

### Status Display
The status bar shows:
- Current turn
- Check status
- Position evaluation in centipawns
- Evaluation mode (ML or Traditional)

## Technical Details

### Minimax Search
The AI uses minimax search with alpha-beta pruning:
- Searches to specified depth (2-5 moves)
- Uses ML evaluation at leaf nodes
- Implements move ordering for better pruning
- Prioritizes captures and checks

### Move Ordering Heuristics
1. Captures (MVV-LVA: Most Valuable Victim - Least Valuable Attacker)
2. Promotions
3. Checks

## Files Generated
- `chess_eval_model.h5` - Trained neural network model
- `chess_eval_scaler.pkl` - StandardScaler for feature normalization
- `README.md` - This documentation file

## Requirements
- Python 3.7+
- chess
- ipywidgets
- pandas
- numpy
- scikit-learn
- tensorflow

## Notes
- Training time depends on hardware (CPU: 10-20 minutes, GPU: 2-5 minutes)
- The model uses 500k positions for faster training; increase `nrows` parameter for better accuracy
- Position evaluation is from White's perspective (positive = White advantage)
- The application automatically detects if ML model is available and falls back to traditional evaluation if needed

## Future Improvements
- Train on full dataset (13M positions) for better accuracy
- Implement opening book for faster early-game play
- Add endgame tablebases for perfect endgame play
- Implement iterative deepening for time management
- Add position visualization and analysis tools
