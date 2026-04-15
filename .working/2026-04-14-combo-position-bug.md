# Bug: Combo Key Positions Off by One

## Date
2026-04-14

## Issue Description
Bluetooth clear 3-key combos (Q+W+F and J+L+U) do not work despite proper configuration.

## Root Cause
The key position `#define` macros are off by one for the first two rows because they didn't account for the TAB key being at position 0.

### Evidence

**Row 1 (actual positions in keymap):**
```
Position:  0     1     2     3     4     5       6     7     8     9    10    11
Key:      TAB   Q     W     F     P     B       J     L     U     Y    SEMI  BSPC
```

**Defined positions (WRONG):**
```dts
#define K_Q      0     // Should be 1
#define K_W      1     // Should be 2
#define K_F      2     // Should be 3
#define K_J      5     // Should be 6
#define K_L      6     // Should be 7
#define K_U      7     // Should be 8
```

**Combo configuration:**
```dts
combo_bt_clear {
    bindings = <&bt BT_CLR>;
    key-positions = <K_Q K_W K_F>;  // Maps to <0 1 2> (TAB+Q+W)
    // Should be: <1 2 3> (Q+W+F)
};
```

### Impact
The `combo_bt_clear` combo is watching positions <0 1 2> which are TAB, Q, and W.
It should be watching positions <1 2 3> which are Q, W, and F.

Since TAB+Q+W is never pressed simultaneously, the combo never triggers.

## Solution
Correct all key position definitions by adding +1 to row 1 positions, adjusting row 2 accordingly.

Row 3 (shift row with mt LSHFT ESC at start) may also need similar correction.
