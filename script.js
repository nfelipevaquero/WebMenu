const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform vec3 themeColor;

    float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        
        // Fondo de líneas verticales
        float pattern = abs(sin(uv.x * 30.0));
        vec3 col = vec3(0.01) * pattern;

        // Onda circular
        float dist = length(uv);
        float wave = sin(8.0 * dist - (time * 0.5)) * 0.4;
        float pulse = 0.008 / abs(dist + wave);

        // Mosaico de píxeles
        vec2 grid = floor(uv * 70.0);
        float n = noise(grid);
        float finalPulse = pulse * (0.6 + n * 0.5);

        // Colores Cian y Naranja de la imagen
        vec3 color1 = vec3(0.2, 0.8, 1.0); // Cian
        vec3 color2 = vec3(1.0, 0.5, 0.1); // Naranja
        vec3 base = mix(color1, color2, dist);
        
        // Mezclar con el color de la sección
        base = mix(base, themeColor, 0.2);

        col += base * finalPulse;
        gl_FragColor = vec4(col, 1.0);
    }
`;

function startShader(id, color) {
    const el = document.getElementById(id);
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    camera.position.z = 1;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    el.appendChild(renderer.domElement);

    const uniforms = {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() },
        themeColor: { value: new THREE.Color(color) }
    };

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
        uniforms, vertexShader, fragmentShader
    }));
    scene.add(mesh);

    function resize() {
        const w = el.clientWidth, h = el.clientHeight;
        renderer.setSize(w, h);
        uniforms.resolution.value.set(w, h);
    }
    window.addEventListener('resize', resize);
    resize();

    function anim(t) {
        uniforms.time.value = t * 0.002;
        renderer.render(scene, camera);
        requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
}

// Colores específicos para cada sección
startShader('shader-1', '#8000ff'); // Púrpura
startShader('shader-2', '#00ff80'); // Verde
startShader('shader-3', '#0080ff'); // Azul