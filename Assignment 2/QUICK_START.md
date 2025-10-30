# Quick Start Guide - Chess ML Application

## 🚀 Getting Started in 3 Steps

### Step 1: Run Installation Cell
Execute the first cell in the notebook to install all dependencies:
```python
!pip -q install chess ipywidgets pandas numpy scikit-learn tensorflow
```

### Step 2: Train the Model
Run cells 2-7 sequentially. This will:
- Load 500,000 chess positions from the dataset
- Convert FEN positions to numerical features
- Train a neural network (takes 10-20 minutes on CPU)
- Save the trained model

**Expected Output:**
```
Dataset loaded: 500000 positions
Training set size: 320000
Test set size: 80000
Test MSE: ~20000
Test MAE: ~100 centipawns
Model saved as 'chess_eval_model.h5'
```

### Step 3: Play Chess!
Run cells 8-9 to launch the interactive chess application.

## 🎮 How to Play

1. **Choose Mode**: "Vs AI" or "Two Players"
2. **Select Color**: Pick White or Black (vs AI mode)
3. **Set AI Depth**: 2-5 moves (higher = stronger but slower)
4. **Click "Start/Reset"** to begin
5. **Make Moves**: Click a piece, then click destination square
6. **View Evaluation**: Status bar shows position score

## 📊 Understanding Evaluations

- **Positive values**: White is winning
- **Negative values**: Black is winning
- **~100 centipawns**: Approximately 1 pawn advantage
- **±1000+**: Significant material advantage
- **±10000**: Checkmate

## 🔧 Troubleshooting

### Model Not Loading?
If you see "ML model not found" message:
1. Make sure you ran cells 2-7 to train the model
2. Check that `chess_eval_model.h5` exists in the directory
3. The app will work with traditional evaluation as fallback

### Training Taking Too Long?
Reduce the dataset size in Cell 2:
```python
df = pd.read_csv('archive/chessData.csv', nrows=100000)  # Use 100k instead of 500k
```

### Out of Memory?
Reduce batch size in Cell 6:
```python
history = model.fit(
    X_train_scaled, y_train,
    batch_size=128,  # Reduce from 256 to 128
    ...
)
```

## 📁 Files Created

After training, you'll have:
- `chess_eval_model.h5` - The trained neural network (large file ~50MB)
- `chess_eval_scaler.pkl` - Feature normalization scaler
- `README.md` - Full documentation
- `QUICK_START.md` - This guide

## 🎯 Tips for Better Play

1. **Higher Depth = Stronger AI**: But slower to compute
   - Depth 2: Fast, beginner level
   - Depth 3: Moderate, intermediate level
   - Depth 4-5: Slow, advanced level

2. **Use Undo**: Made a mistake? Click "Undo" to take back moves

3. **Flip Board**: Click "Flip" to change perspective

4. **Watch Evaluation**: The evaluation score helps you understand who's winning

## 🧪 Testing the Model

Run cells 11-12 to compare ML vs traditional evaluation on test positions.

## ⚡ Performance Notes

- **Training Time**: 
  - CPU: 10-20 minutes
  - GPU: 2-5 minutes

- **Inference Time**: 
  - ML evaluation: ~10-20ms per position
  - Traditional evaluation: ~1ms per position

- **AI Move Time** (depth 3):
  - Opening: 1-3 seconds
  - Midgame: 3-10 seconds
  - Endgame: 1-5 seconds

## 📚 Next Steps

1. Try different AI depths to find your preferred balance
2. Compare ML vs traditional evaluation on various positions
3. Experiment with training on more data (increase `nrows`)
4. Challenge the AI and see if you can beat it!

## 🆘 Need Help?

Check the full `README.md` for detailed documentation on:
- Model architecture
- Feature engineering
- Training configuration
- Technical details

---

**Enjoy your ML-powered chess game! ♟️🤖**
