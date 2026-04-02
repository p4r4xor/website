# Euler #786 (Billiard) — Research Notes

Research from the Project Euler forum threads for problems #786 and #202.

---

## Core Mathematical Insight

Both problems (#202 and #786) use the same fundamental technique:

### The Unfolding/Reflection Trick

Instead of tracing a ball bouncing off walls, **reflect the entire table** across each wall
the ball would hit. The ball's path becomes a **straight line** through a tiled plane of
reflected copies of the table.

For #786:
- The quadrilateral (120°, 90°, 60°, 90°) tiles the plane into a **regular hexagonal lattice**
  when repeatedly reflected
- Vertices of hexagons correspond to corner A
- Centers of hexagons correspond to corner C
- Midpoints of hexagon edges correspond to corners B or D

### Coordinate System

Using vectors `2·AB` and `2·AD` as the basis:
- A valid return path to A corresponds to a point `(a, b)` where:
  1. `a + b ≡ 0 (mod 3)` — ensures the endpoint is an A-type vertex
  2. `gcd(a, b) = 1` — ensures the path doesn't pass through another A on the way
  3. `a, b > 0`

If `a + b ≡ 1 (mod 3)`, the midpoint would hit a vertex (invalid).
If `a + b ≡ 2 (mod 3)`, the path would reach C (invalid).

### Counting Bounces

For a path to point `(a, b)`, the number of bounces comes from counting how many
edges of the tiled lattice the straight line crosses. There are two types of edges:

**Type 1: Triangle-grid edges** (easier)
- Edges orthogonal to `AD`: `(2a - b) / 3`
- Edges orthogonal to `AB`: `|−a + 2b| / 3`
- Edges orthogonal to `AB + AD`: `(a + b) / 3`

**Type 2: Hexagon edges** (harder)
- Depends on `b mod 3`:
  - If `b ≡ 1 (mod 3)`: `(2a - 4) / 3`
  - If `b ≡ 2 (mod 3)`: `(2a - 5) / 3`
- This was the hardest part — several solvers brute-forced patterns to discover this

Total bounces = sum of all crossings for both edge types.

### The Counting Problem

Given B(N), we need to count pairs `(a, b)` where:
- `a, b > 0`
- `gcd(a, b) = 1`
- `a + b ≡ 0 (mod 3)`
- `bounces(a, b) ≤ N`

By symmetry, can assume `a > b` and multiply by 2 (plus handle the symmetric case).

For a fixed `a + b = k`, the valid points form an **interval** (because the bounce
function is unimodal along each diagonal). This means binary search works.

### Solution Approaches (from forum)

**Approach 1: O(N log N) — hos-lyric (first solver)**
- Iterate through `b`, use inclusion-exclusion on prime factors of `b` for coprimality
- 11 minutes runtime

**Approach 2: O(N^{3/4}) — semiexp**
- Reformulate as a lattice point counting problem
- Use Möbius function partial sums (Mertens function) with `O(N^{3/4})` sublinear algorithm
- Key reformulation: count lattice points in region `18x + 10y ≤ 3N + 6` with coprimality
- Uses Yanagisawa's algorithm for lattice point counting in rational polygons
- 22 seconds in Python

**Approach 3: O(N^{2/3}) — ecnerwala**
- Same core idea as semiexp but with sieved Mertens computation
- CRT with multiple modular computations for exact large integer result

### Key Formula (from semiexp's code)

```python
# The core computation reduces to:
# For each (a, b, g) in the "sqrt trick" iteration over 3*N+6:
#   q = calcN(18, 10, g) - calcN(18, 30, g)
#   z += (mertens3(b) - mertens3(a-1)) * q
# answer = z * 4 + 2
```

Where:
- `calcN(a, b, c)` counts lattice points `ax + by ≤ c, x > 0, y > 0`
  using Yanagisawa's recursive algorithm
- `mertens3(n)` = sum of Möbius function for `k ≤ n` where `k` is not divisible by 3
- The sqrt trick iterates over `O(√N)` distinct values of `⌊N/j⌋`

### Asymptotic Behavior

```
B(N) / N² → 9 / (20π²) ≈ 0.045594532639051997...
```

This comes from:
- Probability of two numbers being coprime: `6/π²`
- Excluding multiples of 3: multiply by `3/4` → `9/(2π²)`
- The lattice region scaling: divide by 10

---

## Connection to Problem #202 (Laserbeam)

Problem #202 is about a laser beam bouncing inside an **equilateral triangle** and
hitting a specific corner after exactly N reflections.

The core technique is identical:
1. Unfold the triangle into a triangular lattice
2. Count visible lattice points (coprime coordinates)
3. Apply Möbius inversion for the coprimality constraint

The main formula for #202:
```
For n reflections, count integers coprime with (n+3)/2 that satisfy mod conditions.
Uses Euler's totient and Möbius function.
```

Key paper referenced: **Baxter & Umble** — about periodic billiard orbits in triangles.
Paper link from forum: https://arxiv.org/PS_cache/math/pdf/0509/0509292v7.pdf

Problem #786 generalizes this from a triangle to a quadrilateral, which is why the
hexagonal lattice appears instead of a simple triangular one.

---

## References from Forum Discussions

### Papers & Academic

1. **Baxter & Umble** — "Periodic orbits of billiards on an equilateral triangle"
   - https://arxiv.org/abs/math/0509292
   - Also available at: https://sites.millersville.edu/rumble/Math.355/Book/Chapter%205.pdf
   - Key paper for the unfolding technique; directly referenced by multiple solvers
   - One solver's bug came from Baxter & Umble summing over *proper* divisors while
     Mathematica's `Divisors` gives *all* divisors

2. **Yanagisawa** — "A Simple Algorithm for Lattice Point Counting in Rational Polygons"
   - Used in semiexp's O(N^{3/4}) solution for the `calcN` function
   - Recursive algorithm to count points `ax + by ≤ c, x > 0, y > 0`

### Wikipedia / Encyclopedia

3. **Eisenstein integers** — https://en.wikipedia.org/wiki/Eisenstein_integer
   - Complex number representation of the hexagonal lattice; `ω = e^{2πi/3}`
   - Natural coordinate system for the hex tiling that appears in #786

4. **Euclid's orchard** — https://en.wikipedia.org/wiki/Euclid%27s_orchard
   - Visual analogy: which trees in an orchard can you see from the origin?
   - Same as "visible lattice points" = coprime coordinate pairs

5. **Jacobsthal numbers** — https://en.wikipedia.org/wiki/Jacobsthal_number
   - OEIS: https://oeis.org/A001045
   - Appear in the triangle unfolding for problem #202

6. **Legendre sieve** — https://en.wikipedia.org/wiki/Legendre_sieve
   - Used by some solvers for the coprimality counting step

7. **Mertens function** — https://en.wikipedia.org/wiki/Mertens_function
   - Partial sums of the Möbius function
   - Sublinear computation in O(N^{2/3}) or O(N^{3/4}) is the key to fast solutions

8. **Farey sequences** — https://en.wikipedia.org/wiki/Farey_sequence
   - Related to enumeration of coprime pairs in order

### Visualizations & Interactive Demos

9.  **Billiard reflections visualization** — https://bl.ocks.org/bmershon/231160f11b33ac780bd86b5a7e891576
10. **GeoGebra interactive billiard** — https://www.geogebra.org/m/ege7nrhf
11. **Solution diagram** — https://drive.google.com/file/d/1xyP4FFUCJqw_PUk3vhY_GSU2uhWda9IU/view

### Key Mathematical Concepts Used Across Both Problems

From **#202 forum** (7 pages, older problem, more discussion):
- Möbius inversion / Euler's totient for coprime counting
- Inclusion-exclusion on prime factors
- Barycentric coordinate system for reflections
- Eisenstein integers (hex lattice as complex numbers)
- Legendre sieve for coprimality
- Jacobsthal numbers (triangle unfolding)
- Euclid's orchard (visible lattice point analogy)

From **#786 forum** (1 page, newer problem, more advanced solutions):
- Hexagonal lattice tiling from quadrilateral reflections
- Unimodal structure of bounce counts along diagonals
- Sublinear Mertens function computation
- Yanagisawa's lattice point counting algorithm
- Euclidean algorithm for mod-3 edge crossing counts (Doraki's approach)
- CRT (Chinese Remainder Theorem) for exact large integer computation (ecnerwala)

---

## Verified Answers

```
B(10)    = 6
B(100)   = 478
B(1000)  = 45790
B(10^9)  = 45594532839912702
B(10^10) = 4559453265670797266
B(10^11) = 455945326410334137998
B(10^12) = 45594532639236510886986
B(10^13) = 4559453263907092537707722
```

---

## Summary: How to Solve It (for the blog)

1. **Draw it** — Visualize the table, trace a few paths by hand
2. **Unfold it** — Reflect the table, see the hexagonal tiling emerge
3. **Realize it's lattice counting** — Straight lines to lattice points with coprimality
4. **Count the bounces** — The hard part: counting edge crossings (two types)
5. **Brute force the pattern** — Print values, discover the unimodal structure
6. **Reformulate** — Reduce to `18x + 10y ≤ 3N + 6` with Möbius constraints
7. **Use sublinear Mertens** — O(N^{3/4}) or O(N^{2/3}) for the final computation
