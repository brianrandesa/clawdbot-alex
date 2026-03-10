---
name: workout-journal-reader
description: Accurately read and interpret handwritten workout journal entries, exercise logs, and training data. Use when analyzing workout numbers, sets, reps, weights, or progression tracking from photos or logs.
---

# Workout Journal Reader

This skill provides systematic approaches for accurately reading and interpreting workout journal entries, handwritten training logs, and exercise data.

## When to Use This Skill

- Reading handwritten workout journals from photos
- Interpreting exercise logs with sets, reps, and weights
- Analyzing training progression data
- Extracting workout numbers from training entries
- Verifying exercise performance metrics

## Core Reading Principles

### 1. Systematic Scanning
Read workout entries in this order:
1. **Date/Header** - Confirm the workout date and type
2. **Exercise Names** - Identify each movement clearly  
3. **Weight Progression** - Read weights left to right, set by set
4. **Rep Counts** - Read reps for each set, matching to weights
5. **Additional Notes** - Check for RPE, rest times, or comments

### 2. Number Verification
When reading weights and reps:
- **Double-check ambiguous numbers** (6 vs 8, 185 vs 188)
- **Confirm units** (lbs vs kg, typically lbs unless noted)
- **Read sets sequentially** (Set 1, Set 2, Set 3, etc.)
- **Match reps to weights** for each set

### 3. Common Handwriting Patterns
- **"5" often looks like "S"** in rushed handwriting
- **"8" and "6"** can be similar - look for closed vs open loops
- **"1" and "7"** - check for crosshatch on 7
- **"0" and "O"** - zeros are typically more rounded
- **Crossed out numbers** indicate failed attempts or corrections

## Reading Methodology

### Step 1: Identify Layout
Determine journal format:
- **Tabular** (rows/columns with headers)
- **List format** (exercise name followed by sets)
- **Block format** (exercises grouped by muscle group)

### Step 2: Parse Exercise Entries
For each exercise, extract:
- **Exercise name** (exact spelling/abbreviation)
- **Working weight** for each set
- **Repetitions** achieved for each set
- **Number of sets** completed

### Step 3: Verify Progression Logic
Check if numbers make logical sense:
- **Warm-up sets** should progress upward in weight
- **Working sets** typically at similar weights
- **Drop sets** should decrease in weight
- **Rep ranges** should align with typical training (1-20 reps)

## Common Exercise Abbreviations

| Written | Exercise |
|---------|----------|
| BB | Barbell |
| DB | Dumbbell |
| Squat | Back Squat |
| Bench | Bench Press |
| DL | Deadlift |
| OHP | Overhead Press |
| Lat PD | Lat Pulldown |
| Leg Ext | Leg Extension |
| Leg Curl | Leg Curl |

## Error Prevention

### Red Flags to Double-Check
- **Massive weight jumps** between sessions (>50 lbs)
- **Impossible rep ranges** (40+ reps on heavy compound movements)  
- **Inconsistent progressions** (going backwards without reason)
- **Mixed units** (kg mixed with lbs)

### When Uncertain
- **State what you can read clearly**
- **Flag ambiguous numbers**: "Could be 185 or 188"
- **Ask for clarification** on unclear entries
- **Don't guess** - accuracy over completion

## Reporting Format

When analyzing workout data, report:

```
Exercise: [Name]
Last session: [Weight] x [Reps] 
This session: [Weight] x [Reps]
Progress: [+/- weight] lbs, [+/- reps] reps
```

## Example Reading

Input: Handwritten "Bench 185x8, 185x6, 155x10"
Output: 
- Exercise: Bench Press
- Set 1: 185 lbs x 8 reps
- Set 2: 185 lbs x 6 reps  
- Set 3: 155 lbs x 10 reps
- Analysis: Working weight 185 lbs, drop set to 155 lbs

## Quality Checks

Before finalizing readings:
1. **Re-read all numbers** for accuracy
2. **Verify progression logic** makes sense
3. **Check math** if totals are provided
4. **Confirm exercise identification**
5. **Flag any uncertainties** clearly