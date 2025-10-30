# Execution Instructions - Chess ML Application

## 📋 Complete Execution Sequence

Follow these steps in order to successfully run the ML-enhanced chess application:

---

## ✅ Step-by-Step Execution

### 1️⃣ Install Dependencies (Cell 0)
**Action**: Run the first cell
```python
!pip -q install chess ipywidgets pandas numpy scikit-learn tensorflow
```
**Expected Time**: 1-2 minutes  
**Expected Output**: Package installation messages (quiet mode)

---

### 2️⃣ Load Dataset (Cell 1)
**Action**: Run cell 1
```python
# Loads 500,000 chess positions from chessData.csv
```
**Expected Time**: 10-30 seconds  
**Expected Output**:
```
Loading chess evaluation dataset...
Dataset loaded: 500000 positions
Evaluation range: -2000 to 2000
Sample data:
[displays first 3 rows]
```

---

### 3️⃣ Define Feature Conversion (Cell 2)
**Action**: Run cell 2
```python
# Defines fen_to_features() function
```
**Expected Time**: < 1 second  
**Expected Output**:
```
Feature vector shape: (774,)
Sample features (first 20): [array of values]
Non-zero features: 38
```

---

### 4️⃣ Preprocess Data (Cell 3)
**Action**: Run cell 3
```python
# Converts FEN to features, splits data
```
**Expected Time**: 3-5 minutes  
**Expected Output**:
```
Converting FEN positions to features...
This may take a few minutes...

Feature matrix shape: (500000, 774)
Target vector shape: (500000,)
Evaluation range after clipping: -2000 to 2000

Training set size: 320000
Test set size: 80000

Data preprocessing complete!
```

---

### 5️⃣ Build Neural Network (Cell 4)
**Action**: Run cell 4
```python
# Creates the model architecture
```
**Expected Time**: < 1 second  
**Expected Output**:
```
Building neural network model...
Model: "sequential"
_________________________________________________________________
Layer (type)                Output Shape              Param #   
=================================================================
dense (Dense)               (None, 512)               396800    
dropout (Dropout)           (None, 512)               0         
dense_1 (Dense)             (None, 256)               131328    
...
=================================================================
Total params: 595,713
Trainable params: 595,713
Non-trainable params: 0

Model built successfully!
```

---

### 6️⃣ Train Model (Cell 5)
**Action**: Run cell 5
```python
# Trains the neural network
```
**Expected Time**: 10-20 minutes (CPU), 2-5 minutes (GPU)  
**Expected Output**:
```
Training the model...
This will take several minutes depending on your hardware...

Epoch 1/20
1000/1000 [==============================] - 45s 45ms/step - loss: 45000 - mae: 150 - val_loss: 30000 - val_mae: 120
Epoch 2/20
1000/1000 [==============================] - 43s 43ms/step - loss: 28000 - mae: 115 - val_loss: 25000 - val_mae: 105
...
Training complete!
```

**⚠️ IMPORTANT**: This is the longest step. Be patient!

---

### 7️⃣ Evaluate & Save Model (Cell 6)
**Action**: Run cell 6
```python
# Tests model and saves files
```
**Expected Time**: 10-20 seconds  
**Expected Output**:
```
Evaluating model on test set...

Test Set Performance:
Mean Squared Error (MSE): 18543.21
Mean Absolute Error (MAE): 95.67

Sample Predictions vs Actual:
  Predicted:  123.45 | Actual:  130.00 | Error:   6.55
  Predicted: -245.67 | Actual: -250.00 | Error:   4.33
  ...

Saving model and scaler...
Model saved as 'chess_eval_model.h5'
Scaler saved as 'chess_eval_scaler.pkl'
```

**✅ Checkpoint**: Verify files created:
- `chess_eval_model.h5` (~50 MB)
- `chess_eval_scaler.pkl` (~10 KB)

---

### 8️⃣ Load Model (Cell 7)
**Action**: Run cell 7
```python
# Loads the trained model for use
```
**Expected Time**: 2-5 seconds  
**Expected Output**:
```
Loading trained ML model for chess evaluation...
✓ ML model and scaler loaded successfully!
```

