import numpy as np

i = np.array([0.000001,
0.000002,
0.000004,
0.000008,
0.000016,
0.000032,
0.000064,
0.000128,
0.000256,
0.000512,
0.001024,
0.002048,
0.004096])

u = np.array([
360,
379,
397,
414,
436,
449,
467,
474,
504,
522,
544,
567,
596,
])

a,b  = np.polyfit(u, i, 1)

slope = b / np.sqrt(np.sum((u - np.mean(u)) ** 2))
intercept = slope * np.sqrt(np.sum(u**2) / len(u))

print(a)
print(b)
print(intercept)

print(np.sqrt(slope**2 + intercept**2))