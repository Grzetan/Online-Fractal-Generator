# Online fractal generator

App must be run on web server, you can't simply open index.html.

```bash
npm install -g live-server
```

In main directory:
```bash
live-server
```

then open http://localhost:8000 and select `main.html`

Generating random fractals:
1. Generate the highest degree
2. For each component smaller then highest degree generate random coefficient (this can be number or trygonometric function)
3. Calculate the derivative.
4. Generate random amount of additional parameters
5. For each parameter there will be a % to add it to each coefficient and % of operation to apply