**❌ If Error**: If you see "ML model not found", go back and run cells 1-6

---

### 9️⃣ Launch Chess Application (Cell 8)
**Action**: Run cell 8
```python
# Starts the interactive chess game
```
**Expected Time**: < 1 second  
**Expected Output**:
```
============================================================
🤖 CHESS ENGINE WITH ML EVALUATION ACTIVE
   The AI will use the trained neural network to evaluate positions.
============================================================

[Interactive chess board appears below]
```

**🎮 You can now play chess!**

---

### 🔟 Test Evaluations (Cells 10-11) - OPTIONAL
**Action**: Run cells 10-11
```python
# Compares ML vs traditional evaluation
```
**Expected Time**: < 5 seconds  
**Expected Output**:
```
Testing evaluations on different chess positions:

Position: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
Board:
r n b q k b n r
p p p p p p p p
. . . . . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .
P P P P P P P P
R N B Q K B N R

ML Evaluation:          +15
Traditional Evaluation: +0
Difference:             15
============================================================
...
```

---

## 🎯 Quick Execution Summary

**Minimum Required Cells**: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

**Total Time Estimate**:
- Fast (GPU): ~15 minutes
- Normal (CPU): ~30 minutes

**Critical Cells**:
- **Cell 5**: Longest step (training)
- **Cell 6**: Creates model files
- **Cell 7**: Must succeed before Cell 8

---

## 🚨 Troubleshooting

### Problem: "ML model not found"
**Solution**: Run cells 1-7 in sequence before cell 8

### Problem: Training too slow
**Solution**: In Cell 1, change `nrows=500000` to `nrows=100000`

### Problem: Out of memory
**Solution**: 
- In Cell 1: Reduce `nrows` to 100000 or 50000
- In Cell 5: Change `batch_size=256` to `batch_size=128`

### Problem: TensorFlow errors
**Solution**: Restart kernel and run cells 0-8 again

### Problem: Chess board not appearing
**Solution**: Make sure ipywidgets is installed and enabled in Jupyter

---

## 📊 Expected Performance

After successful training:
- **MSE**: 15,000 - 25,000
- **MAE**: 80 - 120 centipawns
- **Training Accuracy**: Model should converge within 10-15 epochs

---

## 🎮 Playing the Game

Once Cell 8 is running:

1. **Select Mode**: "Vs AI" or "Two Players"
2. **Choose Color**: White or Black (if vs AI)
3. **Set Depth**: 2-5 (higher = stronger but slower)
4. **Click "Start/Reset"**
5. **Make Moves**: Click piece, then destination
6. **View Evaluation**: Status bar shows position score

---

## 📁 Files Generated

After successful execution:
```
Assignment 2/
├── Chess_Minimax.ipynb          (modified)
├── chess_eval_model.h5           (new, ~50 MB)
├── chess_eval_scaler.pkl         (new, ~10 KB)
├── README.md                     (new)
├── QUICK_START.md                (new)
├── IMPLEMENTATION_SUMMARY.md     (new)
└── EXECUTION_INSTRUCTIONS.md     (this file)
```

---

## ✅ Success Checklist

- [ ] All packages installed (Cell 0)
- [ ] Dataset loaded (Cell 1)
- [ ] Features conversion working (Cell 2)
- [ ] Data preprocessed (Cell 3)
- [ ] Model built (Cell 4)
- [ ] Model trained (Cell 5)
- [ ] Model saved (Cell 6)
- [ ] Model loaded successfully (Cell 7)
- [ ] Chess application running (Cell 8)
- [ ] Can make moves and play
- [ ] Status shows "ML" evaluation mode

---

## 🎉 You're Done!

If all cells executed successfully, you now have a fully functional chess application powered by machine learning!

**Next Steps**:
- Play against the AI
- Try different depths
- Compare ML vs traditional evaluation
- Experiment with training parameters

**Enjoy your ML-powered chess game! ♟️🤖**
